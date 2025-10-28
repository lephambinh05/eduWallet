require("dotenv").config();
const mongoose = require("mongoose");

// Require the PartnerCourse model using a relative path
const PartnerCourse = require("../src/models/PartnerCourse");

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/eduwallet";

(async () => {
  try {
    console.log("Connecting to", uri);
    await mongoose.connect(uri);
    console.log("Connected. Querying partner_courses...");

    const total = await PartnerCourse.countDocuments();
    const docs = await PartnerCourse.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    console.log(JSON.stringify({ total, sample: docs }, null, 2));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message || err);
    process.exit(1);
  }
})();
