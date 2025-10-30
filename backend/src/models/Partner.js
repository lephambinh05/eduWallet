const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    domain: String,
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    apiEndpoints: {
      courseAccess: { type: String },
      learningProgress: { type: String },
      courseCatalog: { type: String },
      certificateVerification: { type: String },
    },
    webhookUrl: String,
    apiKey: String,
    apiKeyCreatedAt: Date,
    apiKeyLastRotatedAt: Date,
    apiKeyLastUsedAt: Date,
    apiSecretKey: String,
    supportedFeatures: [String],
    rateLimiting: {
      requestsPerMinute: { type: Number, default: 60 },
      burstLimit: { type: Number, default: 100 },
    },
    lastSyncAt: Date,
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  { timestamps: true }
);

partnerSchema.index({ status: 1 });

module.exports = mongoose.model("Partner", partnerSchema);
