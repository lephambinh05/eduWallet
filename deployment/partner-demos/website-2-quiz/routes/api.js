const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const axios = require("axios");

// Mock database
const students = {};
const courses = {
  quiz_course_001: {
    id: "quiz_course_001",
    name: "Kiểm tra kiến thức JavaScript",
    description: "Khóa học kiểm tra kiến thức JavaScript qua 2 bài quiz",
    issuer: "Đại học Bách Khoa",
    category: "Programming",
    level: "Intermediate",
    credits: 2,
    skills: ["JavaScript", "ES6", "Async Programming", "DOM Manipulation"],
    tasks: [
      {
        id: "task_1",
        title: "JavaScript Cơ bản",
        questions: [
          {
            id: "q1",
            question: "JavaScript là ngôn ngữ lập trình gì?",
            options: [
              "Ngôn ngữ biên dịch",
              "Ngôn ngữ thông dịch",
              "Ngôn ngữ máy",
              "Ngôn ngữ assembly",
            ],
            correctAnswer: 1,
          },
          {
            id: "q2",
            question: "Cách khai báo biến trong JavaScript là?",
            options: [
              "var, let, const",
              "int, float, string",
              "dim, set",
              "define, declare",
            ],
            correctAnswer: 0,
          },
          {
            id: "q3",
            question: "typeof null trả về giá trị gì?",
            options: ["null", "undefined", "object", "number"],
            correctAnswer: 2,
          },
          {
            id: "q4",
            question: "Arrow function được giới thiệu trong phiên bản nào?",
            options: ["ES5", "ES6", "ES7", "ES8"],
            correctAnswer: 1,
          },
          {
            id: "q5",
            question: "DOM là viết tắt của?",
            options: [
              "Document Object Model",
              "Data Object Model",
              "Dynamic Object Model",
              "Document Oriented Model",
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: "task_2",
        title: "JavaScript Nâng cao",
        questions: [
          {
            id: "q6",
            question: "Promise có bao nhiêu trạng thái?",
            options: ["2", "3", "4", "5"],
            correctAnswer: 1,
          },
          {
            id: "q7",
            question: "async/await được giới thiệu trong phiên bản nào?",
            options: ["ES6", "ES7", "ES8", "ES9"],
            correctAnswer: 2,
          },
          {
            id: "q8",
            question: "Closure trong JavaScript là gì?",
            options: [
              "Một loại vòng lặp",
              "Hàm có thể truy cập biến ngoài phạm vi",
              "Một kiểu dữ liệu",
              "Một method của Object",
            ],
            correctAnswer: 1,
          },
          {
            id: "q9",
            question: "Event bubbling là gì?",
            options: [
              "Sự kiện lan truyền từ cha đến con",
              "Sự kiện lan truyền từ con đến cha",
              "Sự kiện không lan truyền",
              "Sự kiện bị hủy",
            ],
            correctAnswer: 1,
          },
          {
            id: "q10",
            question: "Map và Set được thêm vào JavaScript ở phiên bản nào?",
            options: ["ES5", "ES6", "ES7", "ES8"],
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

  // Initialize student progress
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
    answers: {},
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

// Submit task answers
router.post("/learning/submit-task", (req, res) => {
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

  // Find the task
  const task = course.tasks.find((t) => t.id === taskId);
  if (!task) {
    return res.status(404).json({ success: false, message: "Task not found" });
  }

  // Calculate score for this task
  let correctAnswers = 0;
  task.questions.forEach((question, index) => {
    if (answers[question.id] === question.correctAnswer) {
      correctAnswers++;
    }
  });

  const taskScore = (correctAnswers / task.questions.length) * 100;

  // Store task result
  studentProgress.taskResults[taskId] = {
    score: taskScore,
    correctAnswers,
    totalQuestions: task.questions.length,
    completedAt: new Date().toISOString(),
  };

  studentProgress.answers[taskId] = answers;

  // Update overall progress
  const completedTasks = Object.keys(studentProgress.taskResults).length;
  studentProgress.tasksCompleted = completedTasks;
  studentProgress.progress =
    (completedTasks / studentProgress.totalTasks) * 100;

  // Calculate overall score
  const taskScores = Object.values(studentProgress.taskResults).map(
    (r) => r.score
  );
  studentProgress.score = Math.round(
    taskScores.reduce((a, b) => a + b, 0) / taskScores.length
  );

  // Update status
  if (studentProgress.progress >= 100) {
    studentProgress.status = "Completed";
    studentProgress.completedAt = new Date().toISOString();

    // Determine grade
    if (studentProgress.score >= 95) studentProgress.grade = "A+";
    else if (studentProgress.score >= 90) studentProgress.grade = "A";
    else if (studentProgress.score >= 85) studentProgress.grade = "B+";
    else if (studentProgress.score >= 80) studentProgress.grade = "B";
    else if (studentProgress.score >= 70) studentProgress.grade = "C";
    else studentProgress.grade = "D";
  }

  res.json({
    success: true,
    taskResult: studentProgress.taskResults[taskId],
    progress: studentProgress.progress,
    score: studentProgress.score,
    status: studentProgress.status,
    grade: studentProgress.grade,
  });
});

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
      completedTasks: progress.completedTasks,
      taskResults: progress.taskResults,
      completedAt: progress.completedAt,
      startedAt: progress.startedAt,
      metadata: progress,
    },
  });
});

/**
 * GET /admin/failed-webhooks
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
 */
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
        completedTasks: progress.completedTasks,
        totalTasks: course?.tasks?.length || 0,
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
