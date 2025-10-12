const mongoose = require('mongoose');

const simpleCertificateSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Certificate Details
  issuer: {
    type: String,
    required: true,
    trim: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    default: null
  },
  
  // Category and Classification
  category: {
    type: String,
    required: true,
    enum: ['Programming', 'Design', 'Business', 'Language', 'Science', 'Arts', 'Academic', 'Professional', 'Cloud Computing', 'Machine Learning', 'Web Development', 'Blockchain', 'Other']
  },
  level: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Professional', 'Expert']
  },
  
  // User Association
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Achievement Details
  score: {
    type: Number,
    default: null,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    default: null
  },
  
  // Verification
  verificationUrl: {
    type: String,
    default: null
  },
  certificateUrl: {
    type: String,
    default: null
  },
  
  // Media
  imageUrl: {
    type: String,
    default: null
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
simpleCertificateSchema.index({ userId: 1, title: 1 }, { unique: true });
simpleCertificateSchema.index({ userId: 1, category: 1 });
simpleCertificateSchema.index({ userId: 1, issueDate: -1 });

// Virtual for formatted issue date
simpleCertificateSchema.virtual('issueDateFormatted').get(function() {
  return this.issueDate.toLocaleDateString('vi-VN');
});

// Virtual for score display
simpleCertificateSchema.virtual('scoreDisplay').get(function() {
  return this.score ? `${this.score}%` : 'N/A';
});

// Pre-save middleware
simpleCertificateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
simpleCertificateSchema.statics.findByUser = function(userId) {
  return this.find({ userId, isActive: true }).sort({ issueDate: -1 });
};

simpleCertificateSchema.statics.findByCategory = function(userId, category) {
  return this.find({ userId, category, isActive: true }).sort({ issueDate: -1 });
};

simpleCertificateSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), isActive: true } },
    {
      $group: {
        _id: null,
        totalCertificates: { $sum: 1 },
        averageScore: { $avg: '$score' },
        categories: { $addToSet: '$category' }
      }
    }
  ]);
  
  return stats[0] || {
    totalCertificates: 0,
    averageScore: 0,
    categories: []
  };
};

// Instance methods
simpleCertificateSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    issuer: this.issuer,
    issueDate: this.issueDate,
    issueDateFormatted: this.issueDateFormatted,
    category: this.category,
    level: this.level,
    score: this.score,
    scoreDisplay: this.scoreDisplay,
    grade: this.grade,
    verificationUrl: this.verificationUrl,
    certificateUrl: this.certificateUrl,
    imageUrl: this.imageUrl,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('SimpleCertificate', simpleCertificateSchema);
