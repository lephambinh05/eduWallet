const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
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
  iconUrl: {
    type: String,
    default: null
  },
  
  // Category and Classification
  category: {
    type: String,
    required: true,
    enum: ['Achievement', 'Learning', 'Skill', 'Academic', 'Professional', 'Social', 'Other']
  },
  level: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
  },
  
  // User Association
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Achievement Details
  earnedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Rarity and Status
  rarity: {
    type: String,
    enum: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'],
    default: 'Common'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Verification
  verificationUrl: {
    type: String,
    default: null
  },
  issuer: {
    type: String,
    required: true,
    trim: true
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
badgeSchema.index({ userId: 1, title: 1 }, { unique: true });
badgeSchema.index({ userId: 1, category: 1 });
badgeSchema.index({ userId: 1, earnedDate: -1 });
badgeSchema.index({ rarity: 1 });

// Virtual for formatted earned date
badgeSchema.virtual('earnedDateFormatted').get(function() {
  return this.earnedDate.toLocaleDateString('vi-VN');
});

// Virtual for points display
badgeSchema.virtual('pointsDisplay').get(function() {
  return `${this.points} points`;
});

// Pre-save middleware
badgeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
badgeSchema.statics.findByUser = function(userId) {
  return this.find({ userId, isActive: true }).sort({ earnedDate: -1 });
};

badgeSchema.statics.findByCategory = function(userId, category) {
  return this.find({ userId, category, isActive: true }).sort({ earnedDate: -1 });
};

badgeSchema.statics.findByRarity = function(userId, rarity) {
  return this.find({ userId, rarity, isActive: true }).sort({ earnedDate: -1 });
};

badgeSchema.statics.getUserBadgeStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), isActive: true } },
    {
      $group: {
        _id: null,
        totalBadges: { $sum: 1 },
        totalPoints: { $sum: '$points' },
        categories: { $addToSet: '$category' },
        rarities: { $addToSet: '$rarity' }
      }
    }
  ]);
  
  return stats[0] || {
    totalBadges: 0,
    totalPoints: 0,
    categories: [],
    rarities: []
  };
};

// Instance methods
badgeSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    iconUrl: this.iconUrl,
    category: this.category,
    level: this.level,
    earnedDate: this.earnedDate,
    earnedDateFormatted: this.earnedDateFormatted,
    points: this.points,
    pointsDisplay: this.pointsDisplay,
    rarity: this.rarity,
    issuer: this.issuer,
    verificationUrl: this.verificationUrl,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('Badge', badgeSchema);
