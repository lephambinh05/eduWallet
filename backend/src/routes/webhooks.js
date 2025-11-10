const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { asyncHandler } = require("../middleware/errorHandler");
const Enrollment = require("../models/Enrollment");
const CompletedCourse = require("../models/CompletedCourse");
const User = require("../models/User");
const emailService = require("../services/emailService");

// Partner webhook endpoint

const logger = require("../utils/logger");

router.head(
  "/partner-updates",
  asyncHandler(async (req, res) => {
    res.status(200).json({ message: "Webhook endpoint is available" });
  })
);

router.post(
  "/partner-updates",
  asyncHandler(async (req, res) => {
    try {
      logger.info("[Webhook] Received /api/webhooks/partner-updates");
      logger.info(`[Webhook] Headers: ${JSON.stringify(req.headers)}`);
      logger.info(`[Webhook] Body: ${JSON.stringify(req.body)}`);

      const data = req.body;

      logger.info(`[Webhook] Payload eventType: ${data.eventType}`);
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
          logger.warn(`[Webhook] Unknown webhook event: ${data.eventType}`);
      }

      res.json({ success: true });
    } catch (err) {
      logger.error(
        `[Webhook] Error in /api/webhooks/partner-updates: ${err.message}`
      );
      return res.status(500).json({ error: err.message });
    }
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
    // Tìm user từ studentId
    let user = await User.findById(data.studentId);

    // Tìm enrollment từ studentId và courseId (ưu tiên phương pháp này)
    let enrollment = null;
    if (data.courseId && user) {
      enrollment = await Enrollment.findOne({
        user: data.studentId,
        itemId: data.courseId,
      }).populate("user");
      console.log(
        `[Webhook] Searched enrollment by user: ${data.studentId}, itemId: ${
          data.courseId
        }, found: ${!!enrollment}`
      );
    }

    // Nếu không tìm thấy bằng courseId, thử tìm bằng enrollmentId (nếu có)
    if (!enrollment && data.enrollmentId) {
      // Kiểm tra xem enrollmentId có phải là ObjectId hợp lệ không
      if (mongoose.Types.ObjectId.isValid(data.enrollmentId)) {
        enrollment = await Enrollment.findById(data.enrollmentId).populate(
          "user"
        );
        if (enrollment) {
          user = enrollment.user;
        }
        console.log(
          `[Webhook] Searched enrollment by _id: ${
            data.enrollmentId
          }, found: ${!!enrollment}`
        );
      } else {
        console.log(
          `[Webhook] enrollmentId ${data.enrollmentId} is not a valid ObjectId`
        );
      }
    }

    if (!user) {
      console.log(`User not found for studentId: ${data.studentId}`);
      return;
    }

    // Cập nhật enrollment nếu có
    if (enrollment) {
      console.log(
        `[Webhook] Updating enrollment ${enrollment._id} status to completed`
      );
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
      console.log(
        `[Webhook] Enrollment ${enrollment._id} updated successfully`
      );
    } else {
      console.log(
        `[Webhook] No enrollment found to update for studentId: ${data.studentId}, courseId: ${data.courseId}, enrollmentId: ${data.enrollmentId}`
      );
    }

    // Tạo CompletedCourse record
    if (data.completedCourse) {
      const completedCourseData = {
        ...data.completedCourse,
        userId: user._id,
        enrollmentId: enrollment?._id || null,
      };

      // Remove _id if present to avoid ObjectId validation errors
      delete completedCourseData._id;

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
        console.log(
          `CompletedCourse updated for user ${user._id}: ${data.completedCourse.name}`
        );
      } else {
        // Tạo mới
        const completedCourse = new CompletedCourse(completedCourseData);
        await completedCourse.save();
        console.log(
          `CompletedCourse created for user ${user._id}: ${data.completedCourse.name}`
        );
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
