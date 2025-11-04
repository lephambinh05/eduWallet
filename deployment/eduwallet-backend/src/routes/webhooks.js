const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { asyncHandler } = require("../middleware/errorHandler");
const Partner = require("../models/Partner");
const Enrollment = require("../models/Enrollment");
const CompletedCourse = require("../models/CompletedCourse");
const User = require("../models/User");
const emailService = require("../services/emailService");

// Partner webhook endpoint
router.post(
  "/partner-updates",
  express.raw({ type: "application/json" }),
  asyncHandler(async (req, res) => {
    const signature = req.headers["x-partner-signature"];
    const timestamp = req.headers["x-partner-timestamp"];
    const partnerId = req.headers["x-partner-id"];

    if (!partnerId)
      return res.status(400).json({ error: "Missing partner id" });

    const partner = await Partner.findById(partnerId);
    if (!partner) return res.status(401).json({ error: "Invalid partner" });

    const expectedSignature = crypto
      .createHmac("sha256", partner.apiSecretKey || "")
      .update((timestamp || "") + req.body)
      .digest("hex");

    if (signature !== `sha256=${expectedSignature}`) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp || "0", 10)) > 300) {
      return res.status(401).json({ error: "Request too old" });
    }

    let data;
    try {
      data = JSON.parse(req.body);
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON payload" });
    }

    switch (data.eventType) {
      case "progress_updated":
        await handleProgressUpdate(data);
        break;
      case "course_completed":
        await handleCourseCompletion(data);
        break;
      case "certificate_issued":
        await handleCertificateIssued(data);
        break;
      default:
        console.log("Unknown webhook event:", data.eventType);
    }

    res.json({ success: true });
  })
);

async function handleProgressUpdate(data) {
  const enrollment = await Enrollment.findOne({
    user: data.studentId,
    itemId: data.courseId,
  });
  if (!enrollment) return;

  enrollment.progressPercent =
    data.data?.progress?.completionPercentage || enrollment.progressPercent;
  enrollment.timeSpentSeconds =
    data.data?.progress?.totalTimeSpent || enrollment.timeSpentSeconds;
  enrollment.lastAccessed = data.data?.progress?.lastAccessed
    ? new Date(data.data.progress.lastAccessed)
    : new Date();
  enrollment.markModified("metadata");
  await enrollment.save();
}

async function handleCourseCompletion(data) {
  try {
    // Tìm hoặc tạo user từ studentId
    let user = await User.findById(data.studentId);
    
    // Nếu có enrollmentId, tìm enrollment và lấy user từ đó
    let enrollment = null;
    if (data.enrollmentId) {
      enrollment = await Enrollment.findById(data.enrollmentId).populate("user");
      if (enrollment) {
        user = enrollment.user;
      }
    } else if (data.courseId && user) {
      // Thử tìm enrollment từ studentId và courseId
      enrollment = await Enrollment.findOne({
        user: data.studentId,
        itemId: data.courseId,
      }).populate("user");
    }
    
    if (!user) {
      console.log(`User not found for studentId: ${data.studentId}`);
      return;
    }
    
    // Cập nhật enrollment nếu có
    if (enrollment) {
      enrollment.status = "completed";
      enrollment.progressPercent = 100;
      enrollment.completedAt = new Date();
      enrollment.lastAccessed = new Date();
      
      // Cập nhật score nếu có trong completedCourse
      if (data.completedCourse?.score !== undefined) {
        enrollment.totalPoints = data.completedCourse.score;
      }
      
      enrollment.markModified("metadata");
      await enrollment.save();
    }
    
    // Tạo CompletedCourse record
    if (data.completedCourse) {
      const completedCourseData = {
        ...data.completedCourse,
        userId: user._id,
        enrollmentId: enrollment?._id || null,
      };
      
      // Kiểm tra xem đã có CompletedCourse này chưa
      const existingCourse = await CompletedCourse.findOne({
        userId: user._id,
        name: data.completedCourse.name,
        issuer: data.completedCourse.issuer,
      });
      
      if (existingCourse) {
        // Cập nhật thông tin
        Object.assign(existingCourse, completedCourseData);
        await existingCourse.save();
        console.log(`CompletedCourse updated for user ${user._id}: ${data.completedCourse.name}`);
      } else {
        // Tạo mới
        const completedCourse = new CompletedCourse(completedCourseData);
        await completedCourse.save();
        console.log(`CompletedCourse created for user ${user._id}: ${data.completedCourse.name}`);
      }
    }
    
    // Gửi email thông báo (optional)
    // await emailService.sendCourseCompletionNotification(user.email, data.completedCourse);
    
  } catch (error) {
    console.error("Error handling course completion:", error);
  }
}

async function handleCertificateIssued(data) {
  const enrollment = await Enrollment.findOne({
    user: data.studentId,
    itemId: data.courseId,
  }).populate("user");
  if (!enrollment) return;

  if (data.data?.certificate) {
    enrollment.metadata = enrollment.metadata || {};
    enrollment.metadata.certificate = data.data.certificate;
    enrollment.status = "completed";
    enrollment.markModified("metadata");
    await enrollment.save();

    try {
      await emailService.sendCertificateNotification(
        enrollment.user.email,
        data.data.certificate,
        enrollment
      );
    } catch (e) {
      console.error("Failed to send certificate email:", e.message);
    }
  }
}

module.exports = router;
