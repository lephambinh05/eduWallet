const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const axios = require("axios");

// Mock database - in production, use real database
const students = {};
const courses = {
  course_001: {
    id: "course_001",
    name: "Học lập trình Web cơ bản",
    description: "Khóa học lập trình web từ cơ bản đến nâng cao",
    issuer: "Đại học Công nghệ",
    category: "Programming",
    level: "Beginner",
    credits: 3,
    videoId: "dQw4w9WgXcQ", // YouTube video ID
    videoDuration: 600, // 10 minutes in seconds
    skills: ["HTML", "CSS", "JavaScript", "React"],
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

// Get all courses
router.get("/courses", (req, res) => {
  res.json({ success: true, courses: Object.values(courses) });
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
    lastWatchedSecond: 0,
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
    // Don't fail the request, just log warning
  }

  res.json({
    success: true,
    message: "Learning session started",
    data: students[studentId][courseId],
  });
});

// Update progress (called periodically as student watches video)
router.post("/learning/progress", (req, res) => {
  const { studentId, courseId, watchedSeconds } = req.body;

  if (!studentId || !courseId || watchedSeconds === undefined) {
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

  try {
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
      const timeSpent = progress.lastWatchedSecond || 0;

      return {
        courseId,
        courseName: course?.name,
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
    totalTimeSpent: coursesData.reduce((sum, c) => sum + c.timeSpent, 0),
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
