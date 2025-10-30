const express = require("express");
const router = express.Router();
const PartnerCourse = require("../models/PartnerCourse");
const { asyncHandler } = require("../middleware/errorHandler");
const { authenticateToken, authorize } = require("../middleware/auth");
const {
  authenticatePartnerApiKey,
} = require("../middleware/partnerApiKeyAuth");
const Purchase = require("../models/Purchase");
const Enrollment = require("../models/Enrollment");
const emailService = require("../services/emailService");
const Partner = require("../models/Partner");
const User = require("../models/User");
const crypto = require("crypto");
const CompletedCourse = require("../models/CompletedCourse");

// Public endpoint: validate an apikey and return partner basic info
router.get(
  "/apikey/validate",
  asyncHandler(async (req, res) => {
    // use middleware function inline to support query/header apikey
    await new Promise((resolve, reject) =>
      authenticatePartnerApiKey(req, res, (err) =>
        err ? reject(err) : resolve()
      )
    );

    // partner is attached
    const partner = req.partner;
    res.json({
      success: true,
      data: {
        partner: {
          _id: partner._id,
          name: partner.name,
          domain: partner.domain,
          supportedFeatures: partner.supportedFeatures || [],
        },
      },
    });
  })
);

// Public: return a partner course by id when caller supplies a valid apikey
router.get(
  "/public/course/:id",
  asyncHandler(async (req, res) => {
    // authenticate by apikey (query/header)
    await new Promise((resolve, reject) =>
      authenticatePartnerApiKey(req, res, (err) =>
        err ? reject(err) : resolve()
      )
    );

    const course = await PartnerCourse.findById(req.params.id).populate(
      "owner",
      "username email firstName lastName"
    );
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    res.json({
      success: true,
      data: {
        partner: { _id: req.partner._id, name: req.partner.name },
        course,
      },
    });
  })
);

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

// Partner: generate or rotate API key for the partner associated with current user
router.post(
  "/apikey/generate",
  authenticateToken,
  authorize("partner"),
  asyncHandler(async (req, res) => {
    console.log(
      `[${new Date().toISOString()}] partner.apikey.generate handler entered`
    );
    try {
      console.log("headers:", {
        authorization: req.headers.authorization,
        host: req.headers.host,
      });
    } catch (e) {
      console.error("Failed to log request headers:", e);
    }
    // find partner record for this partner user
    let partner = await Partner.findOne({ ownerUserId: req.user._id });
    console.log("partner lookup result:", partner ? partner._id : null);
    // If no partner record exists yet for this user, create a barebones one so
    // the partner can immediately generate an API key from their account.
    if (!partner) {
      console.log(
        "No Partner record found — creating a new Partner record for user",
        req.user._id
      );
      partner = await Partner.create({
        ownerUserId: req.user._id,
        name:
          req.user.username ||
          req.user.email ||
          `partner-${String(req.user._id).slice(-6)}`,
        status: "active",
      });
      console.log("Created Partner record:", partner._id);
    }

    // If apiKey already exists, require password to rotate
    if (partner.apiKey) {
      const { password } = req.body || {};
      console.log("existing apiKey found; password present:", !!password);
      if (!password) {
        return res.status(400).json({
          success: false,
          message:
            "API key already exists. Provide your account password to rotate the key.",
        });
      }

      // verify password against user record
      const user = await User.findById(req.user._id).select("+password");
      if (!user || !(await user.comparePassword(password))) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid password" });
      }
    }

    // generate a new API key (random 48-byte hex)
    const newKey = crypto.randomBytes(32).toString("hex");
    const now = new Date();
    if (!partner.apiKeyCreatedAt) partner.apiKeyCreatedAt = now;
    partner.apiKey = newKey;
    partner.apiKeyLastRotatedAt = now;
    await partner.save();
    console.log("new apiKey generated for partner", partner._id);

    // Return the new key only once
    res.json({
      success: true,
      data: {
        apiKey: newKey,
        createdAt: partner.apiKeyCreatedAt,
        rotatedAt: partner.apiKeyLastRotatedAt,
      },
    });
  })
);

// Partner: get API key metadata (does not return the plaintext key)
router.get(
  "/apikey",
  authenticateToken,
  authorize("partner"),
  asyncHandler(async (req, res) => {
    const partner = await Partner.findOne({ ownerUserId: req.user._id });
    if (!partner) {
      return res.json({ success: true, data: { exists: false } });
    }
    res.json({
      success: true,
      data: {
        exists: !!partner.apiKey,
        maskedKey: partner.apiKey
          ? `${String(partner.apiKey).slice(0, 5)}***${String(
              partner.apiKey
            ).slice(-5)}`
          : null,
        createdAt: partner.apiKeyCreatedAt || null,
        rotatedAt: partner.apiKeyLastRotatedAt || null,
      },
    });
  })
);

// Partner: reveal the plaintext API key (available to the authenticated partner)
router.post(
  "/apikey/reveal",
  authenticateToken,
  authorize("partner"),
  asyncHandler(async (req, res) => {
    // Note: revealing the key is permitted for the logged-in partner user.
    // Rotation (creating a new key) still requires the account password in
    // POST /apikey/generate. This endpoint does not require an extra password.
    const partner = await Partner.findOne({ ownerUserId: req.user._id });
    if (!partner || !partner.apiKey) {
      return res
        .status(404)
        .json({ success: false, message: "No API key found for this partner" });
    }

    res.json({
      success: true,
      data: {
        apiKey: partner.apiKey,
        createdAt: partner.apiKeyCreatedAt || null,
        rotatedAt: partner.apiKeyLastRotatedAt || null,
      },
    });
  })
);

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
      await emailService.sendCoursePurchaseNotification(
        req.user.email,
        {
          name: course.name,
          priceEdu: course.priceEdu,
          owner: course.owner,
        },
        {
          buyer: req.user,
          accessLink,
          createdAt: purchase.createdAt,
        }
      );

      // Email to seller
      if (course.owner.email) {
        await emailService.sendNewSaleNotification(
          course.owner.email,
          {
            name: course.name,
            priceEdu: course.priceEdu,
            owner: course.owner,
          },
          {
            buyer: req.user,
            createdAt: purchase.createdAt,
          }
        );
      }

      console.log(`✅ Course purchase emails sent for course: ${course.name}`);
    } catch (emailError) {
      console.error("❌ Failed to send course purchase emails:", emailError);
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

// Get enrollment details by ID (for partner to check student progress)
router.get(
  "/enrollment/:enrollmentId",
  authenticateToken,
  authorize("partner"),
  asyncHandler(async (req, res) => {
    const enrollment = await Enrollment.findById(req.params.enrollmentId)
      .populate("user", "username email firstName lastName")
      .populate("itemId", "title link priceEdu")
      .populate("seller", "username email firstName lastName")
      .populate("purchase", "total createdAt");

    if (!enrollment) {
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });
    }

    // Only allow partner to view enrollments for their own courses
    if (!enrollment.seller.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this enrollment",
      });
    }

    res.json({ success: true, data: { enrollment } });
  })
);

// Update enrollment progress (for partner to update student progress)
router.patch(
  "/enrollment/:enrollmentId/progress",
  authenticateToken,
  authorize("partner"),
  asyncHandler(async (req, res) => {
    const enrollment = await Enrollment.findById(req.params.enrollmentId)
      .populate("user", "username email firstName lastName")
      .populate("itemId", "title description link")
      .populate("seller", "username email name");

    if (!enrollment) {
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });
    }

    // Only allow partner to update enrollments for their own courses
    if (!enrollment.seller._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this enrollment",
      });
    }

    const {
      progressPercent,
      totalPoints,
      timeSpentSeconds,
      status,
      metadata,
      // Additional fields for completed course creation
      category,
      level,
      credits,
      grade,
      skills,
      certificateUrl,
      verificationUrl,
      imageUrl,
      modulesCompleted,
      totalModules,
    } = req.body;

    const wasCompleted = enrollment.status === "completed";
    const isNowCompleting = status === "completed" && !wasCompleted;

    // Update fields if provided
    if (progressPercent !== undefined)
      enrollment.progressPercent = Number(progressPercent);
    if (totalPoints !== undefined) enrollment.totalPoints = Number(totalPoints);
    if (timeSpentSeconds !== undefined)
      enrollment.timeSpentSeconds = Number(timeSpentSeconds);
    if (status !== undefined) enrollment.status = status;
    if (metadata !== undefined)
      enrollment.metadata = { ...enrollment.metadata, ...metadata };

    // Auto-set completedAt when status becomes completed
    if (isNowCompleting) {
      enrollment.completedAt = new Date();
      enrollment.progressPercent = 100; // Ensure progress is 100% when completed
    }

    enrollment.lastAccessed = new Date();
    await enrollment.save();

    let completedCourse = null;

    // Auto-create CompletedCourse when status changes to "completed"
    if (isNowCompleting) {
      try {
        // Check if CompletedCourse already exists
        const existing = await CompletedCourse.findOne({
          enrollmentId: enrollment._id,
        });

        if (!existing) {
          completedCourse = await CompletedCourse.createFromEnrollment(
            enrollment,
            {
              name: enrollment.itemId?.title || enrollment.courseTitle,
              description: enrollment.itemId?.description || "",
              issuer:
                enrollment.seller?.name ||
                enrollment.seller?.username ||
                req.partner?.name ||
                "Partner",
              category: category || "General",
              level: level || "Beginner",
              credits: credits || 0,
              grade: grade || "",
              score:
                totalPoints !== undefined
                  ? totalPoints
                  : enrollment.totalPoints || 0,
              skills: skills || [],
              certificateUrl: certificateUrl || null,
              verificationUrl: verificationUrl || null,
              imageUrl: imageUrl || null,
              modulesCompleted: modulesCompleted || 0,
              totalModules: totalModules || 0,
            }
          );
        } else {
          completedCourse = existing;
        }
      } catch (error) {
        console.error("Error creating CompletedCourse:", error);
        // Don't fail the progress update if CompletedCourse creation fails
      }
    }

    res.json({
      success: true,
      message: "Progress updated",
      data: {
        enrollment,
        completedCourse: completedCourse || undefined,
      },
    });
  })
);

// Get all students enrolled in a specific course (for partner to view their students)
router.get(
  "/courses/:courseId/students",
  authenticateToken,
  authorize("partner"),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Verify the course belongs to this partner
    const course = await PartnerCourse.findById(req.params.courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (!course.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view students for this course",
      });
    }

    const [total, students] = await Promise.all([
      Enrollment.countDocuments({ itemId: req.params.courseId }),
      Enrollment.find({ itemId: req.params.courseId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("user", "username email firstName lastName")
        .populate("purchase", "total createdAt"),
    ]);

    res.json({
      success: true,
      data: {
        course: { _id: course._id, title: course.title },
        total,
        students,
      },
    });
  })
);

// Public API: Get enrollment by student ID (using API key authentication)
router.get(
  "/public/enrollment/student/:studentId",
  asyncHandler(async (req, res) => {
    // authenticate by apikey (query/header)
    await new Promise((resolve, reject) =>
      authenticatePartnerApiKey(req, res, (err) =>
        err ? reject(err) : resolve()
      )
    );

    const { courseId } = req.query;
    const filter = { user: req.params.studentId };

    // If courseId provided, also filter by course
    if (courseId) {
      filter.itemId = courseId;
    }

    const enrollments = await Enrollment.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "username email firstName lastName")
      .populate("itemId", "title link")
      .populate("purchase", "total createdAt");

    res.json({
      success: true,
      data: {
        partner: { _id: req.partner._id, name: req.partner.name },
        enrollments,
      },
    });
  })
);

// ==================== COMPLETED COURSES API ====================

// GET /api/partner/completed-courses/:userId - Get completed courses for a user
router.get(
  "/completed-courses/:userId",
  authenticateToken,
  authorize("partner"),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Get completed courses for this user
    const courses = await CompletedCourse.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "username email firstName lastName")
      .populate("issuerId", "name username");

    const total = await CompletedCourse.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        total,
        page,
        limit,
        courses,
      },
    });
  })
);

// GET /api/partner/public/completed-courses/user/:userId - Public API to get user's completed courses
router.get(
  "/public/completed-courses/user/:userId",
  asyncHandler(async (req, res) => {
    // Authenticate by API key
    await new Promise((resolve, reject) =>
      authenticatePartnerApiKey(req, res, (err) =>
        err ? reject(err) : resolve()
      )
    );

    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Only return courses issued by this partner
    const courses = await CompletedCourse.find({
      userId,
      issuerId: req.partner._id,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v");

    const total = await CompletedCourse.countDocuments({
      userId,
      issuerId: req.partner._id,
    });

    res.json({
      success: true,
      data: {
        total,
        page,
        limit,
        courses,
      },
    });
  })
);

// POST /api/partner/enrollment/:enrollmentId/complete - Mark enrollment as completed and create CompletedCourse
router.post(
  "/enrollment/:enrollmentId/complete",
  authenticateToken,
  authorize("partner"),
  asyncHandler(async (req, res) => {
    const { enrollmentId } = req.params;
    const {
      category = "General",
      level = "Beginner",
      credits = 0,
      grade,
      score,
      skills = [],
      certificateUrl,
      verificationUrl,
      imageUrl,
      modulesCompleted,
      totalModules,
    } = req.body;

    // Get enrollment with populated data
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate("user", "username email firstName lastName")
      .populate("itemId", "title description link")
      .populate("seller", "username email name");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Verify this partner owns the course
    const sellerId =
      enrollment.seller?._id?.toString() || enrollment.seller?.toString();
    const partnerId = req.partner.ownerUserId.toString();

    if (sellerId !== partnerId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to complete this enrollment",
      });
    }

    // Check if already completed
    const existingCourse = await CompletedCourse.findOne({ enrollmentId });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: "This enrollment has already been marked as completed",
        data: { course: existingCourse },
      });
    }

    // Update enrollment status to completed
    enrollment.status = "completed";
    enrollment.progressPercent = 100;
    enrollment.completedAt = new Date();

    // Update score if provided
    if (score !== undefined) {
      enrollment.totalPoints = score;
    }

    await enrollment.save();

    // Create CompletedCourse record
    const completedCourse = await CompletedCourse.createFromEnrollment(
      enrollment,
      {
        name: enrollment.itemId?.title || enrollment.courseTitle,
        description: enrollment.itemId?.description || "",
        issuer:
          enrollment.seller?.name ||
          enrollment.seller?.username ||
          req.partner.name,
        category,
        level,
        credits,
        grade,
        score: score || enrollment.totalPoints || 0,
        skills,
        certificateUrl,
        verificationUrl,
        imageUrl,
        modulesCompleted: modulesCompleted || 0,
        totalModules: totalModules || 0,
      }
    );

    res.json({
      success: true,
      message: "Enrollment marked as completed",
      data: {
        enrollment,
        completedCourse,
      },
    });
  })
);

// PATCH /api/partner/completed-course/:courseId - Update completed course details
router.patch(
  "/completed-course/:courseId",
  authenticateToken,
  authorize("partner"),
  asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const updates = req.body;

    const course = await CompletedCourse.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Completed course not found",
      });
    }

    // Verify this partner owns the course
    const courseIssuerId = course.issuerId?.toString();
    const partnerId = req.partner._id.toString();

    if (courseIssuerId !== partnerId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this course",
      });
    }

    // Allowed fields to update
    const allowedUpdates = [
      "description",
      "category",
      "level",
      "credits",
      "grade",
      "score",
      "skills",
      "certificateUrl",
      "verificationUrl",
      "imageUrl",
      "modulesCompleted",
      "totalModules",
      "metadata",
    ];

    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        course[field] = updates[field];
      }
    });

    // Auto-calculate grade if score is updated
    if (updates.score !== undefined && !updates.grade) {
      course.grade = course.calculateGrade();
    }

    await course.save();

    res.json({
      success: true,
      message: "Completed course updated",
      data: { course },
    });
  })
);

module.exports = router;
