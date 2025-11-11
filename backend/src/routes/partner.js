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
const PartnerSource = require("../models/PartnerSource");
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
    const {
      title,
      description,
      link,
      priceEdu,
      courseType,
      videoId,
      videoDuration,
      quiz,
      credits,
    } = req.body;

    if (!title || !link || priceEdu === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, link, priceEdu",
      });
    }

    // Basic validation: if courseType demands fields, validate minimally
    if (courseType === "video") {
      if (!videoId || !videoDuration) {
        return res.status(400).json({
          success: false,
          message: "Video courses require videoId and videoDuration",
        });
      }
    }
    if (
      (courseType === "quiz" || courseType === "hybrid") &&
      (!quiz || !quiz.questions || quiz.questions.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Quiz courses require quiz.questions array",
      });
    }

    // create partner course associated with authenticated user
    const courseData = {
      owner: req.user._id,
      title,
      description: description || "",
      link,
      priceEdu: Number(priceEdu),
    };

    // attach optional content metadata if provided
    if (courseType) courseData.courseType = courseType;
    if (videoId) courseData.videoId = videoId;
    if (videoDuration) courseData.videoDuration = Number(videoDuration);
    if (quiz) courseData.quiz = quiz;
    if (credits !== undefined) courseData.credits = Number(credits);

    const course = await PartnerCourse.create(courseData);

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

// Update a course (partner only)
router.put(
  "/courses/:id",
  authenticateToken,
  authorize("partner"),
  asyncHandler(async (req, res) => {
    const course = await PartnerCourse.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Verify ownership
    if (!course.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this course",
      });
    }

    const {
      title,
      description,
      link,
      priceEdu,
      courseType,
      videoId,
      videoDuration,
      quiz,
      credits,
    } = req.body;

    // Update fields if provided
    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (link !== undefined) course.link = link;
    if (priceEdu !== undefined) course.priceEdu = Number(priceEdu);
    if (courseType !== undefined) course.courseType = courseType;
    if (videoId !== undefined) course.videoId = videoId;
    if (videoDuration !== undefined)
      course.videoDuration = Number(videoDuration);
    if (quiz !== undefined) course.quiz = quiz;
    if (credits !== undefined) course.credits = Number(credits);

    await course.save();

    return res.json({
      success: true,
      message: "Course updated",
      data: { course },
    });
  })
);

// Delete a course (partner only)
router.delete(
  "/courses/:id",
  authenticateToken,
  authorize("partner"),
  asyncHandler(async (req, res) => {
    const course = await PartnerCourse.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Verify ownership
    if (!course.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this course",
      });
    }

    await PartnerCourse.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: "Course deleted successfully",
    });
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

    // Check if user has sufficient eduToken balance
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const currentBalance = Number(user.eduTokenBalance) || 0;
    if (currentBalance < total) {
      return res.status(400).json({
        success: false,
        message: `Insufficient eduToken balance. Required: ${total}, Available: ${currentBalance}`,
      });
    }

    // Deduct balance from user
    user.eduTokenBalance = currentBalance - total;
    await user.save();

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
    // and always append the student=<buyerId> query param. Prefer the domain
    // of the PartnerSource that the course was synced from.
    const studentId = req.user._id.toString();
    let accessLink = null;

    // If the course was synced from a PartnerSource, generate a partner-style
    // access link. Prefer the partner's configured course `link` (slug/path)
    // when available because the partner SPA expects links like
    //   https://partner.example.com/<slug>?student=...
    // If `link` is not present, fall back to the partnerCourseId approach.
    if (course.sourceId) {
      try {
        const source = await PartnerSource.findById(course.sourceId).lean();
        if (source && source.domain) {
          const protocol = source.domain.startsWith("localhost")
            ? "http"
            : "https";

          // Prefer partner's provided slug/path (course.link) when present
          if (course.link) {
            let base = String(course.link || "").trim();

            try {
              // If course.link is an absolute URL, preserve its origin/path
              const parsed = new URL(base);
              // ensure student param appended
              parsed.searchParams.set("student", studentId);
              accessLink = parsed.toString();
            } catch (e) {
              // Not absolute - treat as path or slug
              if (!base.startsWith("/")) base = `/${base}`;
              accessLink = `${protocol}://${
                source.domain
              }${base}?student=${encodeURIComponent(studentId)}`;
            }
          } else {
            // Fallback: use partnerCourseId (keeps previous behaviour)
            const partnerCourseId =
              course.partnerCourseId || course._id.toString();
            accessLink = `${protocol}://${
              source.domain
            }/course/${encodeURIComponent(
              partnerCourseId
            )}?student=${encodeURIComponent(studentId)}`;
          }
        }
      } catch (err) {
        console.error("Error building partner-style access link:", err);
      }
    }

    // Use stored url (sync sets `url`) or fallback to `link`
    const stored = course.url || course.link || "";

    if (stored && !accessLink) {
      // Try absolute URL first
      try {
        const parsed = new URL(stored);

        // If this course was synced from a PartnerSource, prefer that source's domain
        // (so links always point to partner domain). If source not present, keep parsed origin.
        let finalOrigin = parsed.origin;
        try {
          if (course.sourceId) {
            const source = await PartnerSource.findById(course.sourceId).lean();
            if (source && source.domain) {
              const protocol = source.domain.startsWith("localhost")
                ? "http"
                : "https";
              finalOrigin = `${protocol}://${source.domain}`;
            }
          }
        } catch (err) {
          console.error(
            "Error resolving partner source for absolute url:",
            err
          );
        }

        // Rebuild URL using finalOrigin but preserve pathname/search/hash
        const url = new URL(
          parsed.pathname + parsed.search + parsed.hash,
          finalOrigin
        );
        url.searchParams.set("student", studentId);
        accessLink = url.toString();
      } catch (err) {
        // Not an absolute URL. Could be a domain-without-protocol, a path, or a slug.
        const parts = String(stored).split("?");
        let base = parts[0] || "";
        const qs = parts[1] || "";
        const params = qs
          ? qs.split("&").filter((p) => p && !p.startsWith("student="))
          : [];
        params.push(`student=${encodeURIComponent(studentId)}`);

        try {
          // If base looks like a domain-with-path but lacks protocol, prefix https://
          if (!base.match(/^https?:\/\//)) {
            const domainLike = /^[^/]+\.[^/]+/.test(base);
            if (domainLike) {
              base = `https://${base}`;
            } else {
              // Use PartnerSource domain if available
              if (course.sourceId) {
                const source = await PartnerSource.findById(
                  course.sourceId
                ).lean();
                if (source && source.domain) {
                  const protocol = source.domain.startsWith("localhost")
                    ? "http"
                    : "https";
                  const partnerBase = `${protocol}://${source.domain}`;
                  if (!base.startsWith("/")) base = `/${base}`;
                  base = `${partnerBase}${base}`;
                }
              }
            }
          }
        } catch (resolveErr) {
          console.error(
            "Error resolving partner domain for stored link:",
            resolveErr
          );
        }

        accessLink = params.length ? `${base}?${params.join("&")}` : base;
      }
    } else if (!accessLink) {
      // No stored URL; fallback to partner domain page if source available, otherwise frontend
      if (course.sourceId) {
        try {
          const source = await PartnerSource.findById(course.sourceId).lean();
          if (source && source.domain) {
            const protocol = source.domain.startsWith("localhost")
              ? "http"
              : "https";
            accessLink = `${protocol}://${source.domain}/courses/${course._id}?student=${studentId}`;
          }
        } catch (err) {
          console.error(
            "Error resolving partner source for fallback link:",
            err
          );
        }
      }

      if (!accessLink) {
        const frontendBase = process.env.FRONTEND_URL || "";
        if (frontendBase) {
          accessLink = `${frontendBase}/partner/courses/${course._id}?student=${studentId}`;
        } else {
          accessLink = `/partner/courses/${course._id}?student=${studentId}`;
        }
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

    // Append enrollment id as reg=<enrollmentId> to the accessLink so partner can
    // correlate the incoming learner to the enrollment record. Do this after
    // creating the enrollment so we can use the real _id.
    try {
      let finalAccessLink = accessLink || "";
      try {
        // If it's a valid absolute URL, use URL API to set query param
        const urlObj = new URL(finalAccessLink);
        urlObj.searchParams.set("reg", enrollment._id.toString());
        finalAccessLink = urlObj.toString();
      } catch (e) {
        // Not an absolute URL; fallback to simple append
        if (finalAccessLink.includes("?")) {
          finalAccessLink = `${finalAccessLink}&reg=${encodeURIComponent(
            enrollment._id.toString()
          )}`;
        } else {
          finalAccessLink = `${finalAccessLink}?reg=${encodeURIComponent(
            enrollment._id.toString()
          )}`;
        }
      }

      // Persist the updated accessLink back to the enrollment record
      enrollment.accessLink = finalAccessLink;
      await enrollment.save();

      // keep local variable in sync for emails/response
      accessLink = finalAccessLink;
    } catch (err) {
      console.error("Error appending reg to accessLink:", err);
      // proceed without reg param if something goes wrong
    }

    // Debug log removed in production: accessLink is intentionally not logged here

    // Send email notifications (use updated accessLink)
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
    const partnerId = req.user._id.toString();

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

    if (!courseId || courseId === "null" || courseId === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Valid courseId is required",
      });
    }

    const course = await CompletedCourse.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Completed course not found",
      });
    }

    // Verify this partner owns the course
    const courseIssuerId = course.issuerId?.toString();
    const partnerId = req.user._id.toString();

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

// POST /api/partner/courses/:courseId/progress - Update course progress
router.post(
  "/courses/:courseId/progress",
  asyncHandler(async (req, res) => {
    try {
      const { courseId } = req.params;
      const {
        studentId,
        progressPercent,
        timeSpentSeconds,
        completed,
        quizScore,
      } = req.body;

      console.log("Progress request:", {
        courseId,
        studentId,
        progressPercent,
        completed,
        quizScore,
      });

      if (!studentId) {
        return res.status(400).json({
          success: false,
          message: "Student ID is required",
        });
      }

      // Find or create enrollment
      let enrollment = await Enrollment.findOne({
        itemId: courseId,
        user: studentId,
      });

      if (!enrollment) {
        // Create new enrollment if not exists
        const course = await PartnerCourse.findById(courseId);
        if (!course) {
          return res.status(404).json({
            success: false,
            message: "Course not found",
          });
        }

        console.log("Creating new enrollment for course:", course.title);

        // For partner courses accessed directly, we'll create a Purchase record first
        const Purchase = require("../models/Purchase");

        const priceValue = course.priceEdu || 0;
        const sellerId = course.owner; // PartnerCourse uses 'owner' not 'partner'

        console.log("Creating purchase with seller:", sellerId);

        const purchase = await Purchase.create({
          itemId: courseId,
          buyer: studentId,
          seller: sellerId,
          price: priceValue,
          quantity: 1,
          total: priceValue,
        });

        console.log("Purchase created:", purchase._id);

        enrollment = await Enrollment.create({
          user: studentId,
          itemId: courseId,
          purchase: purchase._id,
          seller: sellerId,
          courseTitle: course.title,
          progressPercent: progressPercent || 0,
          timeSpentSeconds: timeSpentSeconds || 0,
          status: completed ? "completed" : "in_progress",
          lastAccessed: new Date(),
        });

        console.log("Enrollment created:", enrollment._id);
      } else {
        console.log("Updating existing enrollment:", enrollment._id);
        // Update existing enrollment
        if (progressPercent !== undefined) {
          enrollment.progressPercent = progressPercent;
        }
        if (timeSpentSeconds !== undefined) {
          enrollment.timeSpentSeconds = timeSpentSeconds;
        }
        if (completed) {
          enrollment.status = "completed";
          enrollment.completedAt = new Date();
        }
        enrollment.lastAccessed = new Date();
        await enrollment.save();
      }

      // If completed and quiz score provided, create CompletedCourse
      if (
        completed &&
        !(await CompletedCourse.findOne({ enrollmentId: enrollment._id }))
      ) {
        const course = await PartnerCourse.findById(courseId).populate(
          "owner",
          "name username email"
        );

        if (course) {
          console.log("Creating completed course record");

          // Get issuer name from owner
          const issuerName =
            course.owner?.name || course.owner?.username || "Partner";

          // Map course owner ID to correct Partner ID
          // These Partner records were created without ownerUserId, so we use manual mapping
          const ownerToPartnerMap = {
            "6902fb27137fbb370d9a8642": "690312ac7814790e3335d7ec", // partner.video@demo.com → Web1 Video
            "6902fb28137fbb370d9a8646": "690312ac7814790e3335d7ef", // partner.quiz@demo.com → Web2 Quiz
            "6902fb28137fbb370d9a864a": "690312ac7814790e3335d7f2", // partner.hybrid@demo.com → Web3 Hybrid
          };

          const ownerIdStr = course.owner._id.toString();
          const issuerId = ownerToPartnerMap[ownerIdStr] || course.owner._id;

          console.log("Owner ID:", ownerIdStr);
          console.log("Mapped to Partner ID:", issuerId);
          console.log("Using issuer ID:", issuerId);

          const completedCourse = await CompletedCourse.create({
            enrollmentId: enrollment._id,
            userId: studentId,
            name: course.title,
            description: course.description || "",
            issuer: issuerName,
            issuerId: issuerId,
            category: course.category || "General",
            level: course.level || "Beginner",
            credits: course.credits || 0,
            score:
              quizScore !== undefined && quizScore !== null ? quizScore : 100,
            grade:
              quizScore !== undefined && quizScore !== null && quizScore >= 80
                ? "A"
                : quizScore !== undefined &&
                  quizScore !== null &&
                  quizScore >= 60
                ? "B"
                : quizScore !== undefined &&
                  quizScore !== null &&
                  quizScore >= 40
                ? "C"
                : quizScore !== undefined && quizScore !== null
                ? "D"
                : "A",
            issueDate: new Date(),
          });
          console.log("Completed course created:", completedCourse._id);
        }
      }

      res.json({
        success: true,
        message: completed
          ? "Course completed successfully"
          : "Progress updated",
        data: { enrollment },
      });
    } catch (error) {
      console.error("Error in progress endpoint:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  })
);

// =====================================================================
// ENHANCED INTEGRATION APIs - Phase 1 Implementation
// Theo khuyến nghị từ API_COMPARISON_ANALYSIS.md
// =====================================================================

/**
 * POST /api/partner/public/learning/start
 * Partner notifies EduWallet when a user starts learning a course
 * Mục đích: Track khi student bắt đầu học, tạo learning session
 */
router.post(
  "/public/learning/start",
  authenticatePartnerApiKey,
  asyncHandler(async (req, res) => {
    const { userId, courseId, startedAt } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, courseId",
      });
    }

    // Find enrollment by user and itemId (courseId in PartnerCourse)
    let enrollment = await Enrollment.findOne({
      user: userId,
      itemId: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found. User must purchase the course first.",
      });
    }

    // Update enrollment with start tracking
    if (!enrollment.lastAccessed) {
      enrollment.lastAccessed = startedAt || new Date();
    }

    // Initialize metadata for session tracking
    if (!enrollment.metadata) {
      enrollment.metadata = {};
    }
    enrollment.metadata.sessionStarted = startedAt || new Date();
    enrollment.metadata.sessionCount =
      (enrollment.metadata.sessionCount || 0) + 1;

    await enrollment.save();

    res.json({
      success: true,
      message: "Learning session started",
      data: {
        enrollmentId: enrollment._id,
        sessionId: enrollment._id.toString(),
        startedAt: enrollment.metadata.sessionStarted,
        progress: enrollment.progressPercent || 0,
        status: enrollment.status,
      },
    });
  })
);

/**
 * POST /api/partner/public/learning/progress
 * Real-time progress sync from partner to EduWallet (optional for partners)
 * Mục đích: Partner có thể gửi progress updates realtime thay vì chỉ khi hoàn thành
 */
router.post(
  "/public/learning/progress",
  authenticatePartnerApiKey,
  asyncHandler(async (req, res) => {
    const { userId, courseId, progress, currentLesson, timeSpent } = req.body;

    if (!userId || !courseId || progress === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, courseId, progress",
      });
    }

    // Validate progress range
    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: "Progress must be between 0 and 100",
      });
    }

    // Find enrollment
    const enrollment = await Enrollment.findOne({
      user: userId,
      itemId: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found. Please start learning session first.",
      });
    }

    // Update progress
    enrollment.progressPercent = progress;
    enrollment.lastAccessed = new Date();

    if (timeSpent !== undefined) {
      enrollment.timeSpentSeconds =
        (enrollment.timeSpentSeconds || 0) + timeSpent;
    }

    // Update metadata
    if (!enrollment.metadata) {
      enrollment.metadata = {};
    }
    enrollment.metadata.lastProgressUpdate = new Date();
    enrollment.metadata.currentLesson = currentLesson;

    // Track progress history
    if (!enrollment.metadata.progressHistory) {
      enrollment.metadata.progressHistory = [];
    }
    enrollment.metadata.progressHistory.push({
      progress,
      timestamp: new Date(),
      lesson: currentLesson,
    });

    // Auto-update status if completed
    if (progress >= 100 && enrollment.status !== "completed") {
      enrollment.status = "completed";
      enrollment.completedAt = new Date();
    }

    await enrollment.save();

    res.json({
      success: true,
      message: "Progress updated successfully",
      data: {
        enrollmentId: enrollment._id,
        progress: enrollment.progressPercent,
        currentLesson: enrollment.metadata.currentLesson,
        timeSpent: enrollment.timeSpentSeconds,
        lastAccessed: enrollment.lastAccessed,
        status: enrollment.status,
      },
    });
  })
);

/**
 * GET /api/partner/public/course-structure/:courseId
 * Get detailed course structure from EduWallet (if available)
 * Mục đích: Partner hoặc frontend có thể query course structure từ EduWallet
 */
router.get(
  "/public/course-structure/:courseId",
  authenticatePartnerApiKey,
  asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const course = await PartnerCourse.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Extract structure from course metadata
    const structure = {
      courseId: course._id,
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      lessons: course.metadata?.lessons || [],
      modules: course.metadata?.modules || [],
      quizzes: course.metadata?.quizzes || [],
      totalLessons: course.metadata?.totalLessons || 0,
      estimatedTime: course.metadata?.estimatedTime || null,
    };

    res.json({
      success: true,
      message: "Course structure retrieved successfully",
      data: structure,
    });
  })
);

/**
 * GET /api/partner/public/learning-session/:userId/:courseId
 * Get current learning session info for a user and course
 * Mục đích: Partner có thể query xem user đã học đến đâu
 */
router.get(
  "/public/learning-session/:userId/:courseId",
  authenticatePartnerApiKey,
  asyncHandler(async (req, res) => {
    const { userId, courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      user: userId,
      itemId: courseId,
    }).populate("itemId", "title description");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "No active learning session found",
      });
    }

    // Get course info
    const course = await PartnerCourse.findById(courseId);

    res.json({
      success: true,
      message: "Learning session retrieved successfully",
      data: {
        sessionId: enrollment._id.toString(),
        enrollmentId: enrollment._id,
        courseId: courseId,
        courseTitle:
          enrollment.courseTitle || (course ? course.title : "Unknown"),
        startedAt: enrollment.createdAt,
        lastAccessed: enrollment.lastAccessed,
        progress: enrollment.progressPercent || 0,
        currentLesson: enrollment.metadata?.currentLesson || null,
        timeSpent: enrollment.timeSpentSeconds || 0,
        status: enrollment.status,
        completedAt: enrollment.completedAt || null,
        metadata: enrollment.metadata || {},
        sessionCount: enrollment.metadata?.sessionCount || 0,
      },
    });
  })
);

// =====================================================================
// FETCH COURSES FROM PARTNER DEMO SYSTEM
// =====================================================================

/**
 * GET /api/partner/fetch-demo-courses
 * EduWallet fetches course list from partner's demo website
 * Mục đích: EduWallet có thể lấy danh sách khóa học từ partner demo system
 */
router.get(
  "/fetch-demo-courses",
  authenticatePartnerApiKey,
  asyncHandler(async (req, res) => {
    try {
      const partner = req.partner;

      // Get partner's demo URL
      const partnerDemoUrl = partner.demoUrl || partner.domain;

      if (!partnerDemoUrl) {
        return res.status(400).json({
          success: false,
          message:
            "Partner demo URL not configured. Please set demoUrl or domain in partner settings.",
        });
      }

      // Fetch courses from partner demo
      const axios = require("axios");
      const response = await axios.get(`${partnerDemoUrl}/api/courses`, {
        timeout: 10000,
        headers: {
          "User-Agent": "EduWallet-System/1.0",
          "X-Requested-By": "EduWallet",
        },
      });

      if (!response.data || !response.data.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to fetch courses from partner demo",
        });
      }

      const demoCourses = response.data.courses || [];

      // Transform to EduWallet format
      const transformedCourses = demoCourses.map((course) => ({
        externalCourseId: course.id,
        title: course.name,
        description: course.description,
        category: course.category || "General",
        level: course.level || "Beginner",
        credits: course.credits || 0,
        skills: course.skills || [],
        metadata: {
          videoId: course.videoId,
          videoDuration: course.videoDuration,
          quizzes: course.quizzes,
          lessons: course.lessons,
          originalData: course,
        },
        source: "partner-demo",
        partnerId: partner._id,
        partnerName: partner.name,
      }));

      res.json({
        success: true,
        message: `Fetched ${transformedCourses.length} courses from partner demo`,
        data: {
          partner: {
            id: partner._id,
            name: partner.name,
            domain: partnerDemoUrl,
          },
          courses: transformedCourses,
          totalCourses: transformedCourses.length,
        },
      });
    } catch (error) {
      console.error("Error fetching partner demo courses:", error);

      if (error.code === "ECONNREFUSED") {
        return res.status(503).json({
          success: false,
          message:
            "Cannot connect to partner demo website. Please ensure the demo is running.",
          error: "Connection refused",
        });
      }

      if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
        return res.status(504).json({
          success: false,
          message: "Request to partner demo timed out",
          error: "Connection timeout",
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch partner demo courses",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  })
);

/**
 * GET /api/partner/fetch-demo-course/:courseId
 * Fetch specific course details from partner demo system
 * Mục đích: Lấy chi tiết 1 khóa học cụ thể từ partner demo
 */
router.get(
  "/fetch-demo-course/:courseId",
  authenticatePartnerApiKey,
  asyncHandler(async (req, res) => {
    try {
      const partner = req.partner;
      const { courseId } = req.params;

      const partnerDemoUrl = partner.demoUrl || partner.domain;

      if (!partnerDemoUrl) {
        return res.status(400).json({
          success: false,
          message: "Partner demo URL not configured",
        });
      }

      // Fetch course from partner demo
      const axios = require("axios");
      const response = await axios.get(
        `${partnerDemoUrl}/api/courses/${courseId}`,
        {
          timeout: 10000,
          headers: {
            "User-Agent": "EduWallet-System/1.0",
            "X-Requested-By": "EduWallet",
          },
        }
      );

      if (!response.data || !response.data.success) {
        return res.status(404).json({
          success: false,
          message: "Course not found in partner demo system",
        });
      }

      const course = response.data.course;

      // Transform to EduWallet format
      const transformedCourse = {
        externalCourseId: course.id,
        title: course.name,
        description: course.description,
        category: course.category || "General",
        level: course.level || "Beginner",
        credits: course.credits || 0,
        skills: course.skills || [],
        lessons: course.lessons || [],
        quizzes: course.quizzes || [],
        metadata: {
          videoId: course.videoId,
          videoDuration: course.videoDuration,
          originalData: course,
        },
        source: "partner-demo",
        partnerId: partner._id,
        partnerName: partner.name,
      };

      res.json({
        success: true,
        message: "Course fetched successfully",
        data: {
          partner: {
            id: partner._id,
            name: partner.name,
            domain: partnerDemoUrl,
          },
          course: transformedCourse,
        },
      });
    } catch (error) {
      console.error("Error fetching partner demo course:", error);

      if (error.response && error.response.status === 404) {
        return res.status(404).json({
          success: false,
          message: "Course not found in partner demo system",
        });
      }

      if (error.code === "ECONNREFUSED") {
        return res.status(503).json({
          success: false,
          message: "Cannot connect to partner demo website",
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch course from partner demo",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  })
);

// =======================
// PARTNER SOURCES API
// =======================
const axios = require("axios");

// GET /api/partner/sources - Get all partner sources
router.get(
  "/sources",
  authenticateToken,
  authorize("partner"),
  asyncHandler(async (req, res) => {
    console.log("🔍 GET /api/partner/sources - User ID:", req.user._id);
    const sources = await PartnerSource.find({ partner: req.user._id }).sort({
      createdAt: -1,
    });
    console.log("📦 Found sources:", sources.length, sources);

    res.json({
      success: true,
      data: { sources },
    });
  })
);

// POST /api/partner/sources - Create new partner source
router.post(
  "/sources",
  authenticateToken,
  authorize("partner"),
  asyncHandler(async (req, res) => {
    const { name, domain } = req.body;

    if (!name || !domain) {
      return res.status(400).json({
        success: false,
        message: "Tên và Domain là bắt buộc",
      });
    }

    // Clean domain (remove http/https if present)
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");

    const source = await PartnerSource.create({
      partner: req.user._id,
      name,
      domain: cleanDomain,
    });

    res.status(201).json({
      success: true,
      data: { source },
      message: "Đã tạo nguồn API thành công",
    });
  })
);

// PATCH /api/partner/sources/:id - Update partner source
router.patch(
  "/sources/:id",
  authenticateToken,
  authorize("partner"),
  asyncHandler(async (req, res) => {
    const { name, domain, isActive } = req.body;

    const source = await PartnerSource.findOne({
      _id: req.params.id,
      partner: req.user._id,
    });

    if (!source) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nguồn API",
      });
    }

    if (name) source.name = name;
    if (domain) {
      // Clean domain
      source.domain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    }
    if (isActive !== undefined) source.isActive = isActive;

    await source.save();

    res.json({
      success: true,
      data: { source },
      message: "Đã cập nhật nguồn API",
    });
  })
);

// DELETE /api/partner/sources/:id - Delete partner source
router.delete(
  "/sources/:id",
  authenticateToken,
  authorize("partner"),
  asyncHandler(async (req, res) => {
    const source = await PartnerSource.findOneAndDelete({
      _id: req.params.id,
      partner: req.user._id,
    });

    if (!source) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nguồn API",
      });
    }

    res.json({
      success: true,
      message: "Đã xóa nguồn API",
    });
  })
);

// POST /api/partner/sources/:id/sync - Sync courses from partner source
router.post(
  "/sources/:id/sync",
  authenticateToken,
  authorize("partner"),
  asyncHandler(async (req, res) => {
    const source = await PartnerSource.findOne({
      _id: req.params.id,
      partner: req.user._id,
    });

    if (!source) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nguồn API",
      });
    }

    if (!source.isActive) {
      return res.status(400).json({
        success: false,
        message: "Nguồn API đã bị vô hiệu hóa",
      });
    }

    try {
      // Update sync status to pending
      source.lastSyncStatus = "pending";
      await source.save();

      // Build API URL from domain
      const coursesApiUrl = source.getApiEndpoints().courses;

      // Fetch courses from partner API
      const headers = {};
      if (source.apiKey) {
        headers["Authorization"] = `Bearer ${source.apiKey}`;
      }

      const response = await axios.get(coursesApiUrl, {
        headers,
        timeout: 30000,
      });

      let courses = [];
      // Support multiple response shapes from partner APIs:
      // - raw array: [ ... ]
      // - { courses: [ ... ] }
      // - { data: [ ... ] }
      // - { data: { courses: [ ... ] } }
      if (Array.isArray(response.data)) {
        courses = response.data;
      } else if (response.data && Array.isArray(response.data.courses)) {
        courses = response.data.courses;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.courses)
      ) {
        courses = response.data.data.courses;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        courses = response.data.data;
      } else {
        console.error("Invalid partner API response format:", response.data);
        throw new Error("Invalid API response format");
      }

      let syncedCount = 0;

      // Create or update courses
      for (const courseData of courses) {
        try {
          const coursePayload = {
            // Ensure the document has an owner so partner APIs that filter
            // by owner (the admin UI) will return the synced courses.
            owner: req.user._id,
            partner: req.user._id,
            partnerCourseId:
              courseData.id || courseData._id || courseData.courseId,
            title: courseData.title || courseData.name,
            description: courseData.description || "",
            price: parseFloat(courseData.price || courseData.priceEdu) || 0,
            priceEdu: parseFloat(courseData.price || courseData.priceEdu) || 0,
            currency: courseData.currency || "PZO",
            duration: courseData.duration || 0,
            level: courseData.level || "beginner",
            category: courseData.category || "other",
            url: courseData.url || courseData.link || source.coursesApiUrl,
            thumbnail: courseData.thumbnail || courseData.image,
            published:
              courseData.published !== undefined ? courseData.published : true,
            sourceId: source._id,
          };

          await PartnerCourse.findOneAndUpdate(
            {
              partner: req.user._id,
              partnerCourseId: coursePayload.partnerCourseId,
            },
            // Use coursePayload as the update and ensure owner is set on upsert
            { $set: coursePayload, $setOnInsert: { createdAt: new Date() } },
            { upsert: true, new: true }
          );

          syncedCount++;
        } catch (err) {
          console.error(`Error syncing course ${courseData.id}:`, err);
        }
      }

      // Update sync status
      source.lastSyncAt = new Date();
      source.lastSyncStatus = "success";
      source.syncedCoursesCount = syncedCount;
      source.lastSyncError = null;
      await source.save();

      res.json({
        success: true,
        message: `Đã đồng bộ ${syncedCount} khóa học thành công`,
        data: {
          synced: syncedCount,
          total: courses.length,
        },
      });
    } catch (error) {
      // Update sync status to failed
      source.lastSyncStatus = "failed";
      source.lastSyncError = error.message;
      await source.save();

      throw error;
    }
  })
);

// Public endpoint to get enrollment details for partners
router.get(
  "/public/enrollment/:id",
  asyncHandler(async (req, res) => {
    const enrollmentId = req.params.id;

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate("user", "username email firstName lastName")
      .populate("itemId", "title link")
      .populate("seller", "username email firstName lastName");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Add original itemId to response if populated itemId is null
    const responseEnrollment = enrollment.toObject();
    if (!responseEnrollment.itemId && enrollment.itemId) {
      responseEnrollment.itemId = enrollment.itemId;
    }

    // Check if the item is a partner course (has partner source)
    const partnerSource = await PartnerSource.findOne({
      courses: enrollment.itemId,
    });

    if (!partnerSource) {
      return res.status(403).json({
        success: false,
        message: "Not a partner course",
      });
    }

    res.json({
      success: true,
      data: { enrollment: responseEnrollment },
    });
  })
);

module.exports = router;
