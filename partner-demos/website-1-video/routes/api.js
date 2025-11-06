const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const axios = require("axios");
const mongoose = require("mongoose");

// In-memory storage for student progress (temporary)
const students = {};

// ============================================================================
// DATABASE MODELS (Partner's own database)
// ============================================================================

// Course Schema - Partner's course database
const CourseSchema = new mongoose.Schema({
  courseId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  issuer: String,
  category: String,
  level: String,
  credits: Number,
  courseType: {
    type: String,
    enum: ["video", "quiz", "hybrid"],
    default: "video",
  }, // Course type

  // Video-specific fields
  videoId: String, // YouTube video ID
  videoDuration: Number, // Duration in seconds

  // Quiz-specific fields
  quiz: {
    questions: [
      {
        id: Number,
        question: String,
        options: [String],
        correctAnswer: Number, // Index of correct answer (0-3)
        explanation: String,
      },
    ],
    passingScore: { type: Number, default: 70 }, // Minimum score to pass (%)
    timeLimit: Number, // Time limit in seconds (optional)
  },

  skills: [String],
  link: String,
  priceEdu: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Course = mongoose.model("Course", CourseSchema);

// Enrollment Schema - Track which users have access to which courses
const EnrollmentSchema = new mongoose.Schema({
  enrollmentId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  courseId: { type: String, required: true },
  status: {
    type: String,
    enum: ["active", "completed", "expired"],
    default: "active",
  },
  purchaseDate: { type: Date, default: Date.now },
  expiryDate: Date,
  accessGranted: { type: Boolean, default: true },
  metadata: {
    priceEdu: Number,
    transactionId: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Compound index for faster lookups
EnrollmentSchema.index({ userId: 1, courseId: 1 });
EnrollmentSchema.index({ enrollmentId: 1 });

const Enrollment = mongoose.model("Enrollment", EnrollmentSchema);

// Connect to MongoDB (Partner's own database)
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("✅ Connected to Partner MongoDB");
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
    });
}

// Helper function to create HMAC signature
function createSignature(timestamp, body) {
  const secret = process.env.PARTNER_SECRET;
  const payload = `${timestamp}${body}`;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  return `sha256=${hmac.digest("hex")}`;
}

// ============================================================================
// COURSE MANAGEMENT ENDPOINTS (Partner creates courses here)
// ============================================================================

// Create new course (for partner to create courses)
router.post("/courses", async (req, res) => {
  try {
    const {
      title,
      description,
      issuer,
      category,
      level,
      credits,
      courseType,
      videoId,
      videoDuration,
      quiz,
      skills,
      link,
      priceEdu,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: title",
      });
    }

    // Validate based on course type
    const type = courseType || "video";
    if (type === "video" && (!videoId || !videoDuration)) {
      return res.status(400).json({
        success: false,
        message: "Video courses require: videoId, videoDuration",
      });
    }
    if (
      (type === "quiz" || type === "hybrid") &&
      (!quiz || !quiz.questions || quiz.questions.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Quiz courses require: quiz.questions array",
      });
    }

    // Generate unique courseId
    const courseId = `${type}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const courseData = {
      courseId,
      title,
      description: description || "",
      issuer: issuer || process.env.PARTNER_NAME || "Partner",
      category: category || "Programming",
      level: level || "Beginner",
      credits: credits || 3,
      courseType: type,
      skills: skills || [],
      link: link || "",
      priceEdu: priceEdu || 0,
    };

    // Add video fields if present
    if (videoId && videoDuration) {
      courseData.videoId = videoId;
      courseData.videoDuration = Number(videoDuration);
    }

    // Add quiz fields if present
    if (quiz && quiz.questions) {
      courseData.quiz = {
        questions: quiz.questions,
        passingScore: quiz.passingScore || 70,
        timeLimit: quiz.timeLimit || null,
      };
    }

    const course = new Course(courseData);
    await course.save();

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    });
  }
});

// Get all courses (EduWallet calls this to sync courses)
router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      courses: courses.map((c) => ({
        id: c.courseId,
        courseId: c.courseId,
        title: c.title,
        name: c.title, // Alias for compatibility
        description: c.description,
        issuer: c.issuer,
        category: c.category,
        level: c.level,
        credits: c.credits,
        courseType: c.courseType,
        videoId: c.videoId,
        videoDuration: c.videoDuration,
        quiz: c.quiz,
        skills: c.skills,
        link: c.link,
        priceEdu: c.priceEdu,
      })),
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
});

// Get course information by ID
router.get("/courses/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findOne({ courseId });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.json({
      success: true,
      course: {
        id: course.courseId,
        courseId: course.courseId,
        title: course.title,
        name: course.title,
        description: course.description,
        issuer: course.issuer,
        category: course.category,
        level: course.level,
        credits: course.credits,
        courseType: course.courseType,
        videoId: course.videoId,
        videoDuration: course.videoDuration,
        quiz: course.quiz,
        skills: course.skills,
        link: course.link,
        priceEdu: course.priceEdu,
      },
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course",
      error: error.message,
    });
  }
});

// ============================================================================
// ENROLLMENT WEBHOOK (EduWallet calls this when user purchases a course)
// ============================================================================

/**
 * POST /api/webhooks/enrollment-created
 * EduWallet gọi endpoint này khi user mua khóa học thành công
 * Mục đích: Grant access cho user để học khóa học
 */
router.post("/webhooks/enrollment-created", async (req, res) => {
  try {
    // Verify signature
    const timestamp = req.headers["x-partner-timestamp"];
    const signature = req.headers["x-partner-signature"];
    const partnerId = req.headers["x-partner-id"];

    if (!timestamp || !signature || !partnerId) {
      return res.status(401).json({
        success: false,
        message: "Missing authentication headers",
      });
    }

    // Verify HMAC signature
    const bodyString = JSON.stringify(req.body);
    const expectedSignature = createSignature(timestamp, bodyString);

    if (signature !== expectedSignature) {
      console.warn("⚠️ Invalid webhook signature from EduWallet");
      return res.status(401).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // Check timestamp to prevent replay attacks (within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const requestTime = parseInt(timestamp);
    if (Math.abs(now - requestTime) > 300) {
      return res.status(401).json({
        success: false,
        message: "Request timestamp expired",
      });
    }

    const {
      enrollmentId,
      userId,
      courseId,
      purchaseDate,
      expiryDate,
      metadata,
    } = req.body;

    // Validate required fields
    if (!enrollmentId || !userId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: enrollmentId, userId, courseId",
      });
    }

    // Check if course exists
    const course = await Course.findOne({ courseId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course not found: ${courseId}`,
      });
    }

    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({ enrollmentId });
    if (existingEnrollment) {
      console.log(
        `ℹ️ Enrollment ${enrollmentId} already exists, returning existing data`
      );
      return res.json({
        success: true,
        message: "Enrollment already exists",
        enrollment: {
          enrollmentId: existingEnrollment.enrollmentId,
          userId: existingEnrollment.userId,
          courseId: existingEnrollment.courseId,
          status: existingEnrollment.status,
          purchaseDate: existingEnrollment.purchaseDate,
          accessUrl: `${process.env.PARTNER_URL}/course/${courseId}?student=${userId}`,
        },
      });
    }

    // Create new enrollment
    const enrollment = new Enrollment({
      enrollmentId,
      userId,
      courseId,
      status: "active",
      purchaseDate: purchaseDate || new Date(),
      expiryDate: expiryDate || null,
      accessGranted: true,
      metadata: metadata || {},
    });

    await enrollment.save();

    console.log(`✅ Enrollment created: ${enrollmentId} for user ${userId}`);

    // Return success response
    res.status(201).json({
      success: true,
      message: "Enrollment created successfully",
      enrollment: {
        enrollmentId,
        userId,
        courseId,
        status: "active",
        purchaseDate: enrollment.purchaseDate,
        accessUrl: `${process.env.PARTNER_URL}/course/${courseId}?student=${userId}`,
        courseInfo: {
          title: course.title,
          courseType: course.courseType,
          credits: course.credits,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error creating enrollment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create enrollment",
      error: error.message,
    });
  }
});

// ============================================================================
// ENROLLMENT MANAGEMENT
// ============================================================================

/**
 * GET /api/enrollments/:userId
 * Lấy danh sách khóa học mà user đã mua
 */
router.get("/enrollments/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const enrollments = await Enrollment.find({
      userId,
      status: "active",
    }).sort({ createdAt: -1 });

    // Get course details for each enrollment
    const enrollmentsWithCourses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await Course.findOne({
          courseId: enrollment.courseId,
        });
        return {
          enrollmentId: enrollment.enrollmentId,
          courseId: enrollment.courseId,
          status: enrollment.status,
          purchaseDate: enrollment.purchaseDate,
          expiryDate: enrollment.expiryDate,
          course: course
            ? {
                title: course.title,
                description: course.description,
                courseType: course.courseType,
                credits: course.credits,
                priceEdu: course.priceEdu,
              }
            : null,
        };
      })
    );

    res.json({
      success: true,
      userId,
      totalEnrollments: enrollments.length,
      enrollments: enrollmentsWithCourses,
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enrollments",
      error: error.message,
    });
  }
});

/**
 * Middleware: Check if user has access to course
 */
async function checkCourseAccess(req, res, next) {
  try {
    const { studentId, courseId } = req.body;

    // Skip check if no studentId or courseId (for backward compatibility)
    if (!studentId || !courseId) {
      return next();
    }

    // Check if enrollment exists
    const enrollment = await Enrollment.findOne({
      userId: studentId,
      courseId: courseId,
      status: "active",
    });

    if (!enrollment) {
      console.warn(
        `⚠️ Access denied: User ${studentId} has no enrollment for course ${courseId}`
      );
      return res.status(403).json({
        success: false,
        message:
          "Access denied. Please purchase this course on EduWallet first.",
        courseId,
        userId: studentId,
      });
    }

    // Check if enrollment expired
    if (enrollment.expiryDate && new Date() > enrollment.expiryDate) {
      return res.status(403).json({
        success: false,
        message: "Your enrollment has expired. Please renew your access.",
        expiryDate: enrollment.expiryDate,
      });
    }

    // Access granted
    req.enrollment = enrollment;
    next();
  } catch (error) {
    console.error("Error checking course access:", error);
    // On error, allow access (for backward compatibility)
    next();
  }
}

// ============================================================================
// LEARNING ENDPOINTS (with access control)
// ============================================================================

// Start learning session
router.post("/learning/start", checkCourseAccess, async (req, res) => {
  const { studentId, courseId } = req.body;

  if (!studentId || !courseId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    const course = await Course.findOne({ courseId });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Initialize student progress
    if (!students[studentId]) {
      students[studentId] = {};
    }

    const startedAt = new Date().toISOString();
    const progressData = {
      progress: 0,
      score: 0,
      status: "In Progress",
      startedAt: startedAt,
      courseType: course.courseType,
    };

    // Add type-specific fields
    if (course.courseType === "video" || course.courseType === "hybrid") {
      progressData.lastWatchedSecond = 0;
    }
    if (course.courseType === "quiz" || course.courseType === "hybrid") {
      progressData.quizAttempts = 0;
      progressData.quizCompleted = false;
    }

    students[studentId][courseId] = progressData;

    // 🆕 Notify EduWallet about learning start
    try {
      await axios.post(
        `${process.env.API_URL}/api/partner/public/learning/start`,
        {
          userId: studentId,
          courseId: courseId,
          startedAt: startedAt,
        },
        {
          headers: {
            "x-api-key": process.env.PARTNER_API_KEY,
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );
      console.log("✅ Notified EduWallet about learning start");
    } catch (error) {
      console.warn(
        "⚠️ Failed to notify EduWallet about learning start:",
        error.message
      );
      // Don't fail the request, just log warning
    }

    res.json({
      success: true,
      message: "Learning session started",
      data: students[studentId][courseId],
      courseType: course.courseType,
    });
  } catch (error) {
    console.error("Error starting learning session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start learning session",
      error: error.message,
    });
  }
});

// Update progress (called periodically as student watches video)
router.post("/learning/progress", async (req, res) => {
  const { studentId, courseId, watchedSeconds } = req.body;

  if (!studentId || !courseId || watchedSeconds === undefined) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    const course = await Course.findOne({ courseId });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (!students[studentId] || !students[studentId][courseId]) {
      return res
        .status(400)
        .json({ success: false, message: "Learning session not started" });
    }

    const studentProgress = students[studentId][courseId];
    studentProgress.lastWatchedSecond = watchedSeconds;
    studentProgress.progress = Math.min(
      100,
      Math.round((watchedSeconds / course.videoDuration) * 100)
    );

    // Update score based on progress
    studentProgress.score = studentProgress.progress;

    // Check if completed
    if (studentProgress.progress >= 100) {
      studentProgress.status = "Completed";
      studentProgress.completedAt = new Date().toISOString();

      // Determine grade based on score
      if (studentProgress.score >= 95) studentProgress.grade = "A+";
      else if (studentProgress.score >= 90) studentProgress.grade = "A";
      else if (studentProgress.score >= 85) studentProgress.grade = "B+";
      else if (studentProgress.score >= 80) studentProgress.grade = "B";
      else studentProgress.grade = "C";
    }

    res.json({
      success: true,
      progress: studentProgress.progress,
      score: studentProgress.score,
      status: studentProgress.status,
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
      error: error.message,
    });
  }
});

// ============================================================================
// QUIZ ENDPOINTS
// ============================================================================

// Get quiz questions (without answers for security)
router.get("/quiz/:courseId/questions", async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findOne({ courseId });

    if (!course || !course.quiz || !course.quiz.questions) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found for this course",
      });
    }

    // Return questions without correct answers
    const questions = course.quiz.questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      // Do NOT return correctAnswer or explanation
    }));

    res.json({
      success: true,
      quiz: {
        questions,
        totalQuestions: questions.length,
        passingScore: course.quiz.passingScore,
        timeLimit: course.quiz.timeLimit,
      },
    });
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz questions",
      error: error.message,
    });
  }
});

// Submit quiz answers and get results
router.post("/quiz/submit", async (req, res) => {
  try {
    const { studentId, courseId, answers } = req.body;

    if (!studentId || !courseId || !answers) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: studentId, courseId, answers",
      });
    }

    const course = await Course.findOne({ courseId });
    if (!course || !course.quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Initialize student progress if not exists
    if (!students[studentId]) {
      students[studentId] = {};
    }
    if (!students[studentId][courseId]) {
      students[studentId][courseId] = {
        progress: 0,
        score: 0,
        status: "In Progress",
        startedAt: new Date().toISOString(),
      };
    }

    // Grade the quiz
    const questions = course.quiz.questions;
    let correctCount = 0;
    const results = [];

    questions.forEach((q) => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;

      results.push({
        questionId: q.id,
        question: q.question,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      });
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= course.quiz.passingScore;

    // Update student progress
    const studentProgress = students[studentId][courseId];
    studentProgress.score = score;
    studentProgress.progress = 100;
    studentProgress.status = passed ? "Completed" : "Failed";
    studentProgress.quizResults = results;
    studentProgress.correctAnswers = correctCount;
    studentProgress.totalQuestions = questions.length;

    if (passed) {
      studentProgress.completedAt = new Date().toISOString();

      // Determine grade based on score
      if (score >= 95) studentProgress.grade = "A+";
      else if (score >= 90) studentProgress.grade = "A";
      else if (score >= 85) studentProgress.grade = "B+";
      else if (score >= 80) studentProgress.grade = "B";
      else if (score >= 70) studentProgress.grade = "C";
      else studentProgress.grade = "D";
    }

    res.json({
      success: true,
      passed,
      score,
      correctAnswers: correctCount,
      totalQuestions: questions.length,
      passingScore: course.quiz.passingScore,
      grade: studentProgress.grade,
      results,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit quiz",
      error: error.message,
    });
  }
});

// ============================================================================
// COURSE COMPLETION
// ============================================================================

// Complete course and send to EduWallet
router.post("/learning/complete", async (req, res) => {
  const { studentId, courseId, enrollmentId } = req.body;

  if (!studentId || !courseId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    const course = await Course.findOne({ courseId });
    const studentProgress = students[studentId]?.[courseId];

    if (!course || !studentProgress) {
      return res
        .status(404)
        .json({ success: false, message: "Course or progress not found" });
    }

    // Prepare CompletedCourse payload theo format mới
    const issueDate = new Date();
    const completedCourseData = {
      name: course.title,
      description: course.description,
      issuer: course.issuer,
      issueDate: issueDate.toISOString(),
      expiryDate: null,
      category: course.category,
      level: course.level,
      credits: course.credits,
      grade: studentProgress.grade || "C",
      score: studentProgress.score,
      status: "Completed",
      progress: 100,
      modulesCompleted: 1,
      totalModules: 1,
      skills: course.skills,
      verificationUrl: null,
      certificateUrl: null,
      imageUrl: null,
    };

    // Nếu có enrollmentId, gọi endpoint complete enrollment
    if (enrollmentId) {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const payload = {
        partnerId: process.env.PARTNER_ID,
        eventType: "course_completed",
        studentId: studentId,
        courseId: courseId,
        enrollmentId: enrollmentId,
        completedCourse: completedCourseData,
      };

      const bodyString = JSON.stringify(payload);
      const signature = createSignature(timestamp, bodyString);

      const webhookUrl = `${process.env.EDUWALLET_API_URL}${process.env.EDUWALLET_WEBHOOK_ENDPOINT}`;

      // Use retry mechanism
      const response = await sendWebhookWithRetry(webhookUrl, payload, {
        "Content-Type": "application/json",
        "X-Partner-Id": process.env.PARTNER_ID,
        "X-Partner-Timestamp": timestamp,
        "X-Partner-Signature": signature,
      });

      res.json({
        success: true,
        message: "Course completed and sent to EduWallet",
        eduWalletResponse: response.data,
        completedCourse: completedCourseData,
        studentProgress,
      });
    } else {
      // Fallback: gửi qua webhook nếu không có enrollmentId
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const payload = {
        partnerId: process.env.PARTNER_ID,
        eventType: "course_completed",
        studentId: studentId,
        courseId: courseId,
        completedCourse: completedCourseData,
      };

      const bodyString = JSON.stringify(payload);
      const signature = createSignature(timestamp, bodyString);

      const webhookUrl = `${process.env.API_URL}${process.env.WEBHOOK_ENDPOINT}`;

      // Use retry mechanism
      const response = await sendWebhookWithRetry(webhookUrl, payload, {
        "Content-Type": "application/json",
        "X-Partner-Id": process.env.PARTNER_ID,
        "X-Partner-Timestamp": timestamp,
        "X-Partner-Signature": signature,
      });

      res.json({
        success: true,
        message: "Course completed and sent to EduWallet",
        eduWalletResponse: response.data,
        completedCourse: completedCourseData,
        studentProgress,
      });
    }
  } catch (error) {
    console.error(
      "Error sending to EduWallet:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to send to EduWallet",
      error: error.response?.data || error.message,
    });
  }
});

// Get student progress
router.get("/learning/progress/:studentId/:courseId", (req, res) => {
  const { studentId, courseId } = req.params;

  const progress = students[studentId]?.[courseId];

  if (!progress) {
    return res
      .status(404)
      .json({ success: false, message: "Progress not found" });
  }

  res.json({ success: true, progress });
});

// =====================================================================
// ENHANCED FEATURES - Week 1 & 2
// =====================================================================

/**
 * POST /webhook/confirmation
 * EduWallet confirms webhook receipt
 */
router.post("/webhook/confirmation", (req, res) => {
  const { webhookId, status, enrollmentId } = req.body;

  console.log(`✅ Webhook confirmation received:`);
  console.log(`   - Webhook ID: ${webhookId}`);
  console.log(`   - Status: ${status}`);
  console.log(`   - Enrollment ID: ${enrollmentId}`);

  // Store confirmation for tracking
  if (!global.webhookConfirmations) {
    global.webhookConfirmations = {};
  }
  global.webhookConfirmations[webhookId] = {
    status,
    enrollmentId,
    confirmedAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    message: "Confirmation received",
    webhookId,
  });
});

/**
 * GET /sync/progress/:studentId/:courseId
 * Resync progress when data is out of sync
 */
router.get("/sync/progress/:studentId/:courseId", (req, res) => {
  const { studentId, courseId } = req.params;

  const progress = students[studentId]?.[courseId];

  if (!progress) {
    return res.status(404).json({
      success: false,
      message: "Progress not found for this student and course",
    });
  }

  res.json({
    success: true,
    data: {
      studentId,
      courseId,
      progress: progress.progress,
      score: progress.score,
      status: progress.status,
      lastWatchedSecond: progress.lastWatchedSecond,
      completedAt: progress.completedAt,
      startedAt: progress.startedAt,
      metadata: progress,
    },
  });
});

/**
 * GET /admin/failed-webhooks
 * Get list of failed webhook deliveries
 */
router.get("/admin/failed-webhooks", (req, res) => {
  res.json({
    success: true,
    failedWebhooks: global.failedWebhooks || [],
    count: (global.failedWebhooks || []).length,
  });
});

/**
 * POST /admin/retry-webhook/:index
 * Manually retry a failed webhook
 */
router.post("/admin/retry-webhook/:index", async (req, res) => {
  const index = parseInt(req.params.index);
  const failedWebhooks = global.failedWebhooks || [];

  if (index < 0 || index >= failedWebhooks.length) {
    return res
      .status(404)
      .json({ success: false, message: "Webhook not found" });
  }

  const webhook = failedWebhooks[index];

  try {
    const response = await axios.post(webhook.url, webhook.data, {
      headers: webhook.headers,
      timeout: 10000,
    });

    // Remove from failed list
    failedWebhooks.splice(index, 1);

    res.json({
      success: true,
      message: "Webhook retried successfully",
      response: response.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Retry failed",
      error: error.message,
    });
  }
});

/**
 * GET /student/:studentId/dashboard
 * Get student dashboard with all courses and stats
 */
router.get("/student/:studentId/dashboard", async (req, res) => {
  const { studentId } = req.params;
  const studentData = students[studentId];

  if (!studentData) {
    return res.status(404).json({
      success: false,
      message: "Student not found",
    });
  }

  try {
    const coursesData = await Promise.all(
      Object.entries(studentData).map(async ([courseId, progress]) => {
        const course = await Course.findOne({ courseId });
        const timeSpent = progress.lastWatchedSecond || 0;

        return {
          courseId,
          courseName: course?.title || "Unknown Course",
          courseDescription: course?.description,
          progress: progress.progress,
          score: progress.score,
          status: progress.status,
          startedAt: progress.startedAt,
          completedAt: progress.completedAt,
          lastWatchedSecond: progress.lastWatchedSecond,
          timeSpent: timeSpent,
          grade: progress.grade,
        };
      })
    );

    const completedCourses = coursesData.filter(
      (c) => c.status === "Completed"
    );
    const stats = {
      totalCourses: coursesData.length,
      inProgress: coursesData.filter((c) => c.status === "In Progress").length,
      completed: completedCourses.length,
      averageScore:
        completedCourses.length > 0
          ? (
              completedCourses.reduce((sum, c) => sum + (c.score || 0), 0) /
              completedCourses.length
            ).toFixed(2)
          : 0,
      totalTimeSpent: coursesData.reduce((sum, c) => sum + c.timeSpent, 0),
    };

    res.json({
      success: true,
      studentId,
      stats,
      courses: coursesData,
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard",
      error: error.message,
    });
  }
});

/**
 * Helper function: Send webhook with retry mechanism
 */
async function sendWebhookWithRetry(url, data, headers, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.post(url, data, {
        headers,
        timeout: 10000,
      });

      console.log(`✅ Webhook sent successfully (attempt ${i + 1})`);
      return response;
    } catch (error) {
      console.error(
        `❌ Webhook failed (attempt ${i + 1}/${maxRetries}):`,
        error.message
      );

      if (i === maxRetries - 1) {
        // Last attempt failed, store for manual retry
        if (!global.failedWebhooks) {
          global.failedWebhooks = [];
        }
        global.failedWebhooks.push({
          url,
          data,
          headers,
          failedAt: new Date().toISOString(),
          error: error.message,
          attempts: maxRetries,
        });
        throw error;
      }

      // Wait before retry (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, i))
      );
    }
  }
}

module.exports = router;
