const Joi = require('joi');

// Validation schemas
const schemas = {
  // User schemas
  userRegistration: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    dateOfBirth: Joi.date().max('now').required(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
    role: Joi.string().valid('student', 'institution', 'admin').default('student')
  }),

  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  userUpdate: Joi.object({
    firstName: Joi.string().min(1).max(50).optional(),
    lastName: Joi.string().min(1).max(50).optional(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
    preferences: Joi.object().optional()
  }),

  walletAddress: Joi.object({
    walletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required()
  }),

  // Institution schemas
  institutionRegistration: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    institutionId: Joi.string().min(1).max(50).required(),
    type: Joi.string().valid('university', 'college', 'school', 'training_center', 'other').required(),
    address: Joi.string().min(1).max(200).required(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).required(),
    website: Joi.string().uri().optional(),
    description: Joi.string().max(500).optional()
  }),

  institutionUpdate: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    address: Joi.string().min(1).max(200).optional(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
    website: Joi.string().uri().optional(),
    description: Joi.string().max(500).optional()
  }),

  // LearnPass schemas
  learnPassCreate: Joi.object({
    studentId: Joi.string().min(1).max(50).required(),
    name: Joi.string().min(1).max(100).required(),
    email: Joi.string().email().required(),
    profilePictureURI: Joi.string().uri().optional(),
    coursesCompletedURI: Joi.string().uri().optional(),
    skillsAcquiredURI: Joi.string().uri().optional()
  }),

  learnPassUpdate: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    profilePictureURI: Joi.string().uri().optional(),
    coursesCompletedURI: Joi.string().uri().optional(),
    skillsAcquiredURI: Joi.string().uri().optional()
  }),

  // Certificate schemas
  certificateCreate: Joi.object({
    certificateId: Joi.string().min(1).max(50).required(),
    courseName: Joi.string().min(1).max(100).required(),
    issuerName: Joi.string().min(1).max(100).required(),
    issueDate: Joi.date().max('now').required(),
    gradeOrScore: Joi.string().max(20).optional(),
    skillsCovered: Joi.string().max(500).optional(),
    certificateURI: Joi.string().uri().required()
  }),

  certificateUpdate: Joi.object({
    courseName: Joi.string().min(1).max(100).optional(),
    gradeOrScore: Joi.string().max(20).optional(),
    skillsCovered: Joi.string().max(500).optional(),
    certificateURI: Joi.string().uri().optional()
  }),

  // Marketplace schemas
  marketplaceItemCreate: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().min(1).max(500).required(),
    price: Joi.number().positive().required(),
    stock: Joi.number().integer().min(0).required(),
    category: Joi.string().valid('reward', 'merchandise', 'service', 'other').required(),
    imageURI: Joi.string().uri().optional()
  }),

  marketplaceItemUpdate: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    description: Joi.string().min(1).max(500).optional(),
    price: Joi.number().positive().optional(),
    stock: Joi.number().integer().min(0).optional(),
    category: Joi.string().valid('reward', 'merchandise', 'service', 'other').optional(),
    imageURI: Joi.string().uri().optional()
  }),

  // Blockchain schemas
  blockchainRegisterUser: Joi.object({
    userAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
    studentId: Joi.string().min(1).max(50).required(),
    name: Joi.string().min(1).max(100).required(),
    email: Joi.string().email().required(),
    profilePictureURI: Joi.string().uri().optional(),
    coursesCompletedURI: Joi.string().uri().optional(),
    skillsAcquiredURI: Joi.string().uri().optional()
  }),

  blockchainIssueCertificate: Joi.object({
    studentAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
    certificateId: Joi.string().min(1).max(50).required(),
    courseName: Joi.string().min(1).max(100).required(),
    issuerName: Joi.string().min(1).max(100).required(),
    issueDate: Joi.date().max('now').required(),
    gradeOrScore: Joi.string().max(20).optional(),
    skillsCovered: Joi.string().max(500).optional(),
    certificateURI: Joi.string().uri().required()
  }),

  // Common schemas
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }),

  search: Joi.object({
    q: Joi.string().min(1).max(100).optional(),
    sort: Joi.string().valid('createdAt', 'updatedAt', 'name', 'email').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // Admin schemas
  adminUpdateUserRole: Joi.object({
    role: Joi.string().valid('student', 'institution', 'admin', 'super_admin').required()
  }),

  adminBlockUser: Joi.object({
    reason: Joi.string().min(1).max(200).required()
  }),

  adminCreateUser: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    dateOfBirth: Joi.date().max('now').required(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
    role: Joi.string().valid('student', 'institution', 'admin', 'super_admin').default('student'),
    isActive: Joi.boolean().default(true),
    isEmailVerified: Joi.boolean().default(false)
  }),

  adminUpdateUser: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).optional(),
    email: Joi.string().email().optional(),
    firstName: Joi.string().min(1).max(50).optional(),
    lastName: Joi.string().min(1).max(50).optional(),
    dateOfBirth: Joi.date().max('now').optional(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional().allow(''),
    role: Joi.string().valid('student', 'institution', 'admin', 'super_admin').optional(),
    isActive: Joi.boolean().optional(),
    isEmailVerified: Joi.boolean().optional(),
    studentId: Joi.string().optional().allow(''),
    avatar: Joi.string().uri().optional().allow('')
  }),

  adminUpdateUserStatus: Joi.object({
    isActive: Joi.boolean().required(),
    reason: Joi.string().min(1).max(200).optional()
  }),

  adminUsersQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    role: Joi.string().valid('student', 'institution', 'admin', 'super_admin').optional(),
    status: Joi.string().valid('active', 'inactive', 'blocked').optional(),
    search: Joi.string().min(1).max(100).optional(),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'username', 'email', 'firstName', 'lastName').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
    isEmailVerified: Joi.boolean().optional()
  }),

  objectId: Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.pattern.base': 'Invalid ID format'
    })
  })
};

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    req.body = value;
    next();
  };
};

// Query validation middleware
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Query validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    req.query = value;
    next();
  };
};

// Params validation middleware
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Parameter validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    req.params = value;
    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  validateParams,
  schemas
};