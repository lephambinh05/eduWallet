const mongoose = require("mongoose");

const partnerSourceSchema = new mongoose.Schema(
  {
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
    },
    // Deprecated - kept for backward compatibility
    apiUrl: {
      type: String,
      trim: true,
    },
    apiKey: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSyncAt: {
      type: Date,
    },
    lastSyncStatus: {
      type: String,
      enum: ["success", "failed", "pending"],
    },
    lastSyncError: {
      type: String,
    },
    syncedCoursesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
partnerSourceSchema.index({ partner: 1, isActive: 1 });

// Helper method to get API endpoints from domain
partnerSourceSchema.methods.getApiEndpoints = function () {
  const protocol = this.domain.startsWith("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${this.domain}`;

  return {
    courses: `${baseUrl}/api/courses`,
    courseDetail: (id) => `${baseUrl}/api/courses/${id}`,
    enrollments: `${baseUrl}/api/enrollments`,
  };
};

// Virtual to get courses API URL
partnerSourceSchema.virtual("coursesApiUrl").get(function () {
  const protocol = this.domain.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${this.domain}/api/courses`;
});

module.exports = mongoose.model("PartnerSource", partnerSourceSchema);
