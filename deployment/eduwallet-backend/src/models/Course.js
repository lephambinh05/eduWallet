const mongoose = require("mongoose");

// Single clean Course schema used for partner-created courses
const courseSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    link: { type: String, required: true },
    // Price expressed in EDU tokens (integer or decimal)
    priceEdu: { type: Number, required: true },
    // No 'collect' field: partner-submitted courses are stored in the 'courses' collection
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

courseSchema.index({ owner: 1 });
courseSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Course", courseSchema);
