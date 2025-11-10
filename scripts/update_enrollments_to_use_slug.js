/**
 * Update Enrollment.accessLink to use partner slug (course.link) when possible.
 * Run on the VPS: node scripts/update_enrollments_to_use_slug.js
 *
 * Safety: does not delete data; prints summary and examples. Create mongodump first.
 */
const mongoose = require("mongoose");

const MONGO = process.env.MONGO || "mongodb://127.0.0.1:27017/eduwallet";

async function main() {
  await mongoose.connect(MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to", MONGO);

  // Minimal schemas to work with existing collections
  const PartnerSourceSchema = new mongoose.Schema(
    {},
    { strict: false, collection: "partnersources" }
  );
  // deployed DB uses snake_case collection name 'partner_courses'
  const PartnerCourseSchema = new mongoose.Schema(
    {},
    { strict: false, collection: "partner_courses" }
  );
  const EnrollmentSchema = new mongoose.Schema(
    {},
    { strict: false, collection: "enrollments" }
  );

  const PartnerSource = mongoose.model(
    "PartnerSource_mig",
    PartnerSourceSchema
  );
  const PartnerCourse = mongoose.model(
    "PartnerCourse_mig",
    PartnerCourseSchema
  );
  const Enrollment = mongoose.model("Enrollment_mig", EnrollmentSchema);

  // Find partner-synced courses
  const courses = await PartnerCourse.find({
    sourceId: { $exists: true, $ne: null },
  }).lean();
  console.log("Partner-synced courses found:", courses.length);

  let updated = 0;
  const examples = [];

  for (const c of courses) {
    const sourceId = c.sourceId;
    const source = sourceId
      ? await PartnerSource.findById(sourceId).lean()
      : null;
    if (!source || !source.domain) continue;
    const protocol = source.domain.startsWith("localhost") ? "http" : "https";

    // Determine slug path if course.link exists
    let targetBase = null;
    if (c.link) {
      const base = String(c.link).trim();
      if (base.match(/^https?:\/\//)) {
        // absolute
        try {
          const u = new URL(base);
          targetBase = u.origin + u.pathname; // drop search/hash
        } catch (e) {
          targetBase = `${protocol}://${source.domain}/${base.replace(
            /^\//,
            ""
          )}`;
        }
      } else {
        const path = base.startsWith("/") ? base : `/${base}`;
        targetBase = `${protocol}://${source.domain}${path}`;
      }
    } else if (c.partnerCourseId) {
      targetBase = `${protocol}://${source.domain}/course/${encodeURIComponent(
        c.partnerCourseId
      )}`;
    } else if (c._id) {
      targetBase = `${protocol}://${source.domain}/course/${encodeURIComponent(
        c._id.toString()
      )}`;
    }

    if (!targetBase) continue;

    // Find enrollments that reference this course as itemId (object id) or courseId field
    // Enrollment documents in this DB have either itemId referencing PartnerCourse _id or may contain accessLink already
    const enrollFilter = {
      $or: [
        { itemId: c._id },
        { itemId: c._id.toString() },
        { "itemId._id": c._id },
      ],
    };
    const enrolls = await Enrollment.find(enrollFilter).lean();
    if (!enrolls || enrolls.length === 0) continue;

    for (const e of enrolls) {
      const userId = e.user
        ? e.user.toString
          ? e.user.toString()
          : String(e.user)
        : e.userId || null;
      if (!userId) continue;
      const newLink = `${targetBase}?student=${encodeURIComponent(userId)}`;
      // Skip if already equals
      if (e.accessLink && e.accessLink === newLink) continue;

      // Update
      const res = await Enrollment.updateOne(
        { _id: e._id },
        { $set: { accessLink: newLink } }
      );
      if (res.modifiedCount && res.modifiedCount > 0) updated++;
      if (examples.length < 5)
        examples.push({ enrollmentId: e._id, old: e.accessLink, new: newLink });
    }
  }

  console.log("Updated enrollments:", updated);
  console.log("Examples:", examples);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
