const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketplaceItem",
      required: true,
      index: true,
    },
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseTitle: { type: String, required: true },
    accessLink: { type: String, default: null },
    // Progress tracking
    progressPercent: { type: Number, default: 0 }, // 0-100
    totalPoints: { type: Number, default: 0 },
    timeSpentSeconds: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["in_progress", "completed", "expired"],
      default: "in_progress",
    },
    completedAt: { type: Date, default: null },
    lastAccessed: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

enrollmentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
