#!/usr/bin/env node
/*
  Script: create_partner_course_and_enrollment.js
  Purpose: Upsert a PartnerCourse and create a Purchase+Enrollment for a given student.

  Usage (on VPS, from project root):
    MONGO_URI="mongodb://127.0.0.1:27017/eduwallet" node scripts/create_partner_course_and_enrollment.js \
      --partnerId=690f05b1e086901f037d6748 \
      --courseId=690f5823cb9c2ccc45077ad4 \
      --studentId=690f5d933a6f87781e6ba3e3

  Notes:
  - The script will not delete anything, but it will create/update documents.
  - Make a mongodump backup before running if you are unsure.
*/

const mongoose = require("mongoose");
const argv = require("minimist")(process.argv.slice(2));
const path = require("path");

async function main() {
  const MONGO_URI =
    process.env.MONGO_URI ||
    argv.mongoUri ||
    "mongodb://127.0.0.1:27017/eduwallet";
  const partnerId = argv.partnerId;
  const courseId = argv.courseId;
  const studentId = argv.studentId;

  if (!partnerId || !courseId || !studentId) {
    console.error(
      "Missing required args. Usage: --partnerId=... --courseId=... --studentId=..."
    );
    process.exit(2);
  }

  // Load models from project src (assumes script is run from project root)
  const modelsBase = path.join(__dirname, "..", "src", "models");
  const PartnerCourse = require(path.join(modelsBase, "PartnerCourse"));
  const Purchase = require(path.join(modelsBase, "Purchase"));
  const Enrollment = require(path.join(modelsBase, "Enrollment"));
  const PartnerSource = require(path.join(modelsBase, "PartnerSource"));

  mongoose.set("strictQuery", false);
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to MongoDB:", MONGO_URI);

  const { Types } = mongoose;

  const partnerObjectId = new Types.ObjectId(partnerId);
  const courseObjectId = new Types.ObjectId(courseId);
  const studentObjectId = new Types.ObjectId(studentId);

  // Try to find a PartnerSource for this partner (optional)
  let source = await PartnerSource.findOne({ partner: partnerObjectId }).lean();
  if (source) {
    console.log(
      "Found PartnerSource for partner:",
      source._id.toString(),
      source.domain
    );
  } else {
    console.log(
      "No PartnerSource found for partner; continuing without source."
    );
  }

  // Upsert PartnerCourse
  const partnerCourseIdField = `pc_${Date.now()}`;
  const partnerCourseDoc = {
    _id: courseObjectId,
    owner: partnerObjectId,
    partner: partnerObjectId,
    partnerCourseId: partnerCourseIdField,
    title: "Test course from partner",
    description: "Auto-created test course",
    priceEdu: 0,
    url:
      source && source.domain
        ? `https://${source.domain}/course/${partnerCourseIdField}`
        : `https://partner1.mojistudio.vn/course/${partnerCourseIdField}`,
    sourceId: source ? source._id : undefined,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await PartnerCourse.findOneAndUpdate(
    { _id: courseObjectId },
    { $set: partnerCourseDoc },
    { upsert: true, new: true }
  );
  console.log("Upserted PartnerCourse with _id:", courseId);

  // Create Purchase
  const purchase = await Purchase.create({
    itemId: courseObjectId,
    buyer: studentObjectId,
    seller: partnerObjectId,
    price: 0,
    quantity: 1,
    total: 0,
    metadata: { test: true },
  });
  console.log("Created Purchase:", purchase._id.toString());

  // Construct accessLink
  let accessLink = `${
    source && source.domain
      ? `https://${source.domain}`
      : `https://partner1.mojistudio.vn`
  }/course/${partnerCourseIdField}?student=${studentId}`;

  const enrollment = await Enrollment.create({
    user: studentObjectId,
    itemId: courseObjectId,
    purchase: purchase._id,
    seller: partnerObjectId,
    courseTitle: partnerCourseDoc.title,
    accessLink,
    progressPercent: 0,
    totalPoints: 0,
    timeSpentSeconds: 0,
    status: "in_progress",
    metadata: { createdByScript: true },
  });

  // Append enrollment id as reg param to the accessLink and persist it
  try {
    let finalAccessLink = accessLink || "";
    try {
      const urlObj = new URL(finalAccessLink);
      urlObj.searchParams.set("reg", enrollment._id.toString());
      finalAccessLink = urlObj.toString();
    } catch (e) {
      if (finalAccessLink.includes("?")) {
        finalAccessLink = `${finalAccessLink}&reg=${encodeURIComponent(
          enrollment._id.toString()
        )}`;
      } else {
        finalAccessLink = `${finalAccessLink}?reg=${encodeURIComponent(
          enrollment._id.toString()
        )}`;
      }
    }

    enrollment.accessLink = finalAccessLink;
    await enrollment.save();

    accessLink = finalAccessLink;
  } catch (err) {
    console.error("Failed to append reg to accessLink:", err);
  }

  console.log("Created Enrollment:", enrollment._id.toString());
  console.log("Enrollment accessLink:", accessLink);

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
