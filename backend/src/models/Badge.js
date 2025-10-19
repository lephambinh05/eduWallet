const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  // Blockchain data
  blockchainId: {
    type: String,
    unique: true,
    sparse: true
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
  
  // Badge information
  name: {
    type: String,
    required: [true, 'Badge name is required'],
    trim: true,
    maxlength: [100, 'Badge name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Badge description is required'],
    trim: true,
    maxlength: [500, 'Badge description cannot exceed 500 characters']
  },
  
  // Student information
  studentAddress: {
    type: String,
    required: [true, 'Student address is required'],
    lowercase: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format']
  },
  
  // Issuer information
  issuerAddress: {
    type: String,
    required: [true, 'Issuer address is required'],
    lowercase: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format']
  },
  
  // Media and assets
  imageHash: {
    type: String,
    required: [true, 'Image hash is required'],
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Invalid URL format']
  },
  iconUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Invalid URL format']
  },
  
  // Badge properties
  category: {
    type: String,
    enum: ['academic', 'skill', 'achievement', 'participation', 'leadership', 'innovation', 'community', 'other'],
    default: 'achievement'
  },
  level: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    default: 'bronze'
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  
  // Status and verification
  active: {
    type: Boolean,
    default: true
  },
  verified: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'revoked'],
    default: 'active'
  },
  
  // Dates
  earnedDate: {
    type: Date,
    required: [true, 'Earned date is required']
  },
  expiryDate: {
    type: Date,
    sparse: true
  },
  
  // Criteria and requirements
  criteria: {
    type: String,
    trim: true,
    maxlength: [1000, 'Criteria cannot exceed 1000 characters']
  },
  requirements: [{
    type: String,
    trim: true
  }],
  
  // Related data
  relatedCourse: {
    type: String,
    trim: true
  },
  relatedInstitution: {
    type: String,
    trim: true
  },
  relatedProject: {
    type: String,
    trim: true
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  skills: [{
    type: String,
    trim: true
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
  
  // Points and rewards
  points: {
    type: Number,
    default: 0,
    min: [0, 'Points cannot be negative']
  },
  rewardTokens: {
    type: Number,
    default: 0,
    min: [0, 'Reward tokens cannot be negative']
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
badgeSchema.index({ studentAddress: 1 });
badgeSchema.index({ issuerAddress: 1 });
badgeSchema.index({ name: 1 });
badgeSchema.index({ category: 1 });
badgeSchema.index({ level: 1 });
badgeSchema.index({ rarity: 1 });
badgeSchema.index({ earnedDate: -1 });
badgeSchema.index({ status: 1 });
badgeSchema.index({ active: 1 });
badgeSchema.index({ verified: 1 });
badgeSchema.index({ blockchainId: 1 }, { sparse: true });
badgeSchema.index({ transactionHash: 1 }, { sparse: true });

// Compound indexes
badgeSchema.index({ studentAddress: 1, status: 1 });
badgeSchema.index({ category: 1, level: 1 });
badgeSchema.index({ earnedDate: -1, status: 1 });
badgeSchema.index({ name: 1, category: 1 });

// Virtual for formatted earned date
badgeSchema.virtual('formattedEarnedDate').get(function() {
  return this.earnedDate ? this.earnedDate.toISOString().split('T')[0] : null;
});

// Virtual for age of badge
badgeSchema.virtual('ageInDays').get(function() {
  if (!this.earnedDate) return null;
  const now = new Date();
  const diffTime = Math.abs(now - this.earnedDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for badge color based on level
badgeSchema.virtual('color').get(function() {
  const colors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF'
  };
  return colors[this.level] || '#CD7F32';
});

// Virtual for badge icon based on category
badgeSchema.virtual('iconClass').get(function() {
  const icons = {
    academic: 'fa-graduation-cap',
    skill: 'fa-cogs',
    achievement: 'fa-trophy',
    participation: 'fa-users',
    leadership: 'fa-crown',
    innovation: 'fa-lightbulb',
    community: 'fa-heart',
    other: 'fa-star'
  };
  return icons[this.category] || 'fa-star';
});

// Pre-save middleware
badgeSchema.pre('save', function(next) {
  // Auto-generate tags from name and description
  if (this.isModified('name') || this.isModified('description')) {
    const tags = [];
    
    // Add name-related tags
    if (this.name) {
      const nameWords = this.name.toLowerCase().split(/\s+/);
      tags.push(...nameWords.filter(word => word.length > 2));
    }
    
    // Add description-related tags
    if (this.description) {
      const descWords = this.description.toLowerCase().split(/\s+/);
      tags.push(...descWords.filter(word => word.length > 2));
    }
    
    // Add category and level as tags
    if (this.category) tags.push(this.category);
    if (this.level) tags.push(this.level);
    if (this.rarity) tags.push(this.rarity);
    
    this.tags = [...new Set(tags)]; // Remove duplicates
  }
  
  next();
});

// Pre-update middleware for soft delete
badgeSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  const update = this.getUpdate();
  
  if (update.isDeleted === true && !update.deletedAt) {
    update.deletedAt = new Date();
  }
  
  next();
});

// Static methods
badgeSchema.statics.findByStudent = function(studentAddress) {
  return this.find({ 
    studentAddress: studentAddress.toLowerCase(),
    isDeleted: false 
  }).sort({ earnedDate: -1 });
};

badgeSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category,
    isDeleted: false 
  }).sort({ earnedDate: -1 });
};

badgeSchema.statics.findByLevel = function(level) {
  return this.find({ 
    level,
    isDeleted: false 
  }).sort({ earnedDate: -1 });
};

badgeSchema.statics.findActive = function() {
  return this.find({ 
    active: true,
    status: 'active',
    isDeleted: false 
  });
};

badgeSchema.statics.findByBlockchainId = function(blockchainId) {
  return this.findOne({ 
    blockchainId,
    isDeleted: false 
  });
};

badgeSchema.statics.getBadgeStats = function(studentAddress) {
  return this.aggregate([
    {
      $match: {
        studentAddress: studentAddress.toLowerCase(),
        isDeleted: false
      }
    },
    {
      $group: {
        _id: null,
        totalBadges: { $sum: 1 },
        totalPoints: { $sum: '$points' },
        totalRewardTokens: { $sum: '$rewardTokens' },
        categories: { $addToSet: '$category' },
        levels: { $addToSet: '$level' },
        rarities: { $addToSet: '$rarity' }
      }
    }
  ]);
};

// Instance methods
badgeSchema.methods.activate = function() {
  this.active = true;
  this.status = 'active';
  return this.save();
};

badgeSchema.methods.deactivate = function() {
  this.active = false;
  this.status = 'inactive';
  return this.save();
};

badgeSchema.methods.revoke = function() {
  this.active = false;
  this.status = 'revoked';
  return this.save();
};

badgeSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

badgeSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  
  // Remove sensitive fields
  delete obj.createdBy;
  delete obj.updatedBy;
  delete obj.isDeleted;
  delete obj.deletedAt;
  
  return obj;
};

// Query helpers
badgeSchema.query.byStudent = function(studentAddress) {
  return this.where({ studentAddress: studentAddress.toLowerCase() });
};

badgeSchema.query.byCategory = function(category) {
  return this.where({ category });
};

badgeSchema.query.byLevel = function(level) {
  return this.where({ level });
};

badgeSchema.query.active = function() {
  return this.where({ active: true, status: 'active' });
};

badgeSchema.query.verified = function() {
  return this.where({ verified: true });
};

module.exports = mongoose.model('Badge', badgeSchema);