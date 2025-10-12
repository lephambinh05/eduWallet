const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'eduwallet-backend' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // Write all logs to file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Write all logs to file
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add user action logging
logger.logUserAction = (userId, action, metadata = {}) => {
  logger.info('User action', {
    userId,
    action,
    metadata,
    timestamp: new Date().toISOString()
  });
};

// Add system event logging
logger.logSystemEvent = (event, metadata = {}) => {
  logger.info('System event', {
    event,
    metadata,
    timestamp: new Date().toISOString()
  });
};

// Add security event logging
logger.logSecurityEvent = (event, metadata = {}) => {
  logger.warn('Security event', {
    event,
    metadata,
    timestamp: new Date().toISOString()
  });
};

// Add blockchain event logging
logger.logBlockchainEvent = (event, metadata = {}) => {
  logger.info('Blockchain event', {
    event,
    metadata,
    timestamp: new Date().toISOString()
  });
};

module.exports = logger;