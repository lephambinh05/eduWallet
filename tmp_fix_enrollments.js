const mongoose = require("mongoose");

(async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/eduwallet");
  // this script is intended to be placed in the project's `scripts/` folder.
  // Require model files relative to the script location (../src/models/...)
  const PartnerCourse = require('../src/models/PartnerCourse');
  const PartnerSource = require('../src/models/PartnerSource');
  const Enrollment = require('../src/models/Enrollment');
  const ObjectId = mongoose.Types.ObjectId;

  // Use `new ObjectId(...)` to avoid the "Class constructor ObjectId cannot be invoked without 'new'" error
  const courseId = new ObjectId('690f06faabdd39184012866f');
    const course = await PartnerCourse.findById(courseId).lean();
    if (!course) {
      console.error("Course not found:", courseId.toString());
      process.exit(1);
    }

    let source = null;
    if (course.sourceId) {
      source = await PartnerSource.findById(course.sourceId).lean();
    }

    const partnerDomain =
      source && source.domain
        ? (source.domain.startsWith("localhost") ? "http" : "https") +
          "://" +
          source.domain
        : null;
    const partnerCourseId = course.partnerCourseId || course._id.toString();

    const enrollments = await Enrollment.find({ itemId: courseId }).lean();
    console.log("Found enrollments:", enrollments.length);

    for (const e of enrollments) {
      const studentId = e.user
        ? e.user.toString
          ? e.user.toString()
          : String(e.user)
        : null;
      const newLink = partnerDomain
        ? `${partnerDomain}/course/${encodeURIComponent(
            partnerCourseId
          )}?student=${encodeURIComponent(studentId)}`
        : null;
      if (newLink) {
        const r = await Enrollment.updateOne(
          { _id: e._id },
          { $set: { accessLink: newLink } }
        );
        console.log(
          "Updated enrollment",
          e._id.toString(),
          "->",
          newLink,
          "matched:",
          r.matchedCount || r.n,
          "modified:",
          r.modifiedCount || r.nModified
        );
      } else {
        console.log(
          "No partner domain for course; skipping enrollment",
          e._id.toString()
        );
      }
    }

    await mongoose.disconnect();
    console.log("Done.");
  } catch (err) {
    console.error("Script error:", err);
    process.exit(1);
  }
})();
