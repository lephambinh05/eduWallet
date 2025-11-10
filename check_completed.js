const mongoose = require("/www/wwwroot/partner1.mojistudio.vn/node_modules/mongoose");

async function checkEnrollments() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/partner_eduWallet"
    );

    const Enrollment = mongoose.model(
      "Enrollment",
      new mongoose.Schema({}, { strict: false })
    );
    const all = await Enrollment.find({}).limit(10);

    console.log(`Total enrollments: ${all.length}`);
    all.forEach((e) => {
      console.log(`ID: ${e.enrollmentId}`);
      console.log(`Course: ${e.courseId}`);
      console.log(`User: ${e.userId}`);
      console.log(`Status: ${e.status}`);
      console.log("---");
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkEnrollments();
