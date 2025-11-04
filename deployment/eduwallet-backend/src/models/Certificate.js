const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  // Basic Information
  tokenId: {
    type: Number,
    required: [true, 'Token ID is required'],
    unique: true
  },
  
  certificateId: {
    type: String,
    required: [true, 'Certificate ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  
  // Student Information
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  
  studentAddress: {
    type: String,
    required: [true, 'Student wallet address is required'],
    match: [/^0x[a-fA-F0-9]{40}$/, 'Please enter a valid wallet address']
  },
  
  // Course Information
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    maxlength: [200, 'Course name cannot exceed 200 characters']
  },
  
  courseCode: {
    type: String,
    trim: true,
    maxlength: [20, 'Course code cannot exceed 20 characters']
  },
  
  courseDescription: {
    type: String,
    trim: true,
    maxlength: [1000, 'Course description cannot exceed 1000 characters']
  },
  
  // Institution Information
  issuer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: [true, 'Issuer is required']
  },
  
  issuerName: {
    type: String,
    required: [true, 'Issuer name is required'],
    trim: true,
    maxlength: [200, 'Issuer name cannot exceed 200 characters']
  },
  
  // Academic Information
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required']
  },
  
  completionDate: {
    type: Date,
    required: [true, 'Completion date is required']
  },
  
  gradeOrScore: {
    type: String,
    required: [true, 'Grade or score is required'],
    trim: true,
    maxlength: [10, 'Grade or score cannot exceed 10 characters']
  },
  
  credits: {
    type: Number,
    min: 0,
    default: 0
  },
  
  duration: {
    type: Number, // in hours
    min: 0,
    default: 0
  },
  
  // Skills and Competencies
  skillsCovered: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    description: {
      type: String,
      trim: true
    }
  }],
  
  // Certificate Details
  certificateType: {
    type: String,
    enum: [
      'completion',
      'achievement',
      'participation',
      'excellence',
      'professional',
      'academic',
      'certification',
      'diploma',
      'degree'
    ],
    default: 'completion'
  },
  
  level: {
    type: String,
    enum: [
      'beginner',
      'intermediate',
      'advanced',
      'professional',
      'expert',
      'master'
    ],
    default: 'beginner'
  },
  
  category: {
    type: String,
    enum: [
      'technology',
      'business',
      'science',
      'arts',
      'language',
      'healthcare',
      'engineering',
      'education',
      'finance',
      'marketing',
      'design',
      'other'
    ],
    default: 'other'
  },
  
  // Blockchain Information
  contractAddress: {
    type: String,
    required: [true, 'Contract address is required'],
    match: [/^0x[a-fA-F0-9]{40}$/, 'Please enter a valid contract address']
  },
  
  transactionHash: {
    type: String,
    required: [true, 'Transaction hash is required'],
    match: [/^0x[a-fA-F0-9]{64}$/, 'Please enter a valid transaction hash']
  },
  
  blockNumber: {
    type: Number,
    required: [true, 'Block number is required']
  },
  
  // Metadata URI
  tokenURI: {
    type: String,
    required: [true, 'Token URI is required']
  },
  
  certificateURI: {
    type: String,
    required: [true, 'Certificate document URI is required']
  },
  
  // Verification Information
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verifiedAt: {
    type: Date,
    default: null
  },
  
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  verificationHash: {
    type: String,
    default: null
  },
  
  // Status Information
  status: {
    type: String,
    enum: ['active', 'suspended', 'revoked', 'expired'],
    default: 'active'
  },
  
  // Expiration
  expiresAt: {
    type: Date,
    default: null
  },
  
  // Additional Information
  prerequisites: [{
    type: String,
    trim: true
  }],
  
  learningOutcomes: [{
    type: String,
    trim: true,
    maxlength: [500, 'Learning outcome cannot exceed 500 characters']
  }],
  
  instructor: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Instructor name cannot exceed 100 characters']
    },
    email: {
      type: String,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Instructor title cannot exceed 100 characters']
    }
  },
  
  // Digital Signature
  digitalSignature: {
    signer: {
      type: String,
      trim: true
    },
    signature: {
      type: String,
      trim: true
    },
    signedAt: {
      type: Date,
      default: Date.now
    }
  },
  
  // Activity Log
  activities: [{
    type: {
      type: String,
      enum: [
        'issued',
        'verified',
        'suspended',
        'revoked',
        'expired',
        'updated',
        'viewed',
        'shared',
        'downloaded'
      ],
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Analytics
  analytics: {
    viewCount: {
      type: Number,
      default: 0
    },
    shareCount: {
      type: Number,
      default: 0
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    lastViewed: {
      type: Date,
      default: null
    }
  },
  
  // Privacy Settings
  privacy: {
    isPublic: {
      type: Boolean,
      default: false
    },
    showGrade: {
      type: Boolean,
      default: true
    },
    showSkills: {
      type: Boolean,
      default: true
    },
    allowVerification: {
      type: Boolean,
      default: true
    }
  },
  
  // Last Update
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
certificateSchema.index({ tokenId: 1 });
certificateSchema.index({ certificateId: 1 });
certificateSchema.index({ student: 1 });
certificateSchema.index({ studentAddress: 1 });
certificateSchema.index({ issuer: 1 });
certificateSchema.index({ contractAddress: 1 });
certificateSchema.index({ status: 1 });
certificateSchema.index({ isVerified: 1 });
certificateSchema.index({ issueDate: -1 });
certificateSchema.index({ createdAt: -1 });

// Compound indexes
certificateSchema.index({ student: 1, status: 1 });
certificateSchema.index({ issuer: 1, status: 1 });
certificateSchema.index({ isVerified: 1, status: 1 });
certificateSchema.index({ courseName: 1, issuer: 1 });
certificateSchema.index({ category: 1, level: 1 });

// Text index for search
certificateSchema.index({
  courseName: 'text',
  courseDescription: 'text',
  issuerName: 'text',
  'skillsCovered.name': 'text'
});

// Virtual fields
certificateSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

certificateSchema.virtual('ageInDays').get(function() {
  return Math.floor((new Date() - this.issueDate) / (1000 * 60 * 60 * 24));
});

certificateSchema.virtual('skillsList').get(function() {
  return this.skillsCovered.map(skill => skill.name).join(', ');
});

certificateSchema.virtual('isRecentlyIssued').get(function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.issueDate > thirtyDaysAgo;
});

// Pre-save middleware
certificateSchema.pre('save', function(next) {
  // Update lastUpdated timestamp
  if (this.isModified() && !this.isNew) {
    this.lastUpdated = new Date();
  }
  
  // Check if certificate is expired
  if (this.expiresAt && this.expiresAt < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  
  // Generate verification hash if not present
  if (!this.verificationHash && this.isVerified) {
    this.verificationHash = require('crypto')
      .createHash('sha256')
      .update(`${this.certificateId}-${this.studentAddress}-${this.issueDate}`)
      .digest('hex');
  }
  
  next();
});

// Instance methods
certificateSchema.methods.addActivity = function(type, description, metadata = {}, performedBy = null) {
  this.activities.push({
    type,
    description,
    metadata,
    performedBy,
    timestamp: new Date()
  });
  
  // Keep only last 50 activities
  if (this.activities.length > 50) {
    this.activities = this.activities.slice(-50);
  }
  
  return this.save();
};

certificateSchema.methods.verify = function(verifiedBy) {
  this.isVerified = true;
  this.verifiedAt = new Date();
  this.verifiedBy = verifiedBy;
  this.status = 'active';
  
  this.addActivity('verified', 'Certificate has been verified', {}, verifiedBy);
  
  return this.save();
};

certificateSchema.methods.suspend = function(reason, performedBy) {
  this.status = 'suspended';
  this.addActivity('suspended', `Certificate suspended: ${reason}`, { reason }, performedBy);
  
  return this.save();
};

certificateSchema.methods.revoke = function(reason, performedBy) {
  this.status = 'revoked';
  this.addActivity('revoked', `Certificate revoked: ${reason}`, { reason }, performedBy);
  
  return this.save();
};

certificateSchema.methods.incrementView = function() {
  this.analytics.viewCount += 1;
  this.analytics.lastViewed = new Date();
  this.addActivity('viewed', 'Certificate viewed');
  
  return this.save();
};

certificateSchema.methods.incrementShare = function() {
  this.analytics.shareCount += 1;
  this.addActivity('shared', 'Certificate shared');
  
  return this.save();
};

certificateSchema.methods.incrementDownload = function() {
  this.analytics.downloadCount += 1;
  this.addActivity('downloaded', 'Certificate downloaded');
  
  return this.save();
};

certificateSchema.methods.generateVerificationCode = function() {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  this.verificationHash = require('crypto')
    .createHash('sha256')
    .update(code)
    .digest('hex');
  
  return code;
};

// Static methods
certificateSchema.statics.findByStudent = function(studentId) {
  return this.find({ student: studentId, status: 'active' });
};

certificateSchema.statics.findByIssuer = function(issuerId) {
  return this.find({ issuer: issuerId, status: 'active' });
};

certificateSchema.statics.findVerified = function() {
  return this.find({ isVerified: true, status: 'active' });
};

certificateSchema.statics.findByTokenId = function(tokenId) {
  return this.findOne({ tokenId });
};

certificateSchema.statics.findByCertificateId = function(certificateId) {
  return this.findOne({ certificateId });
};

certificateSchema.statics.searchCertificates = function(query, filters = {}) {
  const searchQuery = {
    $text: { $search: query },
    status: 'active',
    ...filters
  };
  
  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } });
};

certificateSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalCertificates: { $sum: 1 },
        verifiedCertificates: {
          $sum: { $cond: ['$isVerified', 1, 0] }
        },
        activeCertificates: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        totalViews: { $sum: '$analytics.viewCount' },
        totalShares: { $sum: '$analytics.shareCount' },
        totalDownloads: { $sum: '$analytics.downloadCount' },
        averageCredits: { $avg: '$credits' },
        averageDuration: { $avg: '$duration' }
      }
    }
  ]);
};

certificateSchema.statics.getCategoryStats = function() {
  return this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        averageCredits: { $avg: '$credits' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

certificateSchema.statics.getIssuerStats = function() {
  return this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$issuer',
        count: { $sum: 1 },
        verifiedCount: {
          $sum: { $cond: ['$isVerified', 1, 0] }
        }
      }
    },
    {
      $lookup: {
        from: 'institutions',
        localField: '_id',
        foreignField: '_id',
        as: 'institution'
      }
    },
    { $unwind: '$institution' },
    {
      $project: {
        institutionName: '$institution.name',
        count: 1,
        verifiedCount: 1,
        verificationRate: {
          $multiply: [
            { $divide: ['$verifiedCount', '$count'] },
            100
          ]
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Post-save middleware
certificateSchema.post('save', function(doc) {
  if (this.isNew) {
    console.log(`New certificate created: ${doc.certificateId} for ${doc.courseName}`);
  }
});

module.exports = mongoose.model('Certificate', certificateSchema);
