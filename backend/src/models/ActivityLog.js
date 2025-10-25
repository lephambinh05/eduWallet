const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  // User who performed the action
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Type of action performed
  actionType: {
    type: String,
    required: true,
    enum: [
      'user_created',
      'user_updated',
      'user_deleted',
      'user_role_updated',
      'user_status_updated',
      'user_blocked',
      'user_unblocked',
      'users_bulk_deleted',
      'users_bulk_role_updated',
      'institution_approved',
      'institution_rejected',
      'certificate_issued',
      'certificate_verified',
      'certificate_revoked',
      'learnpass_created',
      'learnpass_updated',
      'learnpass_verified',
      'learnpass_suspended',
      'learnpass_reactivated',
      'learnpass_revoked',
      'login',
      'logout',
      'password_changed',
      'profile_updated',
      'settings_updated'
    ],
    index: true
  },

  // Description of the action
  description: {
    type: String,
    required: true
  },

  // Target resource (if applicable)
  targetResource: {
    resourceType: {
      type: String,
      enum: ['User', 'Institution', 'Certificate', 'LearnPass', 'Badge', 'System'],
      default: null
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },

  // Metadata about the action
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Request information
  ipAddress: {
    type: String,
    default: null
  },

  userAgent: {
    type: String,
    default: null
  },

  // Status
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },

  errorMessage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ actionType: 1, createdAt: -1 });
activityLogSchema.index({ 'targetResource.resourceId': 1 });
activityLogSchema.index({ createdAt: -1 });

// TTL index to auto-delete old logs after 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
