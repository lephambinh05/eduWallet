const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const axios = require("axios");

// Mock database
const students = {};
const courses = {
  hybrid_course_001: {
    id: "hybrid_course_001",
    name: "Full Stack Web Development",
    description:
      "Khóa học Full Stack từ cơ bản đến nâng cao với video và bài kiểm tra",
    issuer: "Học viện Công nghệ",
    category: "Programming",
    level: "Advanced",
    credits: 4,
    skills: ["React", "Node.js", "MongoDB", "Express", "REST API"],
    tasks: [
      {
        id: "task_1",
        type: "video",
        title: "Xem video hướng dẫn",
        videoId: "dQw4w9WgXcQ",
        videoDuration: 480, // 8 minutes
        description: "Xem video hướng dẫn về Full Stack Development",
      },
      {
        id: "task_2",
        type: "quiz",
        title: "Bài kiểm tra kiến thức",
        description: "Trả lời 5 câu hỏi về Full Stack Development",
        questions: [
          {
            id: "q1",
            question: "REST API là gì?",
            options: [
              "Một framework JavaScript",
              "Một kiến trúc web service",
              "Một database",
              "Một ngôn ngữ lập trình",
            ],
            correctAnswer: 1,
          },
          {
            id: "q2",
            question: "MongoDB là loại database nào?",
            options: [
              "SQL database",
              "NoSQL database",
              "Graph database",
              "In-memory database",
            ],
            correctAnswer: 1,
          },
          {
            id: "q3",
            question: "Express.js được sử dụng cho?",
            options: [
              "Frontend framework",
              "Backend framework",
              "Database",
              "Testing framework",
            ],
            correctAnswer: 1,
          },
          {
            id: "q4",
            question: "React sử dụng concept nào để quản lý UI?",
            options: ["MVC", "Component-based", "Page-based", "Template-based"],
            correctAnswer: 1,
          },
          {
            id: "q5",
            question: "Node.js chạy trên runtime nào?",
            options: ["Browser", "V8 Engine", "JVM", ".NET Runtime"],
            correctAnswer: 1,
          },
        ],
      },
    ],
  },
};

// Helper function to create HMAC signature
function createSignature(timestamp, body) {
  const secret = process.env.PARTNER_SECRET;
  const payload = `${timestamp}${body}`;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  return `sha256=${hmac.digest("hex")}`;
}

// Get all courses
router.get("/courses", (req, res) => {
  res.json({
    success: true,
    courses: Object.values(courses),
  });
});

// Get course information
router.get("/courses/:courseId", (req, res) => {
  const { courseId } = req.params;
  const course = courses[courseId];

  if (!course) {
    return res
      .status(404)
      .json({ success: false, message: "Course not found" });
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
