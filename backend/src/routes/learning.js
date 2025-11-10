const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../middleware/errorHandler");
const { authenticateToken } = require("../middleware/auth");
const Enrollment = require("../models/Enrollment");
const logger = require("../utils/logger");

// POST /api/learning/start
router.post(
  "/start",
  asyncHandler(async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user._id;
    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing courseId" });
    }
    const enrollment = await Enrollment.findOne({
      user: userId,
      itemId: courseId,
    });
    if (!enrollment) {
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });
    }
    enrollment.lastAccessed = new Date();
    await enrollment.save();
    logger.info(`[Learning] User ${userId} started course ${courseId}`);
    res.json({ success: true, message: "Learning session started" });
  })
);

// POST /api/learning/complete
router.post(
  "/complete",
  asyncHandler(async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user._id;
    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing courseId" });
    }
    const enrollment = await Enrollment.findOne({
      user: userId,
      itemId: courseId,
    });
    if (!enrollment) {
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });
    }
    if (enrollment.status === "completed") {
      return res.json({ success: true, message: "Course already completed" });
    }
    enrollment.status = "completed";
    enrollment.completedAt = new Date();
    enrollment.progressPercent = 100;
    await enrollment.save();
    logger.info(`[Learning] User ${userId} completed course ${courseId}`);
    res.json({ success: true, message: "Course marked as completed" });
  })
);

module.exports = router;
