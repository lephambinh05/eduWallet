const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
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
  
  // Portfolio information
  title: {
    type: String,
    required: [true, 'Portfolio title is required'],
    trim: true,
    maxlength: [200, 'Portfolio title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Portfolio description is required'],
    trim: true,
    maxlength: [2000, 'Portfolio description cannot exceed 2000 characters']
  },
  
  // Owner information
  owner: {
    type: String,
    required: [true, 'Owner address is required'],
    lowercase: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format']
  },
  
  // Project information
  projectHash: {
    type: String,
    required: [true, 'Project hash is required'],
    trim: true
  },
  projectUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Invalid URL format']
  },
  repositoryUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Invalid URL format']
  },
  demoUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Invalid URL format']
  },
  
  // Skills and technologies
  skills: [{
    type: String,
    required: true,
    trim: true
  }],
  technologies: [{
    type: String,
    trim: true
  }],
  frameworks: [{
    type: String,
    trim: true
  }],
  languages: [{
    type: String,
    trim: true
  }],
  
  // Project details
  category: {
    type: String,
    enum: ['web-development', 'mobile-development', 'data-science', 'ai-ml', 'blockchain', 'game-development', 'design', 'research', 'other'],
    default: 'other'
  },
  type: {
    type: String,
    enum: ['personal', 'academic', 'professional', 'open-source', 'hackathon', 'competition'],
    default: 'personal'
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'maintenance', 'archived'],
    default: 'completed'
  },
  
  // Media and assets
  images: [{
    url: {
      type: String,
      required: true,
      match: [/^https?:\/\/.+/, 'Invalid URL format']
    },
    alt: {
      type: String,
      trim: true
    },
    caption: {
      type: String,
      trim: true
    }
  }],
  videos: [{
    url: {
      type: String,
      required: true,
      match: [/^https?:\/\/.+/, 'Invalid URL format']
    },
    title: {
      type: String,
      trim: true
    },
    duration: {
      type: Number // in seconds
    }
  }],
  documents: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      match: [/^https?:\/\/.+/, 'Invalid URL format']
    },
    type: {
      type: String,
      enum: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'md'],
      required: true
    },
    size: {
      type: Number // in bytes
    }
  }],
  
  // Project metrics
  duration: {
    type: Number, // in days
    min: [0, 'Duration cannot be negative']
  },
  teamSize: {
    type: Number,
    min: [1, 'Team size must be at least 1'],
    default: 1
  },
  complexity: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  
  // Collaboration and sharing
  isPublic: {
    type: Boolean,
    default: true
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  allowForks: {
    type: Boolean,
    default: false
  },
  
  // Engagement metrics
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  },
  likes: {
    type: Number,
    default: 0,
    min: [0, 'Likes cannot be negative']
  },
  shares: {
    type: Number,
    default: 0,
    min: [0, 'Shares cannot be negative']
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Awards and recognition
  awards: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    organization: {
      type: String,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  
  // Metadata
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
portfolioSchema.index({ owner: 1 });
portfolioSchema.index({ title: 1 });
portfolioSchema.index({ category: 1 });
portfolioSchema.index({ type: 1 });
portfolioSchema.index({ status: 1 });
portfolioSchema.index({ isPublic: 1 });
portfolioSchema.index({ createdAt: -1 });
portfolioSchema.index({ views: -1 });
portfolioSchema.index({ likes: -1 });
portfolioSchema.index({ blockchainId: 1 }, { sparse: true });
portfolioSchema.index({ transactionHash: 1 }, { sparse: true });

// Text index for search
portfolioSchema.index({
  title: 'text',
  description: 'text',
  skills: 'text',
  technologies: 'text',
  tags: 'text'
});

// Compound indexes
portfolioSchema.index({ owner: 1, status: 1 });
portfolioSchema.index({ category: 1, type: 1 });
portfolioSchema.index({ isPublic: 1, status: 1 });
portfolioSchema.index({ createdAt: -1, isPublic: 1 });

// Virtual for formatted creation date
portfolioSchema.virtual('formattedCreatedDate').get(function() {
  return this.createdAt ? this.createdAt.toISOString().split('T')[0] : null;
});

// Virtual for age of portfolio
portfolioSchema.virtual('ageInDays').get(function() {
  if (!this.createdAt) return null;
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for engagement score
portfolioSchema.virtual('engagementScore').get(function() {
  return (this.views * 1) + (this.likes * 5) + (this.shares * 10) + (this.comments.length * 3);
});

// Virtual for skill count
portfolioSchema.virtual('skillCount').get(function() {
  return this.skills ? this.skills.length : 0;
});

// Virtual for technology count
portfolioSchema.virtual('technologyCount').get(function() {
  return this.technologies ? this.technologies.length : 0;
});

// Pre-save middleware
portfolioSchema.pre('save', function(next) {
  // Auto-generate tags from title, description, and skills
  if (this.isModified('title') || this.isModified('description') || this.isModified('skills')) {
    const tags = [];
    
    // Add title-related tags
    if (this.title) {
      const titleWords = this.title.toLowerCase().split(/\s+/);
      tags.push(...titleWords.filter(word => word.length > 2));
    }
    
    // Add description-related tags
    if (this.description) {
      const descWords = this.description.toLowerCase().split(/\s+/);
      tags.push(...descWords.filter(word => word.length > 2));
    }
    
    // Add skills as tags
    if (this.skills && this.skills.length > 0) {
      tags.push(...this.skills.map(skill => skill.toLowerCase()));
    }
    
    // Add technologies as tags
    if (this.technologies && this.technologies.length > 0) {
      tags.push(...this.technologies.map(tech => tech.toLowerCase()));
    }
    
    // Add category and type as tags
    if (this.category) tags.push(this.category);
    if (this.type) tags.push(this.type);
    
    this.tags = [...new Set(tags)]; // Remove duplicates
  }
  
  next();
});

// Pre-update middleware for soft delete
portfolioSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  const update = this.getUpdate();
  
  if (update.isDeleted === true && !update.deletedAt) {
    update.deletedAt = new Date();
  }
  
  next();
});

// Static methods
portfolioSchema.statics.findByOwner = function(ownerAddress) {
  return this.find({ 
    owner: ownerAddress.toLowerCase(),
    isDeleted: false 
  }).sort({ createdAt: -1 });
};

portfolioSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category,
    isPublic: true,
    isDeleted: false 
  }).sort({ createdAt: -1 });
};

portfolioSchema.statics.findBySkill = function(skill) {
  return this.find({ 
    skills: { $regex: skill, $options: 'i' },
    isPublic: true,
    isDeleted: false 
  }).sort({ createdAt: -1 });
};

portfolioSchema.statics.findPublic = function() {
  return this.find({ 
    isPublic: true,
    isDeleted: false 
  }).sort({ createdAt: -1 });
};

portfolioSchema.statics.findTrending = function(limit = 10) {
  return this.find({ 
    isPublic: true,
    isDeleted: false 
  }).sort({ engagementScore: -1 }).limit(limit);
};

portfolioSchema.statics.findByBlockchainId = function(blockchainId) {
  return this.findOne({ 
    blockchainId,
    isDeleted: false 
  });
};

portfolioSchema.statics.search = function(query) {
  return this.find({
    $text: { $search: query },
    isPublic: true,
    isDeleted: false
  }, {
    score: { $meta: 'textScore' }
  }).sort({ score: { $meta: 'textScore' } });
};

// Instance methods
portfolioSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

portfolioSchema.methods.incrementLikes = function() {
  this.likes += 1;
  return this.save();
};

portfolioSchema.methods.incrementShares = function() {
  this.shares += 1;
  return this.save();
};

portfolioSchema.methods.addComment = function(userId, content) {
  if (!this.allowComments) {
    throw new Error('Comments are not allowed on this portfolio');
  }
  
  this.comments.push({
    user: userId,
    content: content
  });
  
  return this.save();
};

portfolioSchema.methods.makePublic = function() {
  this.isPublic = true;
  return this.save();
};

portfolioSchema.methods.makePrivate = function() {
  this.isPublic = false;
  return this.save();
};

portfolioSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

portfolioSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  
  // Remove sensitive fields
  delete obj.createdBy;
  delete obj.updatedBy;
  delete obj.isDeleted;
  delete obj.deletedAt;
  
  return obj;
};

// Query helpers
portfolioSchema.query.byOwner = function(ownerAddress) {
  return this.where({ owner: ownerAddress.toLowerCase() });
};

portfolioSchema.query.byCategory = function(category) {
  return this.where({ category });
};

portfolioSchema.query.bySkill = function(skill) {
  return this.where({ skills: { $regex: skill, $options: 'i' } });
};

portfolioSchema.query.public = function() {
  return this.where({ isPublic: true });
};

portfolioSchema.query.active = function() {
  return this.where({ isDeleted: false });
};

module.exports = mongoose.model('Portfolio', portfolioSchema);
