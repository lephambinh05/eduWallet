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
    const enrollment = await Enrollment.findById("69118ef1da25553501101749");

    console.log("EduWallet enrollment status:", enrollment?.status);
    console.log("Completed at:", enrollment?.completedAt);
    console.log("Progress percent:", enrollment?.progressPercent);
    console.log("User ID:", enrollment?.user);
    console.log("Item ID:", enrollment?.itemId);
    console.log("Access link:", enrollment?.accessLink);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkEnrollment();
