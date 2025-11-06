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

// Hybrid Course Schema (Video + Quiz tasks)
const HybridCourseSchema = new mongoose.Schema({
  courseId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  issuer: String,
  category: String,
  level: String,
  credits: Number,
  skills: [String],
  link: String,
  priceEdu: Number,
  tasks: [{
    id: String,
    type: String, // 'video' or 'quiz'
    title: String,
    // For video type:
    videoId: String,
    videoDuration: Number,
    description: String,
    // For quiz type:
    questions: [{
      id: String,
      question: String,
      options: [String],
      correctAnswer: Number
    }]
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const HybridCourse = mongoose.model('HybridCourse', HybridCourseSchema);

// Connect to MongoDB (Partner's own database)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('✅ Connected to Partner MongoDB (Hybrid)');
  }).catch(err => {
    console.error('❌ MongoDB connection error:', err);
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

// Create new hybrid course
router.post("/courses", async (req, res) => {
  try {
    const { title, description, issuer, category, level, credits, skills, tasks, link, priceEdu } = req.body;

    if (!title || !tasks || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, tasks"
      });
    }

    // Generate unique courseId
    const courseId = `hybrid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const course = new HybridCourse({
      courseId,
      title,
      description: description || "",
      issuer: issuer || process.env.PARTNER_NAME || "Partner",
      category: category || "Programming",
      level: level || "Advanced",
      credits: credits || 4,
      skills: skills || [],
      tasks: tasks,
      link: link || "",
      priceEdu: priceEdu || 0
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: "Hybrid course created successfully",
      course
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message
    });
  }
});

// Get all courses (EduWallet calls this to sync courses)
router.get("/courses", async (req, res) => {
  try {
    const courses = await HybridCourse.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      courses: courses.map(c => ({
        id: c.courseId,
        courseId: c.courseId,
        title: c.title,
        name: c.title,
        description: c.description,
        issuer: c.issuer,
        category: c.category,
        level: c.level,
        credits: c.credits,
        skills: c.skills,
        tasks: c.tasks,
        link: c.link,
        priceEdu: c.priceEdu
      }))
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
      error: error.message
    });
  }
});

// Get course information by ID
router.get("/courses/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await HybridCourse.findOne({ courseId });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
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
        skills: course.skills,
        tasks: course.tasks,
        link: course.link,
        priceEdu: course.priceEdu
      }
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course",
      error: error.message
    });
  }
});
  }

  res.json({ success: true, course });
});

// Start learning session
router.post("/learning/start", async (req, res) => {
  const { studentId, courseId } = req.body;

  if (!studentId || !courseId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  const course = courses[courseId];
  if (!course) {
    return res
      .status(404)
      .json({ success: false, message: "Course not found" });
  }

  if (!students[studentId]) {
    students[studentId] = {};
  }

  const startedAt = new Date().toISOString();
  students[studentId][courseId] = {
    progress: 0,
    score: 0,
    status: "In Progress",
    startedAt: startedAt,
    tasksCompleted: 0,
    totalTasks: course.tasks.length,
    taskResults: {},
    currentTask: 0,
  };

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
  }

  res.json({
    success: true,
    message: "Learning session started",
    data: students[studentId][courseId],
  });
});

// Update video progress
router.post("/learning/video-progress", (req, res) => {
  const { studentId, courseId, taskId, watchedSeconds } = req.body;

  if (!studentId || !courseId || !taskId || watchedSeconds === undefined) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  const course = courses[courseId];
  const studentProgress = students[studentId]?.[courseId];

  if (!course || !studentProgress) {
    return res
      .status(404)
      .json({ success: false, message: "Course or progress not found" });
  }

  const task = course.tasks.find((t) => t.id === taskId);
  if (!task || task.type !== "video") {
    return res
      .status(400)
      .json({ success: false, message: "Invalid video task" });
  }

  const videoProgress = Math.min(
    100,
    Math.round((watchedSeconds / task.videoDuration) * 100)
  );

  if (!studentProgress.taskResults[taskId]) {
    studentProgress.taskResults[taskId] = {};
  }

  studentProgress.taskResults[taskId].watchedSeconds = watchedSeconds;
  studentProgress.taskResults[taskId].progress = videoProgress;
  studentProgress.taskResults[taskId].type = "video";

  if (videoProgress >= 100) {
    studentProgress.taskResults[taskId].completed = true;
    studentProgress.taskResults[taskId].score = 100;
    studentProgress.taskResults[taskId].completedAt = new Date().toISOString();
  }

  updateOverallProgress(studentProgress, course);

  res.json({
    success: true,
    videoProgress,
    overallProgress: studentProgress.progress,
    score: studentProgress.score,
  });
});

// Submit quiz task
router.post("/learning/submit-quiz", (req, res) => {
  const { studentId, courseId, taskId, answers } = req.body;

  if (!studentId || !courseId || !taskId || !answers) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  const course = courses[courseId];
  const studentProgress = students[studentId]?.[courseId];

  if (!course || !studentProgress) {
    return res
      .status(404)
      .json({ success: false, message: "Course or progress not found" });
  }

  const task = course.tasks.find((t) => t.id === taskId);
  if (!task || task.type !== "quiz") {
    return res
      .status(400)
      .json({ success: false, message: "Invalid quiz task" });
  }

  let correctAnswers = 0;
  task.questions.forEach((question) => {
    if (answers[question.id] === question.correctAnswer) {
      correctAnswers++;
    }
  });

  const quizScore = (correctAnswers / task.questions.length) * 100;

  studentProgress.taskResults[taskId] = {
    type: "quiz",
    score: quizScore,
    correctAnswers,
    totalQuestions: task.questions.length,
    completed: true,
    completedAt: new Date().toISOString(),
    answers,
  };

  updateOverallProgress(studentProgress, course);

  res.json({
    success: true,
    quizResult: studentProgress.taskResults[taskId],
    overallProgress: studentProgress.progress,
    score: studentProgress.score,
    status: studentProgress.status,
    grade: studentProgress.grade,
  });
});

function updateOverallProgress(studentProgress, course) {
  const completedTasks = Object.values(studentProgress.taskResults).filter(
    (r) => r.completed
  ).length;
  studentProgress.tasksCompleted = completedTasks;
  studentProgress.progress = (completedTasks / course.tasks.length) * 100;

  // Calculate overall score
  const scores = Object.values(studentProgress.taskResults)
    .filter((r) => r.completed && r.score !== undefined)
    .map((r) => r.score);

  if (scores.length > 0) {
    studentProgress.score = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length
    );
  }

  // Update status and grade
  if (studentProgress.progress >= 100) {
    studentProgress.status = "Completed";
    studentProgress.completedAt = new Date().toISOString();

    if (studentProgress.score >= 95) studentProgress.grade = "A+";
    else if (studentProgress.score >= 90) studentProgress.grade = "A";
    else if (studentProgress.score >= 85) studentProgress.grade = "B+";
    else if (studentProgress.score >= 80) studentProgress.grade = "B";
    else if (studentProgress.score >= 70) studentProgress.grade = "C";
    else studentProgress.grade = "D";
  }
}

// Complete course and send to EduWallet
router.post("/learning/complete", async (req, res) => {
  const { studentId, courseId, enrollmentId } = req.body;

  if (!studentId || !courseId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  const course = courses[courseId];
  const studentProgress = students[studentId]?.[courseId];

  if (!course || !studentProgress) {
    return res
      .status(404)
      .json({ success: false, message: "Course or progress not found" });
  }

  if (studentProgress.progress < 100) {
    return res
      .status(400)
      .json({ success: false, message: "Course not completed yet" });
  }

  // Prepare CompletedCourse payload theo format mới
  const issueDate = new Date();
  const completedCourseData = {
    name: course.name,
    description: course.description,
    issuer: course.issuer,
    issueDate: issueDate.toISOString(),
    expiryDate: null,
    category: course.category,
    level: course.level,
    credits: course.credits,
    grade: studentProgress.grade,
    score: studentProgress.score,
    status: "Completed",
    progress: 100,
    modulesCompleted: studentProgress.tasksCompleted,
    totalModules: studentProgress.totalTasks,
    skills: course.skills,
    verificationUrl: null,
    certificateUrl: null,
    imageUrl: null,
  };

  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payload = {
      partnerId: process.env.PARTNER_ID,
      eventType: "course_completed",
      studentId: studentId,
      courseId: courseId,
      enrollmentId: enrollmentId || null,
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
  } catch (error) {
    console.error(
      "Error sending to EduWallet:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to send to EduWallet",
      error: error.response?.data || error.message,
      completedCourse: completedCourseData,
      studentProgress,
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

router.post("/webhook/confirmation", (req, res) => {
  const { webhookId, status, enrollmentId } = req.body;

  console.log(`✅ Webhook confirmation received:`);
  console.log(`   - Webhook ID: ${webhookId}`);
  console.log(`   - Status: ${status}`);
  console.log(`   - Enrollment ID: ${enrollmentId}`);

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
      taskResults: progress.taskResults,
      completedAt: progress.completedAt,
      startedAt: progress.startedAt,
      metadata: progress,
    },
  });
});

router.get("/admin/failed-webhooks", (req, res) => {
  res.json({
    success: true,
    failedWebhooks: global.failedWebhooks || [],
    count: (global.failedWebhooks || []).length,
  });
});

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

router.get("/student/:studentId/dashboard", (req, res) => {
  const { studentId } = req.params;
  const studentData = students[studentId];

  if (!studentData) {
    return res.status(404).json({
      success: false,
      message: "Student not found",
    });
  }

  const coursesData = Object.entries(studentData).map(
    ([courseId, progress]) => {
      const course = courses[courseId];

      return {
        courseId,
        courseName: course?.name,
        courseDescription: course?.description,
        progress: progress.progress,
        score: progress.score,
        status: progress.status,
        startedAt: progress.startedAt,
        completedAt: progress.completedAt,
        taskResults: progress.taskResults,
        grade: progress.grade,
      };
    }
  );

  const completedCourses = coursesData.filter((c) => c.status === "Completed");
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
  };

  res.json({
    success: true,
    studentId,
    stats,
    courses: coursesData,
  });
});

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

      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, i))
      );
    }
  }
}

module.exports = router;
