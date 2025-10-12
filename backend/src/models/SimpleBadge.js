const mongoose = require('mongoose');

const simpleBadgeSchema = new mongoose.Schema({
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
  
  // Badge Details
  issuer: {
    type: String,
    required: true,
    trim: true
  },
  earnedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Category and Classification
  category: {
    type: String,
    required: true,
    enum: ['Achievement', 'Learning', 'Skill', 'Academic', 'Professional', 'Social', 'Language', 'Other']
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
  
  // Media
  iconUrl: {
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
simpleBadgeSchema.index({ userId: 1, title: 1 }, { unique: true });
simpleBadgeSchema.index({ userId: 1, category: 1 });
simpleBadgeSchema.index({ userId: 1, earnedDate: -1 });

// Virtual for formatted earned date
simpleBadgeSchema.virtual('earnedDateFormatted').get(function() {
  return this.earnedDate.toLocaleDateString('vi-VN');
});

// Virtual for points display
simpleBadgeSchema.virtual('pointsDisplay').get(function() {
  return `${this.points} points`;
});

// Pre-save middleware
simpleBadgeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
simpleBadgeSchema.statics.findByUser = function(userId) {
  return this.find({ userId, isActive: true }).sort({ earnedDate: -1 });
};

simpleBadgeSchema.statics.findByCategory = function(userId, category) {
  return this.find({ userId, category, isActive: true }).sort({ earnedDate: -1 });
};

simpleBadgeSchema.statics.getUserBadgeStats = async function(userId) {
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
simpleBadgeSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    issuer: this.issuer,
    earnedDate: this.earnedDate,
    earnedDateFormatted: this.earnedDateFormatted,
    category: this.category,
    level: this.level,
    points: this.points,
    pointsDisplay: this.pointsDisplay,
    rarity: this.rarity,
    iconUrl: this.iconUrl,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('SimpleBadge', simpleBadgeSchema);
