const mongoose = require("mongoose");

// Schema for partner-submitted courses stored separately in the
// `partner_courses` collection so partner data doesn't mix with other Course data.
const partnerCourseSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    link: { type: String, required: true },
    priceEdu: { type: Number, required: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "partner_courses" }
);

partnerCourseSchema.index({ owner: 1 });
partnerCourseSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("PartnerCourse", partnerCourseSchema);
