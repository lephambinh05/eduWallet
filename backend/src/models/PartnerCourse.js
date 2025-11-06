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
    // For backward compatibility
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Unique ID from partner's system (for sync)
    partnerCourseId: {
      type: String,
      sparse: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    link: { type: String, required: true },
    // For backward compatibility
    url: { type: String },
    priceEdu: { type: Number, required: true },
    // For new sync feature
    price: { type: Number },
    currency: { type: String, default: "PZO" },
    duration: { type: Number, default: 0 },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "all"],
      default: "beginner",
    },
    category: { type: String, default: "other" },
    thumbnail: { type: String },
    isPublished: { type: Boolean, default: true },
    published: { type: Boolean, default: true },
    // Reference to PartnerSource if synced from external API
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PartnerSource",
    },
  },
  { timestamps: true, collection: "partner_courses" }
);

partnerCourseSchema.index({ owner: 1 });
partnerCourseSchema.index({ partner: 1 });
partnerCourseSchema.index(
  { partnerCourseId: 1, partner: 1 },
  { unique: true, sparse: true }
);
partnerCourseSchema.index({ title: "text", description: "text" });

// Virtual to get primary URL
partnerCourseSchema.virtual("primaryUrl").get(function () {
  return this.url || this.link;
});

// Virtual to get primary partner ID
partnerCourseSchema.virtual("partnerId").get(function () {
  return this.partner || this.owner;
});

module.exports = mongoose.model("PartnerCourse", partnerCourseSchema);
