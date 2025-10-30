const mongoose = require("mongoose");

const completedCourseSchema = new mongoose.Schema(
  {
    // Link to enrollment
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },

    // User information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Course basic info
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },

    // Issuer/Partner information
    issuer: {
      type: String,
      required: true,
      trim: true,
    },
    issuerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
    },

    // Dates
    issueDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null,
    },

    // Course metadata
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
      default: "Beginner",
    },

    // Academic information
    credits: {
      type: Number,
      default: 0,
      min: 0,
    },
    grade: {
      type: String,
      default: "",
      trim: true,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Progress tracking
    status: {
      type: String,
      enum: ["Completed", "In Progress", "Expired"],
      default: "Completed",
    },
    progress: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    modulesCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalModules: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Skills acquired
    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    // URLs and verification
    verificationUrl: {
      type: String,
      default: null,
    },
    certificateUrl: {
      type: String,
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },

    // Additional metadata from partner
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
completedCourseSchema.index({ userId: 1, status: 1 });
completedCourseSchema.index({ enrollmentId: 1 });
completedCourseSchema.index({ issuerId: 1 });
completedCourseSchema.index({ createdAt: -1 });

// Virtual fields
completedCourseSchema.virtual("issueDateFormatted").get(function () {
  if (!this.issueDate) return null;
  const date = new Date(this.issueDate);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
});

completedCourseSchema.virtual("expiryDateFormatted").get(function () {
  if (!this.expiryDate) return null;
  const date = new Date(this.expiryDate);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
});

completedCourseSchema.virtual("scoreDisplay").get(function () {
  return `${this.score}%`;
});

// Method to calculate grade from score
completedCourseSchema.methods.calculateGrade = function () {
  if (this.score >= 95) return "A+";
  if (this.score >= 90) return "A";
  if (this.score >= 85) return "B+";
  if (this.score >= 80) return "B";
  if (this.score >= 75) return "C+";
  if (this.score >= 70) return "C";
  if (this.score >= 65) return "D+";
  if (this.score >= 60) return "D";
  return "F";
};

// Static method to create from enrollment
completedCourseSchema.statics.createFromEnrollment = async function (
  enrollment,
  additionalData = {}
) {
  const completedCourse = {
    enrollmentId: enrollment._id,
    userId: enrollment.user._id || enrollment.user,
    name:
      additionalData.name ||
      enrollment.courseTitle ||
      enrollment.itemId?.title ||
      "Unknown Course",
    description:
      additionalData.description || enrollment.itemId?.description || "",
    issuer: additionalData.issuer || enrollment.seller?.username || "Partner",
    issuerId: enrollment.seller?._id || enrollment.seller,
    issueDate: enrollment.completedAt || new Date(),
    expiryDate: additionalData.expiryDate || null,
    category: additionalData.category || "General",
    level: additionalData.level || "Beginner",
    credits: additionalData.credits || 0,
    grade: additionalData.grade || "",
    score: additionalData.score || enrollment.totalPoints || 0,
    status: "Completed",
    progress: enrollment.progressPercent || 100,
    modulesCompleted: additionalData.modulesCompleted || 0,
    totalModules: additionalData.totalModules || 0,
    skills: additionalData.skills || [],
    verificationUrl: additionalData.verificationUrl || null,
    certificateUrl: additionalData.certificateUrl || null,
    imageUrl: additionalData.imageUrl || null,
    metadata: enrollment.metadata || {},
  };

  // Auto-calculate grade if not provided
  if (!completedCourse.grade && completedCourse.score) {
    const temp = new this(completedCourse);
    completedCourse.grade = temp.calculateGrade();
  }

  return await this.create(completedCourse);
};

module.exports = mongoose.model("CompletedCourse", completedCourseSchema);
