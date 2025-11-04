const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    domain: String,
    demoUrl: String, // URL của partner demo website để fetch courses

    // 🆕 Contact Information
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Invalid email format",
      },
    },
    contactPhone: String,
    description: String,
    logoUrl: String,

    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    apiEndpoints: {
      courseAccess: { type: String },
      learningProgress: { type: String },
      courseCatalog: { type: String },
      certificateVerification: { type: String },
    },

    // 🆕 Configuration URLs
    config: {
      backendUrl: { type: String, default: "http://localhost:3001" },
      port: Number,
      webhookEndpoint: {
        type: String,
        default: "/api/partner/webhooks/partner-updates",
      },
      mongodbUri: String, // MongoDB connection string for partner access
    },

    webhookUrl: String,
    apiKey: String,
    apiKeyCreatedAt: Date,
    apiKeyLastRotatedAt: Date,
    apiKeyLastUsedAt: Date,
    apiSecretKey: String,

    // 🆕 API Key History for security tracking
    apiKeyHistory: [
      {
        key: String,
        createdAt: Date,
        revokedAt: Date,
        revokedReason: String,
      },
    ],

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
