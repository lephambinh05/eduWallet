const express = require("express");
const router = express.Router();
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
  courseId: { type: String, required: true }, // Partner's course ID
  eduwalletItemId: { type: String }, // EduWallet's itemId for webhook lookups
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

// QuizResult Schema - persist quiz submissions so each student can only submit once
const QuizResultSchema = new mongoose.Schema({
  courseId: { type: String, required: true },
  studentId: { type: String, required: true },
  enrollmentId: { type: String }, // mapping to EduWallet registration/enrollment
  answers: { type: Object },
  score: Number,
  passed: Boolean,
  correctAnswers: Number,
  totalQuestions: Number,
  grade: String,
  results: [
    {
      questionId: Number,
      question: String,
      userAnswer: Number,
      correctAnswer: Number,
      isCorrect: Boolean,
      explanation: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

QuizResultSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
const QuizResult = mongoose.model("QuizResult", QuizResultSchema);

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

// Removed unused createSignature helper after webhook logic removal.

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

    // Additional validation: quiz questions must include options, and partner must supply skills
    if (type === "quiz" || type === "hybrid") {
      // skills must be provided and non-empty
      if (!skills || !Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Quiz courses require: skills array (at least one skill)",
        });
      }

      // Validate each question has options (or answers) and a question text
      for (let i = 0; i < quiz.questions.length; i++) {
        const q = quiz.questions[i];
        const optionsArr =
          (q.options && q.options.length) ||
          (q.answers && q.answers.length) ||
          [];
        if (
          !q.question ||
          typeof q.question !== "string" ||
          optionsArr.length === 0
        ) {
          return res.status(400).json({
            success: false,
            message: `Quiz question #${
              i + 1
            } is missing question text or options`,
          });
        }
      }
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

    // Add quiz fields if present and normalize shape to ensure backend schema
    if (quiz && quiz.questions) {
      const normalizedQuestions = quiz.questions.map((q, idx) => {
        const options =
          (q.options && q.options.slice()) ||
          (q.answers && q.answers.slice()) ||
          [];
        return {
          id: q.id || idx + 1,
          question: q.question || q.questionText || "",
          options: options,
          correctAnswer:
            typeof q.correctAnswer === "number"
              ? q.correctAnswer
              : typeof q.correct === "number"
              ? q.correct
              : 0,
          explanation: q.explanation || "",
        };
      });

      courseData.quiz = {
        questions: normalizedQuestions,
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

// Webhook logic removed. All enrollment and learning events now use direct API calls to EduWallet.

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
 * Temporarily disabled for testing
 */
async function checkCourseAccess(req, res, next) {
  try {
    const { studentId, courseId } = req.body;

    // Skip check if no studentId or courseId (for backward compatibility)
    if (!studentId || !courseId) {
      return next();
    }

    // Temporarily disabled enrollment check for testing
    console.warn(
      `[TESTING] Skipping enrollment check for user ${studentId} course ${courseId}`
    );
    req.enrollment = null; // No enrollment data
    return next();
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
  const { studentId, courseId, enrollmentId } = req.body;
  console.log("[LEARNING/START] Request body:", req.body);

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
      enrollmentId: enrollmentId || null, // Store enrollmentId
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

    // Gọi trực tiếp EduWallet backend /api/partner/public/learning/start
    try {
      const resp = await axios.post(
        `${process.env.EDUWALLET_API_URL}/api/partner/public/learning/start`,
        {
          courseId: courseId,
        },
        {
          headers: {
            Authorization:
              req.headers["authorization"] ||
              req.headers["Authorization"] ||
              "",
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );
      console.log(
        "✅ Called EduWallet /api/partner/public/learning/start. Response:",
        resp.data
      );
    } catch (error) {
      console.warn(
        "⚠️ Failed to call EduWallet /api/partner/public/learning/start:",
        error.message,
        error.response?.data
      );
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

// Get existing quiz result for a student (if any)
router.get("/quiz/:courseId/result", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { student, studentId, enrollmentId } = req.query;
    const sid = studentId || student;

    if (!sid || !courseId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing student or courseId" });
    }

    // Prefer lookup by student+course; if enrollmentId provided, try that as well
    let query = { studentId: sid, courseId };
    let result = await QuizResult.findOne(query).lean();
    if (!result && enrollmentId) {
      result = await QuizResult.findOne({ enrollmentId, courseId }).lean();
    }

    if (!result) {
      return res.json({ success: false, message: "No existing result" });
    }

    // Also include quiz shape for client display
    const course = await Course.findOne({ courseId });
    const quiz = course?.quiz || null;

    res.json({ success: true, result, quiz });
  } catch (error) {
    console.error("Error fetching quiz result:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz result",
      error: error.message,
    });
  }
});

// Submit quiz answers and persist result (one submission per student per course)
router.post("/quiz/submit", async (req, res) => {
  try {
    const { studentId, courseId, answers, enrollmentId } = req.body;

    if (!studentId || !courseId || !answers) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: studentId, courseId, answers",
      });
    }

    const course = await Course.findOne({ courseId });
    if (!course || !course.quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    // Check if result already exists in DB
    const existing = await QuizResult.findOne({ studentId, courseId });
    if (existing) {
      return res.json({
        success: false,
        alreadySubmitted: true,
        existingResult: existing,
      });
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

    // Determine grade
    let grade = "D";
    if (score >= 95) grade = "A+";
    else if (score >= 90) grade = "A";
    else if (score >= 85) grade = "B+";
    else if (score >= 80) grade = "B";
    else if (score >= 70) grade = "C";

    // Persist result
    const quizResult = new QuizResult({
      courseId,
      studentId,
      enrollmentId: enrollmentId || null,
      answers,
      score,
      passed,
      correctAnswers: correctCount,
      totalQuestions: questions.length,
      grade,
      results,
    });

    await quizResult.save();

    // Update in-memory progress as before for backward compatibility
    if (!students[studentId]) students[studentId] = {};
    students[studentId][courseId] = students[studentId][courseId] || {
      startedAt: new Date().toISOString(),
    };
    const studentProgress = students[studentId][courseId];
    studentProgress.score = score;
    studentProgress.progress = 100;
    studentProgress.status = passed ? "Completed" : "Failed";
    studentProgress.quizResults = results;
    studentProgress.correctAnswers = correctCount;
    studentProgress.totalQuestions = questions.length;
    if (passed) studentProgress.completedAt = new Date().toISOString();

    // If passed and enrollmentId is present, update Enrollment status
    if (passed && enrollmentId) {
      try {
        const enrollment = await Enrollment.findOne({ enrollmentId });
        if (enrollment) {
          enrollment.status = "completed";
          enrollment.completedAt = new Date();
          await enrollment.save();
        } else {
          console.warn(
            `No Enrollment found for enrollmentId ${enrollmentId} when trying to mark as completed after quiz submit.`
          );
        }
      } catch (err) {
        console.error("Error updating Enrollment after quiz submit:", err);
      }
    }
    res.json({
      success: true,
      passed,
      score,
      correctAnswers: correctCount,
      totalQuestions: questions.length,
      passingScore: course.quiz.passingScore,
      grade,
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
  console.log("[LEARNING/COMPLETE] Request body:", req.body);

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

    // Gọi trực tiếp EduWallet backend /api/learning/complete (commented out - handled by webhook)
    // const resp = await axios.post(
    //   `${process.env.EDUWALLET_API_URL}/api/learning/complete`,
    //   {
    //     courseId: courseId,
    //   },
    //   {
    //     headers: {
    //       Authorization:
    //         req.headers["authorization"] || req.headers["Authorization"] || "",
    //       "Content-Type": "application/json",
    //     },
    //     timeout: 5000,
    //   }
    // );
    // console.log(
    //   "✅ Called EduWallet /api/learning/complete. Response:",
    //   resp.data
    // );

    // Ensure enrollmentId is stored in students
    if (!students[studentId]) {
      students[studentId] = {};
    }
    if (!students[studentId][courseId]) {
      students[studentId][courseId] = {};
    }
    if (enrollmentId) {
      students[studentId][courseId].enrollmentId = enrollmentId;
    }

    // Send webhook to EduWallet with completion data
    const finalEnrollmentId =
      students[studentId]?.[courseId]?.enrollmentId || null;

    // Get EduWallet course ID from EduWallet enrollment directly
    let eduwalletCourseId = courseId; // fallback
    if (finalEnrollmentId) {
      try {
        console.log(
          "[WEBHOOK] Getting EduWallet enrollment for:",
          finalEnrollmentId
        );
        // Call EduWallet API to get enrollment details
        const eduWalletResp = await axios.get(
          `${process.env.EDUWALLET_API_URL}/api/partner/public/enrollment/${finalEnrollmentId}`,
          {
            timeout: 5000,
          }
        );
        const enrollmentData = eduWalletResp.data.data.enrollment;
        console.log(
          "[WEBHOOK] EduWallet enrollment data:",
          JSON.stringify(enrollmentData, null, 2)
        );
        if (enrollmentData?.itemId) {
          if (
            typeof enrollmentData.itemId === "object" &&
            enrollmentData.itemId._id
          ) {
            eduwalletCourseId = enrollmentData.itemId._id.toString();
          } else if (typeof enrollmentData.itemId === "string") {
            eduwalletCourseId = enrollmentData.itemId;
          }
          console.log("[WEBHOOK] Using eduwalletCourseId:", eduwalletCourseId);
        } else {
          console.log("[WEBHOOK] No itemId found in enrollment data");
        }
      } catch (err) {
        console.warn(
          "[WEBHOOK] Could not get EduWallet enrollment for webhook:",
          err.message
        );
        console.warn("[WEBHOOK] Using fallback courseId:", courseId);
      }
    }

    try {
      const webhookPayload = {
        eventType: "course_completed",
        studentId: studentId,
        courseId: eduwalletCourseId, // Send EduWallet course ID
        enrollmentId: finalEnrollmentId,
        completedCourse: {
          _id: `completion_${Date.now()}`,
          name: course.title,
          issuer: course.issuer || "Partner1",
          score: students[studentId][courseId].score || 0,
          passed: true,
          correctAnswers: students[studentId][courseId].correctAnswers || 0,
          totalQuestions: course.quiz?.questions?.length || 0,
          grade: "A+",
          results: [],
          createdAt: new Date().toISOString(),
          __v: 0,
        },
      };

      const webhookResp = await axios.post(
        `${process.env.EDUWALLET_API_URL}/api/webhooks/partner-updates`,
        webhookPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );
      console.log("✅ Webhook sent successfully:", webhookResp.data);
    } catch (webhookError) {
      console.error(
        "❌ Webhook failed:",
        webhookError.response?.data || webhookError.message
      );
    }

    res.json({
      success: true,
      message: "Course completed and sent to EduWallet via webhook",
      // eduWalletResponse: resp.data,
    });
  } catch (error) {
    console.error(
      "Error in /learning/complete:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to complete course",
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

// Webhook confirmation endpoint removed.

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

// Failed webhook admin endpoint removed.

// Manual webhook retry endpoint removed.

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

// Webhook retry helper removed.

// Sync enrollment from EduWallet
router.post("/enrollment/sync", async (req, res) => {
  const { enrollmentId, studentId, courseId: providedCourseId } = req.body;

  if (!enrollmentId || !studentId) {
    return res.status(400).json({
      success: false,
      message: "Missing enrollmentId or studentId",
    });
  }

  try {
    // Call EduWallet API to get enrollment details
    const eduWalletResp = await axios.get(
      `${process.env.EDUWALLET_API_URL}/api/partner/public/enrollment/${enrollmentId}`,
      {
        timeout: 5000,
      }
    );

    const enrollmentData = eduWalletResp.data.data.enrollment;

    // Extract partner's courseId from accessLink
    let partnerCourseId = providedCourseId; // fallback to provided
    if (enrollmentData.accessLink) {
      try {
        const url = new URL(enrollmentData.accessLink);
        const pathParts = url.pathname.split("/").filter((p) => p);
        // accessLink format: /course/{courseId}
        if (pathParts[0] === "course" && pathParts[1]) {
          partnerCourseId = pathParts[1];
        }
      } catch (urlError) {
        console.warn(
          "Could not parse accessLink for courseId:",
          urlError.message
        );
      }
    }

    // If still no courseId, try from enrollment data
    if (!partnerCourseId) {
      partnerCourseId =
        enrollmentData.itemId?._id?.toString() ||
        enrollmentData.itemId?.toString();
    }

    if (!partnerCourseId) {
      return res.status(400).json({
        success: false,
        message: "Could not determine partner's courseId",
      });
    }

    // Map EduWallet status to partner status
    let partnerStatus = "active";
    if (enrollmentData.status === "in_progress") {
      partnerStatus = "active";
    } else if (enrollmentData.status === "completed") {
      partnerStatus = "completed";
    } else if (enrollmentData.status === "expired") {
      partnerStatus = "expired";
    }

    // Check if enrollment already exists in partner database
    const existingEnrollment = await Enrollment.findOne({
      enrollmentId: enrollmentId,
    });

    if (existingEnrollment) {
      // Update existing
      Object.assign(existingEnrollment, {
        userId: studentId,
        courseId: partnerCourseId, // Use extracted partner's courseId
        eduwalletItemId:
          enrollmentData.itemId?._id?.toString() ||
          enrollmentData.itemId?.toString(), // Store EduWallet itemId directly
        status: partnerStatus,
        purchaseDate: enrollmentData.createdAt,
        expiryDate: null,
        accessGranted: true,
        metadata: {
          priceEdu: 0,
          transactionId: enrollmentData.purchase,
        },
        updatedAt: new Date(),
      });
      await existingEnrollment.save();
      console.log(`✅ Updated enrollment ${enrollmentId} in partner database`);
    } else {
      // Create new
      const newEnrollment = new Enrollment({
        enrollmentId: enrollmentId,
        userId: studentId,
        courseId: partnerCourseId, // Use extracted partner's courseId
        eduwalletItemId:
          enrollmentData.itemId?._id?.toString() ||
          enrollmentData.itemId?.toString(), // EduWallet itemId from enrollment data
        status: partnerStatus,
        purchaseDate: enrollmentData.createdAt,
        expiryDate: null,
        accessGranted: true,
        metadata: {
          priceEdu: 0,
          transactionId: enrollmentData.purchase,
        },
      });
      await newEnrollment.save();
      console.log(`✅ Created enrollment ${enrollmentId} in partner database`);
    }

    res.json({
      success: true,
      message: "Enrollment synced successfully",
      enrollment: enrollmentData,
    });
  } catch (error) {
    console.error("Error syncing enrollment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync enrollment",
      error: error.message,
    });
  }
});

// Get single enrollment by ID for EduWallet sync
router.get("/enrollment/:id", async (req, res) => {
  try {
    const enrollmentId = req.params.id;

    // Find enrollment in database
    const enrollment = await Enrollment.findOne({
      enrollmentId: enrollmentId,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Get course details
    const course = await Course.findOne({
      courseId: enrollment.courseId,
    });

    res.json({
      success: true,
      data: {
        enrollment: {
          _id: enrollment.enrollmentId,
          courseId: enrollment.courseId,
          status: enrollment.status,
          progressPercent: enrollment.progressPercent || 0,
          totalPoints: enrollment.totalPoints || 0,
          timeSpentSeconds: enrollment.timeSpentSeconds || 0,
          completedAt: enrollment.completedAt,
          lastAccessed: enrollment.lastAccessed,
          purchaseDate: enrollment.purchaseDate,
          expiryDate: enrollment.expiryDate,
          metadata: enrollment.metadata || {},
          course: course
            ? {
                title: course.title,
                description: course.description,
                courseType: course.courseType,
                credits: course.credits,
                priceEdu: course.priceEdu,
              }
            : null,
        },
      },
    });
  } catch (error) {
    console.error("Error getting enrollment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get enrollment",
      error: error.message,
    });
  }
});

module.exports = router;
