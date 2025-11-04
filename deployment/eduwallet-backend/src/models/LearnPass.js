const mongoose = require('mongoose');

const learnPassSchema = new mongoose.Schema({
  // Basic Information
  tokenId: {
    type: Number,
    required: [true, 'Token ID is required'],
    unique: true
  },
  
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  
  // Student Information
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    trim: true
  },
  
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  // Institution Information
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: [true, 'Institution is required']
  },
  
  // Profile Information
  profilePictureURI: {
    type: String,
    default: null
  },
  
  // Academic Information
  coursesCompletedURI: {
    type: String,
    default: null
  },
  
  skillsAcquiredURI: {
    type: String,
    default: null
  },
  
  // Metadata URI
  tokenURI: {
    type: String,
    required: [true, 'Token URI is required']
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
  
  // Status Information
  status: {
    type: String,
    enum: ['active', 'suspended', 'revoked', 'expired'],
    default: 'active'
  },
  
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
  
  // Academic Progress
  academicProgress: {
    totalCourses: {
      type: Number,
      default: 0
    },
    completedCourses: {
      type: Number,
      default: 0
    },
    totalSkills: {
      type: Number,
      default: 0
    },
    acquiredSkills: {
      type: Number,
      default: 0
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4.0,
      default: 0
    },
    credits: {
      type: Number,
      default: 0
    }
  },
  
  // Certificates
  certificates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  }],
  
  // Rewards and Achievements
  rewards: [{
    type: {
      type: String,
      enum: ['edu_token', 'badge', 'certificate', 'recognition'],
      required: true
    },
    amount: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      trim: true
    },
    awardedAt: {
      type: Date,
      default: Date.now
    },
    awardedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Badges
  badges: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    icon: {
      type: String,
      default: null
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    criteria: {
      type: String,
      trim: true
    }
  }],
  
  // Activity Log
  activities: [{
    type: {
      type: String,
      enum: [
        'created',
        'updated',
        'certificate_earned',
        'skill_acquired',
        'course_completed',
        'reward_received',
        'badge_earned',
        'verified',
        'suspended',
        'revoked'
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
  
  // Privacy Settings
  privacy: {
    isPublic: {
      type: Boolean,
      default: false
    },
    showCertificates: {
      type: Boolean,
      default: true
    },
    showSkills: {
      type: Boolean,
      default: true
    },
    showProgress: {
      type: Boolean,
      default: true
    },
    allowInstitutionAccess: {
      type: Boolean,
      default: true
    }
  },
  
  // Expiration
  expiresAt: {
    type: Date,
    default: null
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
learnPassSchema.index({ tokenId: 1 });
learnPassSchema.index({ owner: 1 });
learnPassSchema.index({ studentId: 1 });
learnPassSchema.index({ institutionId: 1 });
learnPassSchema.index({ contractAddress: 1 });
learnPassSchema.index({ status: 1 });
learnPassSchema.index({ isVerified: 1 });
learnPassSchema.index({ createdAt: -1 });
learnPassSchema.index({ lastUpdated: -1 });

// Compound indexes
learnPassSchema.index({ owner: 1, status: 1 });
learnPassSchema.index({ institutionId: 1, status: 1 });
learnPassSchema.index({ isVerified: 1, status: 1 });

// Virtual fields
learnPassSchema.virtual('completionPercentage').get(function() {
  if (this.academicProgress.totalCourses === 0) return 0;
  return Math.round((this.academicProgress.completedCourses / this.academicProgress.totalCourses) * 100);
});

learnPassSchema.virtual('skillPercentage').get(function() {
  if (this.academicProgress.totalSkills === 0) return 0;
  return Math.round((this.academicProgress.acquiredSkills / this.academicProgress.totalSkills) * 100);
});

learnPassSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

learnPassSchema.virtual('totalRewards').get(function() {
  return this.rewards.reduce((total, reward) => {
    return total + (reward.amount || 0);
  }, 0);
});

// Pre-save middleware
learnPassSchema.pre('save', function(next) {
  // Update lastUpdated timestamp
  if (this.isModified() && !this.isNew) {
    this.lastUpdated = new Date();
  }
  
  // Check if LearnPass is expired
  if (this.expiresAt && this.expiresAt < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  
  next();
});

// Instance methods
learnPassSchema.methods.addActivity = function(type, description, metadata = {}, performedBy = null) {
  this.activities.push({
    type,
    description,
    metadata,
    performedBy,
    timestamp: new Date()
  });
  
  // Keep only last 100 activities
  if (this.activities.length > 100) {
    this.activities = this.activities.slice(-100);
  }
  
  return this.save();
};

learnPassSchema.methods.addReward = function(type, amount, description, awardedBy) {
  this.rewards.push({
    type,
    amount,
    description,
    awardedBy,
    awardedAt: new Date()
  });
  
  return this.save();
};

learnPassSchema.methods.addBadge = function(name, description, icon, criteria) {
  this.badges.push({
    name,
    description,
    icon,
    criteria,
    earnedAt: new Date()
  });
  
  return this.save();
};

learnPassSchema.methods.updateProgress = function(courseData, skillData) {
  if (courseData) {
    this.academicProgress.totalCourses = courseData.total || this.academicProgress.totalCourses;
    this.academicProgress.completedCourses = courseData.completed || this.academicProgress.completedCourses;
    this.academicProgress.credits = courseData.credits || this.academicProgress.credits;
    this.academicProgress.gpa = courseData.gpa || this.academicProgress.gpa;
  }
  
  if (skillData) {
    this.academicProgress.totalSkills = skillData.total || this.academicProgress.totalSkills;
    this.academicProgress.acquiredSkills = skillData.acquired || this.academicProgress.acquiredSkills;
  }
  
  return this.save();
};

learnPassSchema.methods.verify = function(verifiedBy) {
  this.isVerified = true;
  this.verifiedAt = new Date();
  this.verifiedBy = verifiedBy;
  this.status = 'active';
  
  this.addActivity('verified', 'LearnPass has been verified', {}, verifiedBy);
  
  return this.save();
};

learnPassSchema.methods.suspend = function(reason, performedBy) {
  this.status = 'suspended';
  this.addActivity('suspended', `LearnPass suspended: ${reason}`, { reason }, performedBy);
  
  return this.save();
};

learnPassSchema.methods.revoke = function(reason, performedBy) {
  this.status = 'revoked';
  this.addActivity('revoked', `LearnPass revoked: ${reason}`, { reason }, performedBy);
  
  return this.save();
};

learnPassSchema.methods.reactivate = function(performedBy) {
  this.status = 'active';
  this.addActivity('updated', 'LearnPass reactivated', {}, performedBy);
  
  return this.save();
};

// Static methods
learnPassSchema.statics.findByOwner = function(ownerId) {
  return this.find({ owner: ownerId, status: 'active' });
};

learnPassSchema.statics.findByInstitution = function(institutionId) {
  return this.find({ institutionId, status: 'active' });
};

learnPassSchema.statics.findVerified = function() {
  return this.find({ isVerified: true, status: 'active' });
};

learnPassSchema.statics.findByTokenId = function(tokenId) {
  return this.findOne({ tokenId });
};

learnPassSchema.statics.findByStudentId = function(studentId) {
  return this.findOne({ studentId, status: 'active' });
};

learnPassSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalLearnPasses: { $sum: 1 },
        verifiedLearnPasses: {
          $sum: { $cond: ['$isVerified', 1, 0] }
        },
        activeLearnPasses: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        totalCertificates: {
          $sum: { $size: { $ifNull: ['$certificates', []] } }
        },
        totalRewards: {
          $sum: { $size: { $ifNull: ['$rewards', []] } }
        },
        averageGPA: { $avg: '$academicProgress.gpa' },
        averageCompletion: {
          $avg: {
            $cond: [
              { $gt: ['$academicProgress.totalCourses', 0] },
              {
                $multiply: [
                  { $divide: ['$academicProgress.completedCourses', '$academicProgress.totalCourses'] },
                  100
                ]
              },
              0
            ]
          }
        }
      }
    }
  ]);
};

// Post-save middleware
learnPassSchema.post('save', function(doc) {
  if (this.isNew) {
    console.log(`New LearnPass created: Token ID ${doc.tokenId} for ${doc.name}`);
  }
});

module.exports = mongoose.model('LearnPass', learnPassSchema);
