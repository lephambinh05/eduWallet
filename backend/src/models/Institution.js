const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true,
    maxlength: [200, 'Institution name cannot exceed 200 characters']
  },
  
  institutionId: {
    type: String,
    required: [true, 'Institution ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  
  // Contact Information
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  
  // Address Information
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters']
    },
    postalCode: {
      type: String,
      trim: true,
      maxlength: [20, 'Postal code cannot exceed 20 characters']
    }
  },
  
  // Institution Details
  type: {
    type: String,
    required: [true, 'Institution type is required'],
    enum: [
      'university',
      'college',
      'school',
      'training_center',
      'online_platform',
      'certification_body',
      'government_agency',
      'private_organization',
      'other'
    ]
  },
  
  level: {
    type: String,
    required: [true, 'Education level is required'],
    enum: [
      'primary',
      'secondary',
      'high_school',
      'vocational',
      'undergraduate',
      'graduate',
      'postgraduate',
      'professional',
      'all_levels'
    ]
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Blockchain Information
  walletAddress: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Please enter a valid Ethereum address']
  },
  
  // Verification Status
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
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isBlocked: {
    type: Boolean,
    default: false
  },
  
  // Administrative Information
  adminUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  contactPerson: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Contact person name cannot exceed 100 characters']
    },
    position: {
      type: String,
      trim: true,
      maxlength: [100, 'Position cannot exceed 100 characters']
    },
    email: {
      type: String,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    }
  },
  
  // Accreditation and Certifications
  accreditations: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    issuer: {
      type: String,
      required: true,
      trim: true
    },
    issuedDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date,
      default: null
    },
    certificateNumber: {
      type: String,
      trim: true
    },
    documentUrl: {
      type: String,
      trim: true
    }
  }],
  
  // Statistics
  stats: {
    totalStudents: {
      type: Number,
      default: 0
    },
    totalCertificates: {
      type: Number,
      default: 0
    },
    totalLearnPasses: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  
  // Settings and Preferences
  settings: {
    allowStudentRegistration: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    autoIssueCertificates: {
      type: Boolean,
      default: false
    },
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Documents and Files
  documents: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['license', 'accreditation', 'certificate', 'other']
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  
  // Audit Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
institutionSchema.index({ name: 1 });
institutionSchema.index({ institutionId: 1 });
institutionSchema.index({ email: 1 });
institutionSchema.index({ walletAddress: 1 });
institutionSchema.index({ type: 1 });
institutionSchema.index({ level: 1 });
institutionSchema.index({ country: 1 });
institutionSchema.index({ isVerified: 1 });
institutionSchema.index({ isActive: 1 });
institutionSchema.index({ createdAt: -1 });

// Virtual fields
institutionSchema.virtual('fullAddress').get(function() {
  const parts = [
    this.address.street,
    this.address.city,
    this.address.state,
    this.address.postalCode,
    this.address.country
  ].filter(Boolean);
  
  return parts.join(', ');
});

institutionSchema.virtual('isFullyVerified').get(function() {
  return this.isVerified && this.isActive && !this.isBlocked;
});

// Pre-save middleware
institutionSchema.pre('save', function(next) {
  // Update stats when institution is modified
  if (this.isModified('isActive') || this.isModified('isVerified')) {
    this.stats.lastActivity = new Date();
  }
  next();
});

// Instance methods
institutionSchema.methods.addAdmin = function(userId) {
  if (!this.adminUsers.includes(userId)) {
    this.adminUsers.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

institutionSchema.methods.removeAdmin = function(userId) {
  this.adminUsers = this.adminUsers.filter(id => !id.equals(userId));
  return this.save();
};

institutionSchema.methods.isAdmin = function(userId) {
  return this.adminUsers.some(id => id.equals(userId));
};

institutionSchema.methods.verify = function(verifiedBy) {
  this.isVerified = true;
  this.verifiedAt = new Date();
  this.verifiedBy = verifiedBy;
  this.stats.lastActivity = new Date();
  return this.save();
};

institutionSchema.methods.unverify = function() {
  this.isVerified = false;
  this.verifiedAt = null;
  this.verifiedBy = null;
  this.stats.lastActivity = new Date();
  return this.save();
};

institutionSchema.methods.addDocument = function(documentData, uploadedBy) {
  this.documents.push({
    ...documentData,
    uploadedBy
  });
  return this.save();
};

institutionSchema.methods.updateStats = function() {
  return this.constructor.aggregate([
    { $match: { _id: this._id } },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: 'institutionId',
        as: 'students'
      }
    },
    {
      $lookup: {
        from: 'certificates',
        localField: '_id',
        foreignField: 'issuerId',
        as: 'certificates'
      }
    },
    {
      $lookup: {
        from: 'learnpasses',
        localField: '_id',
        foreignField: 'institutionId',
        as: 'learnPasses'
      }
    },
    {
      $project: {
        'stats.totalStudents': { $size: '$students' },
        'stats.totalCertificates': { $size: '$certificates' },
        'stats.totalLearnPasses': { $size: '$learnPasses' },
        'stats.lastActivity': new Date()
      }
    }
  ]).then(result => {
    if (result.length > 0) {
      Object.assign(this.stats, result[0].stats);
      return this.save();
    }
    return this;
  });
};

// Static methods
institutionSchema.statics.findVerified = function() {
  return this.find({ isVerified: true, isActive: true });
};

institutionSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true });
};

institutionSchema.statics.findByCountry = function(country) {
  return this.find({ 'address.country': country, isActive: true });
};

institutionSchema.statics.searchByName = function(query) {
  return this.find({
    name: { $regex: query, $options: 'i' },
    isActive: true
  });
};

// Post-save middleware
institutionSchema.post('save', function(doc) {
  if (this.isNew) {
    console.log(`New institution created: ${doc.name}`);
  }
});

module.exports = mongoose.model('Institution', institutionSchema);
