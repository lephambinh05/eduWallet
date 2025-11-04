require("dotenv").config();
const mongoose = require("mongoose");

// load model directly
const PartnerCourse = require("../src/models/PartnerCourse");

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/eduwallet";

// Accept id from argv or environment, default to known sample id
const courseId =
  process.argv[2] ||
  process.env.PARTNER_COURSE_ID ||
  "69005d64ebbe7937c4814aba";

(async () => {
  try {
    console.log("Connecting to", uri);
    await mongoose.connect(uri);
    console.log("Connected. Publishing course", courseId);

    const updated = await PartnerCourse.findByIdAndUpdate(
      courseId,
      { isPublished: true },
      { new: true }
    ).lean();

    if (!updated) {
      console.error("No course found with id", courseId);
      await mongoose.disconnect();
      process.exit(2);
    }

    console.log("Updated:", JSON.stringify(updated, null, 2));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err && err.message ? err.message : err);
    process.exit(1);
  }
})();
