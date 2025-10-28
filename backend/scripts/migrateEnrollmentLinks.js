const mongoose = require("mongoose");
const Enrollment = require("../src/models/Enrollment");
const PartnerCourse = require("../src/models/PartnerCourse");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/eduwallet";

async function run() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to", MONGODB_URI);

  const cursor = Enrollment.find({ accessLink: { $in: [null, ""] } }).cursor();
  let updated = 0;
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    try {
      const itemId = doc.itemId;
      if (!itemId) continue;
      const pc = await PartnerCourse.findById(itemId).lean();
      if (!pc || !pc.link) continue;
      const studentId = doc.user ? String(doc.user) : "";
      let accessLink = pc.link;
      try {
        const url = new URL(accessLink);
        url.searchParams.set("student", studentId);
        accessLink = url.toString();
      } catch (err) {
        const parts = String(accessLink).split("?");
        const base = parts[0];
        const qs = parts[1] || "";
        const params = qs
          ? qs.split("&").filter((p) => p && !p.startsWith("student="))
          : [];
        params.push(`student=${encodeURIComponent(studentId)}`);
        accessLink = params.length ? `${base}?${params.join("&")}` : base;
      }
      doc.accessLink = accessLink;
      await doc.save();
      updated++;
      console.log("Updated enrollment", doc._id.toString());
    } catch (err) {
      console.error(
        "Error processing enrollment",
        doc._id.toString(),
        err.message
      );
    }
  }

  console.log("Done. Updated", updated, "enrollments.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
