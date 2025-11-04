const mongoose = require('mongoose');

const learningRecordSchema = new mongoose.Schema({
  // Blockchain data
  blockchainId: {
    type: String,
    unique: true,
    sparse: true // Allow null values but ensure uniqueness when present
  },
  transactionHash: {
    type: String,
    unique: true,
    sparse: true
  },
  blockNumber: {
    type: Number,
    sparse: true
  },
  
  // Student information
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    maxlength: [100, 'Student name cannot exceed 100 characters']
  },
  studentAddress: {
    type: String,
    required: [true, 'Student address is required'],
    lowercase: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format']
  },
  
  // Institution information
  institution: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true,
    maxlength: [200, 'Institution name cannot exceed 200 characters']
  },
  issuerAddress: {
    type: String,
    required: [true, 'Issuer address is required'],
    lowercase: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format']
  },
  
  // Course information
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    maxlength: [200, 'Course name cannot exceed 200 characters']
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100']
  },
  
  // Certificate information
  certificateHash: {
    type: String,
    required: [true, 'Certificate hash is required'],
    trim: true
  },
  certificateUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Invalid URL format']
  },
  
  // Status and verification
  verified: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'expired'],
    default: 'verified'
  },
  
  // Dates
  completionDate: {
    type: Date,
    required: [true, 'Completion date is required']
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    sparse: true
  },
  
  // Additional metadata
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  skills: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // IPFS and external storage
  ipfsHash: {
    type: String,
    sparse: true
  },
  metadataUrl: {
    type: String,
    sparse: true,
    match: [/^https?:\/\/.+/, 'Invalid URL format']
  },
  
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    sparse: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
learningRecordSchema.index({ studentAddress: 1 });
learningRecordSchema.index({ issuerAddress: 1 });
learningRecordSchema.index({ institution: 1 });
learningRecordSchema.index({ courseName: 1 });
learningRecordSchema.index({ completionDate: -1 });
learningRecordSchema.index({ status: 1 });
learningRecordSchema.index({ verified: 1 });
learningRecordSchema.index({ blockchainId: 1 }, { sparse: true });
learningRecordSchema.index({ transactionHash: 1 }, { sparse: true });

// Compound indexes
learningRecordSchema.index({ studentAddress: 1, status: 1 });
learningRecordSchema.index({ institution: 1, courseName: 1 });
learningRecordSchema.index({ completionDate: -1, status: 1 });

// Virtual for formatted completion date
learningRecordSchema.virtual('formattedCompletionDate').get(function() {
  return this.completionDate ? this.completionDate.toISOString().split('T')[0] : null;
});

// Virtual for age of record
learningRecordSchema.virtual('ageInDays').get(function() {
  if (!this.completionDate) return null;
  const now = new Date();
  const diffTime = Math.abs(now - this.completionDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for grade letter
learningRecordSchema.virtual('gradeLetter').get(function() {
  if (this.score >= 90) return 'A';
  if (this.score >= 80) return 'B';
  if (this.score >= 70) return 'C';
  if (this.score >= 60) return 'D';
  return 'F';
});

// Pre-save middleware
learningRecordSchema.pre('save', function(next) {
  // Auto-generate tags from course name and institution
  if (this.isModified('courseName') || this.isModified('institution')) {
    const tags = [];
    
    // Add course-related tags
    if (this.courseName) {
      const courseWords = this.courseName.toLowerCase().split(/\s+/);
      tags.push(...courseWords.filter(word => word.length > 2));
    }
    
    // Add institution-related tags
    if (this.institution) {
      const institutionWords = this.institution.toLowerCase().split(/\s+/);
      tags.push(...institutionWords.filter(word => word.length > 2));
    }
    
    this.tags = [...new Set(tags)]; // Remove duplicates
  }
  
  next();
});

// Pre-update middleware for soft delete
learningRecordSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  const update = this.getUpdate();
  
  if (update.isDeleted === true && !update.deletedAt) {
    update.deletedAt = new Date();
  }
  
  next();
});

// Static methods
learningRecordSchema.statics.findByStudent = function(studentAddress) {
  return this.find({ 
    studentAddress: studentAddress.toLowerCase(),
    isDeleted: false 
  }).sort({ completionDate: -1 });
};

learningRecordSchema.statics.findByInstitution = function(institution) {
  return this.find({ 
    institution: new RegExp(institution, 'i'),
    isDeleted: false 
  }).sort({ completionDate: -1 });
};

learningRecordSchema.statics.findByCourse = function(courseName) {
  return this.find({ 
    courseName: new RegExp(courseName, 'i'),
    isDeleted: false 
  }).sort({ completionDate: -1 });
};

learningRecordSchema.statics.findVerified = function() {
  return this.find({ 
    verified: true,
    status: 'verified',
    isDeleted: false 
  });
};

learningRecordSchema.statics.findByBlockchainId = function(blockchainId) {
  return this.findOne({ 
    blockchainId,
    isDeleted: false 
  });
};

// Instance methods
learningRecordSchema.methods.markAsVerified = function() {
  this.verified = true;
  this.status = 'verified';
  return this.save();
};

learningRecordSchema.methods.markAsRejected = function() {
  this.verified = false;
  this.status = 'rejected';
  return this.save();
};

learningRecordSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

learningRecordSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  
  // Remove sensitive fields
  delete obj.createdBy;
  delete obj.updatedBy;
  delete obj.isDeleted;
  delete obj.deletedAt;
  
  return obj;
};

// Query helpers
learningRecordSchema.query.byStudent = function(studentAddress) {
  return this.where({ studentAddress: studentAddress.toLowerCase() });
};

learningRecordSchema.query.byInstitution = function(institution) {
  return this.where({ institution: new RegExp(institution, 'i') });
};

learningRecordSchema.query.verified = function() {
  return this.where({ verified: true, status: 'verified' });
};

learningRecordSchema.query.active = function() {
  return this.where({ isDeleted: false });
};

module.exports = mongoose.model('LearningRecord', learningRecordSchema);
