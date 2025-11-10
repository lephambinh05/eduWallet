const mongoose = require("mongoose");

async function checkEnrollment() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/eduwallet"
    );

    const Enrollment = mongoose.model(
      "Enrollment",
      new mongoose.Schema({}, { strict: false })
    );
    const enrollment = await Enrollment.findById("6910ef500ab3432f2b0b9d60");

    console.log("EduWallet enrollment status:", enrollment?.status);
    console.log("Completed at:", enrollment?.completedAt);
    console.log("Progress percent:", enrollment?.progressPercent);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkEnrollment();
