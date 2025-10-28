const express = require("express");
const router = express.Router();
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const { authenticateToken } = require("../middleware/auth");
const Enrollment = require("../models/Enrollment");
const mongoose = require("mongoose");

// Get enrollment detail (only owner, seller or admin can access)
router.get(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const enrollment = await Enrollment.findById(id)
      .populate("user", "username email firstName lastName")
      .populate("itemId", "title link")
      .populate("seller", "username email firstName lastName");

    if (!enrollment)
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });

    const userId = req.user._id.toString();
    const ownerId = String(
      enrollment.user && enrollment.user._id
        ? enrollment.user._id
        : enrollment.user
    );
    const sellerId = String(
      enrollment.seller && enrollment.seller._id
        ? enrollment.seller._id
        : enrollment.seller
    );

    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      if (userId !== ownerId && userId !== sellerId) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }
    }

    res.json({ success: true, data: { enrollment } });
  })
);

// Update enrollment status (seller or admin) - status is managed manually by partner via dropdown
router.patch(
  "/:id/status",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;

    const allowed = ["in_progress", "completed", "expired"];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const enrollment = await Enrollment.findById(id);
    if (!enrollment)
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });

    const userId = req.user._id.toString();
    const sellerId = String(
      enrollment.seller && enrollment.seller._id
        ? enrollment.seller._id
        : enrollment.seller
    );

    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      if (userId !== sellerId) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }
    }

    // Once completed, status is final and cannot be changed
    if (String(enrollment.status) === "completed") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Status is final and cannot be changed",
        });
    }

    enrollment.status = status;
    if (status === "completed") {
      enrollment.completedAt = enrollment.completedAt || new Date();
    } else {
      // clearing completedAt when moved away from completed (only possible before it's completed)
      enrollment.completedAt = null;
    }

    enrollment.lastAccessed = new Date();
    await enrollment.save();

    const populated = await Enrollment.findById(id)
      .populate("user", "username email firstName lastName")
      .populate("itemId", "title link")
      .populate("seller", "username email firstName lastName");

    res.json({ success: true, data: { enrollment: populated } });
  })
);

// Partner or seller can add an assessment/score item to an enrollment
router.post(
  "/:id/assessments",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { title, score } = req.body;

    if (!title || typeof title !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Title is required" });
    }
    const nScore = Number(score);
    if (Number.isNaN(nScore) || nScore < 0 || nScore > 10) {
      return res.status(400).json({
        success: false,
        message: "Score must be a number between 0 and 10",
      });
    }

    const enrollment = await Enrollment.findById(id);
    if (!enrollment)
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });

    // Do not allow deleting assessments when enrollment is completed
    if (String(enrollment.status) === "completed") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Cannot delete assessments when enrollment is completed",
        });
    }

    const userId = req.user._id.toString();
    const sellerId = String(
      enrollment.seller && enrollment.seller._id
        ? enrollment.seller._id
        : enrollment.seller
    );

    // only seller (owner of course) or admin can add assessments
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      if (userId !== sellerId) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }
    }

    // Do not allow editing assessments when enrollment is completed
    if (String(enrollment.status) === "completed") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Cannot update assessments when enrollment is completed",
        });
    }

    // ensure metadata.assessments array
    enrollment.metadata = enrollment.metadata || {};
    if (!Array.isArray(enrollment.metadata.assessments))
      enrollment.metadata.assessments = [];

    // Do not allow adding assessments when enrollment is completed
    if (String(enrollment.status) === "completed") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Cannot add assessment when enrollment is completed",
        });
    }

    const entry = {
      _id: new mongoose.Types.ObjectId(),
      title: title.trim(),
      score: nScore,
      createdBy: req.user._id,
      createdAt: new Date(),
    };

    enrollment.metadata.assessments.push(entry);

    // compute totalPoints as sum of scores and progressPercent as average (score/10 -> percent)
    const scores = enrollment.metadata.assessments.map(
      (a) => Number(a.score) || 0
    );
    const totalPoints = scores.reduce((s, v) => s + v, 0);
    const avg = scores.length ? totalPoints / scores.length : 0;
    const progressPercent = Math.round((avg / 10) * 100);

    enrollment.totalPoints = totalPoints;
    enrollment.progressPercent = progressPercent;
    // NOTE: status is managed manually via dropdown; do NOT auto-set to completed here

    enrollment.lastAccessed = new Date();

    await enrollment.save();

    const populated = await Enrollment.findById(id)
      .populate("user", "username email firstName lastName")
      .populate("itemId", "title link")
      .populate("seller", "username email firstName lastName");

    res.json({ success: true, data: { enrollment: populated } });
  })
);

// Update an assessment (by assessment _id) - seller or admin only
router.put(
  "/:id/assessments/:aid",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const aid = req.params.aid;
    const { title, score } = req.body;

    if (!title || typeof title !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Title is required" });
    }
    const nScore = Number(score);
    if (Number.isNaN(nScore) || nScore < 0 || nScore > 10) {
      return res.status(400).json({
        success: false,
        message: "Score must be a number between 0 and 10",
      });
    }

    const enrollment = await Enrollment.findById(id);
    if (!enrollment)
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });

    const userId = req.user._id.toString();
    const sellerId = String(
      enrollment.seller && enrollment.seller._id
        ? enrollment.seller._id
        : enrollment.seller
    );

    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      if (userId !== sellerId) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }
    }

    enrollment.metadata = enrollment.metadata || {};
    const assessments = Array.isArray(enrollment.metadata.assessments)
      ? enrollment.metadata.assessments
      : [];
    const idx = assessments.findIndex((a) => String(a._id) === String(aid));
    if (idx === -1)
      return res
        .status(404)
        .json({ success: false, message: "Assessment not found" });

    assessments[idx].title = title.trim();
    assessments[idx].score = nScore;
    assessments[idx].updatedAt = new Date();

    // recompute totals (status is not auto-managed)
    const scores = assessments.map((a) => Number(a.score) || 0);
    const totalPoints = scores.reduce((s, v) => s + v, 0);
    const avg = scores.length ? totalPoints / scores.length : 0;
    const progressPercent = Math.round((avg / 10) * 100);

    enrollment.metadata.assessments = assessments;
    enrollment.totalPoints = totalPoints;
    enrollment.progressPercent = progressPercent;

    enrollment.lastAccessed = new Date();
    await enrollment.save();

    const populated = await Enrollment.findById(id)
      .populate("user", "username email firstName lastName")
      .populate("itemId", "title link")
      .populate("seller", "username email firstName lastName");

    res.json({ success: true, data: { enrollment: populated } });
  })
);

// Delete an assessment by id
router.delete(
  "/:id/assessments/:aid",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const aid = req.params.aid;

    const enrollment = await Enrollment.findById(id);
    if (!enrollment)
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });

    const userId = req.user._id.toString();
    const sellerId = String(
      enrollment.seller && enrollment.seller._id
        ? enrollment.seller._id
        : enrollment.seller
    );

    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      if (userId !== sellerId) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }
    }

    enrollment.metadata = enrollment.metadata || {};
    const assessments = Array.isArray(enrollment.metadata.assessments)
      ? enrollment.metadata.assessments
      : [];
    const filtered = assessments.filter((a) => String(a._id) !== String(aid));
    if (filtered.length === assessments.length)
      return res
        .status(404)
        .json({ success: false, message: "Assessment not found" });

    // recompute
    const scores = filtered.map((a) => Number(a.score) || 0);
    const totalPoints = scores.reduce((s, v) => s + v, 0);
    const avg = scores.length ? totalPoints / scores.length : 0;
    const progressPercent = Math.round((avg / 10) * 100);

    enrollment.metadata.assessments = filtered;
    enrollment.totalPoints = totalPoints;
    enrollment.progressPercent = progressPercent;
    // Status is managed manually via the PATCH /:id/status endpoint by seller/admin.
    // Do NOT auto-set enrollment.status to "completed" here when assessments change.

    enrollment.lastAccessed = new Date();
    await enrollment.save();

    const populated = await Enrollment.findById(id)
      .populate("user", "username email firstName lastName")
      .populate("itemId", "title link")
      .populate("seller", "username email firstName lastName");

    res.json({ success: true, data: { enrollment: populated } });
  })
);

module.exports = router;
