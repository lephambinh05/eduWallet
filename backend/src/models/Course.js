const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Course Details
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
  credits: {
    type: Number,
    default: 0,
    min: 0
  },
  grade: {
    type: String,
    default: null
  },
  score: {
    type: Number,
    default: null,
    min: 0,
    max: 100
  },
  
  // Progress and Status
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'Expired'],
    default: 'Not Started'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  modulesCompleted: {
    type: Number,
    default: 0
  },
  totalModules: {
    type: Number,
    default: 0
  },
  
  // Skills and Tags
  skills: [{
    type: String,
    trim: true
  }],
  
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
courseSchema.index({ userId: 1, name: 1 }, { unique: true });
courseSchema.index({ userId: 1, category: 1 });
courseSchema.index({ userId: 1, status: 1 });
courseSchema.index({ userId: 1, issueDate: -1 });

// Virtual for formatted issue date
courseSchema.virtual('issueDateFormatted').get(function() {
  return this.issueDate.toLocaleDateString('vi-VN');
});

// Virtual for formatted expiry date
courseSchema.virtual('expiryDateFormatted').get(function() {
  return this.expiryDate ? this.expiryDate.toLocaleDateString('vi-VN') : null;
});

// Virtual for score display
courseSchema.virtual('scoreDisplay').get(function() {
  return this.score ? `${this.score}%` : 'N/A';
});

// Pre-save middleware
courseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
courseSchema.statics.findByUser = function(userId) {
  return this.find({ userId, status: { $ne: 'Expired' } }).sort({ issueDate: -1 });
};

courseSchema.statics.findByCategory = function(userId, category) {
  return this.find({ userId, category, status: { $ne: 'Expired' } }).sort({ issueDate: -1 });
};

courseSchema.statics.findByStatus = function(userId, status) {
  return this.find({ userId, status }).sort({ issueDate: -1 });
};

courseSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), status: { $ne: 'Expired' } } },
    {
      $group: {
        _id: null,
        totalCourses: { $sum: 1 },
        completedCourses: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
        inProgressCourses: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
        totalCredits: { $sum: '$credits' },
        averageScore: { $avg: '$score' },
        categories: { $addToSet: '$category' },
        skills: { $addToSet: '$skills' }
      }
    }
  ]);
  
  const result = stats[0] || {
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalCredits: 0,
    averageScore: 0,
    categories: [],
    skills: []
  };
  
  // Flatten skills array
  result.topSkills = [...new Set(result.skills.flat())];
  delete result.skills;
  
  // Calculate completion rate
  result.completionRate = result.totalCourses > 0 ? 
    Math.round((result.completedCourses / result.totalCourses) * 100) : 0;
  
  return result;
};

// Instance methods
courseSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    issuer: this.issuer,
    issueDate: this.issueDate,
    issueDateFormatted: this.issueDateFormatted,
    expiryDate: this.expiryDate,
    expiryDateFormatted: this.expiryDateFormatted,
    category: this.category,
    level: this.level,
    credits: this.credits,
    grade: this.grade,
    score: this.score,
    scoreDisplay: this.scoreDisplay,
    status: this.status,
    progress: this.progress,
    modulesCompleted: this.modulesCompleted,
    totalModules: this.totalModules,
    skills: this.skills,
    verificationUrl: this.verificationUrl,
    certificateUrl: this.certificateUrl,
    imageUrl: this.imageUrl,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('Course', courseSchema);
