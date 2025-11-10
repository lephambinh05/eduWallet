const mongoose = require("/www/wwwroot/partner1.mojistudio.vn/node_modules/mongoose");
// const axios = require('/www/wwwroot/partner1.mojistudio.vn/node_modules/axios');

async function sendCompletionWebhook(enrollmentId) {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/partner_eduWallet"
    );

    const Enrollment = mongoose.model(
      "Enrollment",
      new mongoose.Schema({}, { strict: false })
    );
    const enrollment = await Enrollment.findOne({ enrollmentId: enrollmentId });

    if (!enrollment) {
      console.error("Enrollment not found:", enrollmentId);
      process.exit(1);
    }

    console.log("Found enrollment:", {
      enrollmentId: enrollment.enrollmentId,
      courseId: enrollment.courseId,
      userId: enrollment.userId,
      status: enrollment.status,
    });

    // Create webhook payload - need to send EduWallet course ID
    // For this enrollment, EduWallet course ID is 6910f0ddabdd391840128690
    const webhookPayload = {
      eventType: "course_completed",
      studentId: enrollment.userId,
      courseId: "6910f0ddabdd391840128690", // EduWallet course ID from enrollment.itemId
      enrollmentId: enrollment.enrollmentId,
      completedCourse: {
        _id: `completion_${Date.now()}`,
        name: "Completed Course",
        issuer: "Partner1",
        score: 100,
        passed: true,
        correctAnswers: 10,
        totalQuestions: 10,
        grade: "A+",
        results: [],
        createdAt: new Date().toISOString(),
        __v: 0,
      },
    };

    console.log(
      "Sending webhook payload:",
      JSON.stringify(webhookPayload, null, 2)
    );

    const eduwalletUrl =
      process.env.EDUWALLET_API_URL || "https://api-eduwallet.mojistudio.vn";
    console.log("Using EduWallet URL:", eduwalletUrl);

    const response = await fetch(
      `${eduwalletUrl}/api/webhooks/partner-updates`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      }
    );

    const responseText = await response.text();
    console.log("Raw response:", responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.log("Response is not JSON, got HTML instead");
      responseData = responseText;
    }

    console.log("Webhook response:", response.status, responseData);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// Get enrollment ID from command line argument
const enrollmentId = process.argv[2];
if (!enrollmentId) {
  console.error("Usage: node send_webhook.js <enrollmentId>");
  process.exit(1);
}

sendCompletionWebhook(enrollmentId);
