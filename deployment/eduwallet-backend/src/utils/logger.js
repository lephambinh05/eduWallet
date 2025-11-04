const winston = require("winston");
const path = require("path");
const ActivityLog = require("../models/ActivityLog");

// Create logs directory if it doesn't exist
const fs = require("fs");
const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: "eduwallet-backend" },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),

    // Write all logs to file
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Write all logs to file
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add user action logging with database persistence
logger.logUserAction = async (
  userId,
  actionType,
  metadata = {},
  req = null
) => {
  const logData = {
    userId,
    action: actionType,
    metadata,
    timestamp: new Date().toISOString(),
  };

  // Log to Winston
  logger.info("User action", logData);

  // Save to database
  try {
    const activityLog = new ActivityLog({
      userId,
      actionType,
      description: generateDescription(actionType, metadata),
      metadata,
      ipAddress: req?.ip || req?.connection?.remoteAddress || null,
      userAgent: req?.get("user-agent") || null,
      status: "success",
    });

    await activityLog.save();
  } catch (error) {
    logger.error("Failed to save activity log to database", {
      error: error.message,
    });
  }
};

// Generate human-readable description
function generateDescription(actionType, metadata) {
  const descriptions = {
    user_created: `Created user: ${metadata.targetUserEmail || "Unknown"}`,
    user_updated: `Updated user: ${metadata.targetUserEmail || "Unknown"}`,
    user_deleted: `Deleted user: ${metadata.targetUserEmail || "Unknown"}`,
    user_role_updated: `Changed role to ${metadata.newRole} for user: ${
      metadata.targetUserEmail || "Unknown"
    }`,
    user_status_updated: `Changed status to ${metadata.newStatus} for user: ${
      metadata.targetUserEmail || "Unknown"
    }`,
    user_blocked: `Blocked user: ${metadata.targetUserEmail || "Unknown"}`,
    user_unblocked: `Unblocked user: ${metadata.targetUserEmail || "Unknown"}`,
    users_bulk_deleted: `Bulk deleted ${metadata.count} users`,
    users_bulk_role_updated: `Bulk updated role to ${metadata.newRole} for ${metadata.count} users`,
    institution_approved: `Approved institution ID: ${metadata.institutionId}`,
    institution_rejected: `Rejected institution ID: ${metadata.institutionId}`,
    login: "User logged in",
    logout: "User logged out",
    password_changed: "Password changed",
    profile_updated: "Profile updated",
  };

  return descriptions[actionType] || `Action: ${actionType}`;
}

// Get user activities
logger.getUserActivities = async (userId, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    ActivityLog.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ActivityLog.countDocuments({ userId }),
  ]);

  return {
    activities,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total,
      limit,
    },
  };
};

// Get system activities
logger.getActivities = async (options = {}) => {
  const { page = 1, limit = 50, actionType, userId } = options;
  const skip = (page - 1) * limit;

  const query = {};
  if (actionType) query.actionType = actionType;
  if (userId) query.userId = userId;

  const [activities, total] = await Promise.all([
    ActivityLog.find(query)
      .populate("userId", "username email firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ActivityLog.countDocuments(query),
  ]);

  return {
    activities,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total,
      limit,
    },
  };
};

// Add system event logging
logger.logSystemEvent = (event, metadata = {}) => {
  logger.info("System event", {
    event,
    metadata,
    timestamp: new Date().toISOString(),
  });
};

// Add security event logging
logger.logSecurityEvent = (event, metadata = {}) => {
  logger.warn("Security event", {
    event,
    metadata,
    timestamp: new Date().toISOString(),
  });
};

// Add blockchain event logging
logger.logBlockchainEvent = (event, metadata = {}) => {
  logger.info("Blockchain event", {
    event,
    metadata,
    timestamp: new Date().toISOString(),
  });
};

// Persist blockchain transaction to DB when available
logger.logBlockchainTransaction = async (txHash, actionType, meta = {}) => {
  try {
    logger.info("Logging blockchain transaction", { txHash, actionType, meta });
    // Lazy require to avoid circular deps at startup
    const BlockchainTransaction = require("../models/BlockchainTransaction");

    const record = new BlockchainTransaction({
      userId: meta.userId || meta.user || null,
      txHash,
      type: actionType,
      tokenId: meta.tokenId || null,
      contractAddress:
        meta.contractAddress || meta.contract || meta.collection || null,
      ipfsHash: meta.ipfsHash || null,
      metadataURI: meta.metadataURI || null,
      to: meta.to || null,
      amount: meta.amount ? String(meta.amount) : null,
      blockNumber: meta.blockNumber || null,
      metadata: meta,
    });

    await record.save();
    logger.info("Blockchain transaction persisted", { id: record._id });
    return record;
  } catch (error) {
    logger.error("Failed to persist blockchain transaction", {
      error: error.message,
    });
    // Do not throw to avoid breaking callers
    return null;
  }
};

module.exports = logger;
