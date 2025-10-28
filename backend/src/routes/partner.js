const express = require("express");
const router = express.Router();
const PartnerCourse = require("../models/PartnerCourse");
const { asyncHandler } = require("../middleware/errorHandler");
const { authenticateToken, authorize } = require("../middleware/auth");
const Purchase = require("../models/Purchase");
const Enrollment = require("../models/Enrollment");
const emailService = require("../services/emailService");

// Create a course (partner only)
router.post(
  "/courses",
  authenticateToken,
  authorize("partner"),
  asyncHandler(async (req, res) => {
    const { title, description, link, priceEdu } = req.body;

    if (!title || !link || priceEdu === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, link, priceEdu",
      });
    }

    // create partner course associated with authenticated user
    const course = await PartnerCourse.create({
      owner: req.user._id,
      title,
      description: description || "",
      link,
      priceEdu: Number(priceEdu),
    });

    return res
      .status(201)
      .json({ success: true, message: "Course created", data: { course } });
  })
);

// Get courses for authenticated partner
router.get(
  "/courses",
  authenticateToken,
  authorize("partner"),
  asyncHandler(async (req, res) => {
    const courses = await PartnerCourse.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });

    return res.json({ success: true, data: { courses } });
  })
);

// Get sales (purchases) for authenticated partner (seller)
router.get(
  "/sales",
  authenticateToken,
  authorize("partner"),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 100 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [total, sales] = await Promise.all([
      Purchase.countDocuments({ seller: req.user._id }),
      Purchase.find({ seller: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("itemId", "name")
        .populate("buyer", "username email"),
    ]);

    res.json({ success: true, data: { total, sales } });
  })
);

// Get learners (enrollments) for authenticated partner (seller)
router.get(
  "/learners",
  authenticateToken,
  authorize("partner"),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const Enrollment = require("../models/Enrollment");

    const [total, learners] = await Promise.all([
      Enrollment.countDocuments({ seller: req.user._id }),
      Enrollment.find({ seller: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("user", "username email firstName lastName")
        .populate("itemId", "name"),
    ]);

    res.json({ success: true, data: { total, learners } });
  })
);

module.exports = router;

// Public listing of partner courses (searchable)
// NOTE: for now this returns partner courses regardless of isPublished so frontend
// can preview/test. If you want to restrict to published only, set `filter.isPublished = true`.
router.get(
  "/public-courses",
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 24, q } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Return all partner courses (no isPublished filter). Use text search when q is provided.
    const filter = {};
    if (q) {
      filter.$text = { $search: q };
    }

    const [total, courses] = await Promise.all([
      PartnerCourse.countDocuments(filter),
      PartnerCourse.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("owner", "username firstName lastName"),
    ]);

    res.json({ success: true, data: { total, courses } });
  })
);
router.patch(
  "/courses/:id/publish",
  authenticateToken,
  authorize("partner"),
  asyncHandler(async (req, res) => {
    const course = await PartnerCourse.findById(req.params.id);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    if (!course.owner.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const publish = req.body.publish === true;
    course.isPublished = publish;
    await course.save();

    res.json({
      success: true,
      message: `Course ${publish ? "published" : "unpublished"}`,
      data: { course },
    });
  })
);

// Purchase a partner course (authenticated users)
router.post(
  "/courses/:id/purchase",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const course = await PartnerCourse.findById(req.params.id);
    if (!course || !course.isPublished) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const price = Number(course.priceEdu) || 0;
    const quantity = 1;
    const total = price * quantity;

    // create Purchase record (itemId references the course id)
    const purchase = await Purchase.create({
      itemId: course._id,
      buyer: req.user._id,
      seller: course.owner,
      price,
      quantity,
      total,
      metadata: req.body.metadata || {},
    });

    // create Enrollment for buyer
    // Build accessLink so it points to the partner-provided link when available,
    // and always append the student=<buyerId> query param.
    const studentId = req.user._id.toString();
    let accessLink = null;

    if (course.link) {
      // If partner stored an absolute or relative link on the course, append student param
      try {
        // Try treating as absolute URL
        const url = new URL(course.link);
        url.searchParams.set("student", studentId);
        accessLink = url.toString();
      } catch (err) {
        // Not an absolute URL (could be relative or a plain string). Handle manually.
        const parts = String(course.link).split("?");
        const base = parts[0];
        const qs = parts[1] || "";
        const params = qs
          ? qs.split("&").filter((p) => p && !p.startsWith("student="))
          : [];
        params.push(`student=${encodeURIComponent(studentId)}`);
        accessLink = params.length ? `${base}?${params.join("&")}` : base;
      }
    } else {
      // Fallback: point to partner course page on frontend (if FRONTEND_URL is set)
      const frontendBase = process.env.FRONTEND_URL || "";
      if (frontendBase) {
        accessLink = `${frontendBase}/partner/courses/${course._id}?student=${studentId}`;
      } else {
        accessLink = `/partner/courses/${course._id}?student=${studentId}`;
      }
    }

    const enrollment = await Enrollment.create({
      user: req.user._id,
      itemId: course._id,
      purchase: purchase._id,
      seller: course.owner,
      courseTitle: course.title,
      accessLink,
      // initialize progress tracking
      progressPercent: 0,
      totalPoints: 0,
      timeSpentSeconds: 0,
      status: "in_progress",
      metadata: {},
    });

    // Send email notifications
    try {
      // Email to buyer
      await emailService.sendCoursePurchaseNotification(req.user.email, {
        name: course.name,
        priceEdu: course.priceEdu,
        owner: course.owner
      }, {
        buyer: req.user,
        accessLink,
        createdAt: purchase.createdAt
      });

      // Email to seller
      if (course.owner.email) {
        await emailService.sendNewSaleNotification(course.owner.email, {
          name: course.name,
          priceEdu: course.priceEdu,
          owner: course.owner
        }, {
          buyer: req.user,
          createdAt: purchase.createdAt
        });
      }

      console.log(`✅ Course purchase emails sent for course: ${course.name}`);
    } catch (emailError) {
      console.error('❌ Failed to send course purchase emails:', emailError);
      // Don't fail purchase if email fails
    }

    res.json({
      success: true,
      message: "Course purchased",
      data: { purchase, enrollment },
    });
  })
);

// Get enrollments for the authenticated user (their purchased courses)
router.get(
  "/my-enrollments",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [total, enrollments] = await Promise.all([
      Enrollment.countDocuments({ user: req.user._id }),
      Enrollment.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("user", "username email firstName lastName")
        .populate("itemId", "title link")
        .populate("seller", "username email firstName lastName"),
    ]);

    res.json({ success: true, data: { total, enrollments } });
  })
);
