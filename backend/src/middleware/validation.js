const Joi = require('joi');

// Validation schemas for EduWallet DataStore

const addLearningRecord = Joi.object({
  studentName: Joi.string().required().trim().max(100).messages({
    'string.empty': 'Student name is required',
    'string.max': 'Student name cannot exceed 100 characters'
  }),
  institution: Joi.string().required().trim().max(200).messages({
    'string.empty': 'Institution name is required',
    'string.max': 'Institution name cannot exceed 200 characters'
  }),
  courseName: Joi.string().required().trim().max(200).messages({
    'string.empty': 'Course name is required',
    'string.max': 'Course name cannot exceed 200 characters'
  }),
  certificateHash: Joi.string().required().trim().messages({
    'string.empty': 'Certificate hash is required'
  }),
  score: Joi.number().required().min(0).max(100).messages({
    'number.base': 'Score must be a number',
    'number.min': 'Score cannot be negative',
    'number.max': 'Score cannot exceed 100'
  }),
  studentAddress: Joi.string().required().pattern(/^0x[a-fA-F0-9]{40}$/).messages({
    'string.empty': 'Student address is required',
    'string.pattern.base': 'Invalid Ethereum address format'
  })
});

// LearnPass schemas
const learnPassCreate = Joi.object({
  studentId: Joi.string().min(1).max(50).required(),
  name: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().required(),
  profilePictureURI: Joi.string().uri().optional(),
  coursesCompletedURI: Joi.string().uri().optional(),
  skillsAcquiredURI: Joi.string().uri().optional()
});

const learnPassUpdate = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  profilePictureURI: Joi.string().uri().optional(),
  coursesCompletedURI: Joi.string().uri().optional(),
  skillsAcquiredURI: Joi.string().uri().optional()
});

// Certificate schemas
const certificateCreate = Joi.object({
  certificateId: Joi.string().min(1).max(50).required(),
  courseName: Joi.string().min(1).max(100).required(),
  issuerName: Joi.string().min(1).max(100).required(),
  issueDate: Joi.date().max('now').required(),
  gradeOrScore: Joi.string().max(20).optional(),
  skillsCovered: Joi.string().max(500).optional(),
  certificateURI: Joi.string().uri().required()
});

const certificateUpdate = Joi.object({
  courseName: Joi.string().min(1).max(100).optional(),
  gradeOrScore: Joi.string().max(20).optional(),
  skillsCovered: Joi.string().max(500).optional(),
  certificateURI: Joi.string().uri().optional()
});

// Marketplace schemas
const marketplaceItemCreate = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().min(1).max(500).required(),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).required(),
  category: Joi.string().valid('reward', 'merchandise', 'service', 'other').required(),
  imageURI: Joi.string().uri().optional()
});

const marketplaceItemUpdate = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().min(1).max(500).optional(),
  price: Joi.number().positive().optional(),
  stock: Joi.number().integer().min(0).optional(),
  category: Joi.string().valid('reward', 'merchandise', 'service', 'other').optional(),
  imageURI: Joi.string().uri().optional()
});

// Blockchain schemas
const blockchainRegisterUser = Joi.object({
  userAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  studentId: Joi.string().min(1).max(50).required(),
  name: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().required(),
  profilePictureURI: Joi.string().uri().optional(),
  coursesCompletedURI: Joi.string().uri().optional(),
  skillsAcquiredURI: Joi.string().uri().optional()
});

const blockchainIssueCertificate = Joi.object({
  studentAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  certificateId: Joi.string().min(1).max(50).required(),
  courseName: Joi.string().min(1).max(100).required(),
  issuerName: Joi.string().min(1).max(100).required(),
  issueDate: Joi.date().max('now').required(),
  gradeOrScore: Joi.string().max(20).optional(),
  skillsCovered: Joi.string().max(500).optional(),
  certificateURI: Joi.string().uri().required()
});

// Common schemas
const pagination = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

const search = Joi.object({
  q: Joi.string().min(1).max(100).optional(),
  sort: Joi.string().valid('createdAt', 'updatedAt', 'name', 'email').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

// Admin schemas
const adminUpdateUserRole = Joi.object({
  role: Joi.string().valid('student', 'institution', 'admin', 'super_admin').required()
});

const adminBlockUser = Joi.object({
  reason: Joi.string().min(1).max(200).required()
});

const adminCreateUser = Joi.object({
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
});

const adminUpdateUser = Joi.object({
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
});

const adminUpdateUserStatus = Joi.object({
  isActive: Joi.boolean().required(),
  reason: Joi.string().min(1).max(200).optional()
});

const adminUsersQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  role: Joi.string().valid('student', 'institution', 'admin', 'super_admin').optional(),
  status: Joi.string().valid('active', 'inactive', 'blocked').optional(),
  search: Joi.string().min(1).max(100).optional(),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'username', 'email', 'firstName', 'lastName').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  isEmailVerified: Joi.boolean().optional()
});

const objectId = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid ID format'
  })
});

const earnBadge = Joi.object({
  name: Joi.string().required().trim().max(100).messages({
    'string.empty': 'Badge name is required',
    'string.max': 'Badge name cannot exceed 100 characters'
  }),
  description: Joi.string().required().trim().max(500).messages({
    'string.empty': 'Badge description is required',
    'string.max': 'Badge description cannot exceed 500 characters'
  }),
  imageHash: Joi.string().required().trim().messages({
    'string.empty': 'Image hash is required'
  }),
  studentAddress: Joi.string().required().pattern(/^0x[a-fA-F0-9]{40}$/).messages({
    'string.empty': 'Student address is required',
    'string.pattern.base': 'Invalid Ethereum address format'
  })
});

const createPortfolio = Joi.object({
  title: Joi.string().required().trim().max(200).messages({
    'string.empty': 'Portfolio title is required',
    'string.max': 'Portfolio title cannot exceed 200 characters'
  }),
  description: Joi.string().required().trim().max(2000).messages({
    'string.empty': 'Portfolio description is required',
    'string.max': 'Portfolio description cannot exceed 2000 characters'
  }),
  projectHash: Joi.string().required().trim().messages({
    'string.empty': 'Project hash is required'
  }),
  skills: Joi.array().items(Joi.string().trim()).min(1).required().messages({
    'array.min': 'At least one skill is required',
    'array.base': 'Skills must be an array'
  })
});

const authorizeIssuer = Joi.object({
  issuerAddress: Joi.string().required().pattern(/^0x[a-fA-F0-9]{40}$/).messages({
    'string.empty': 'Issuer address is required',
    'string.pattern.base': 'Invalid Ethereum address format'
  }),
  authorized: Joi.boolean().required().messages({
    'boolean.base': 'Authorized must be a boolean value'
  })
});

// Point system validation schemas
const calculatePoints = Joi.object({
  pzoAmount: Joi.number().positive().required().messages({
    'number.base': 'PZO amount must be a number',
    'number.positive': 'PZO amount must be positive'
  })
});

const calculatePZO = Joi.object({
  pointAmount: Joi.number().positive().required().messages({
    'number.base': 'Point amount must be a number',
    'number.positive': 'Point amount must be positive'
  })
});

const checkApproval = Joi.object({
  userAddress: Joi.string().required().pattern(/^0x[a-fA-F0-9]{40}$/).messages({
    'string.empty': 'User address is required',
    'string.pattern.base': 'Invalid Ethereum address format'
  }),
  pzoAmount: Joi.number().positive().required().messages({
    'number.base': 'PZO amount must be a number',
    'number.positive': 'PZO amount must be positive'
  })
});

// Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};

// Validate query parameters
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
        errors
      });
    }
    
    next();
  };
};

// Validate URL parameters
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Parameter validation failed',
        errors
      });
    }
    
    next();
  };
};

// Export schemas and validation functions
module.exports = {
  validate,
  validateQuery,
  validateParams,
  schemas: {
    addLearningRecord,
    earnBadge,
    createPortfolio,
    authorizeIssuer,
    calculatePoints,
    calculatePZO,
    checkApproval,
    learnPassCreate,
    learnPassUpdate,
    certificateCreate,
    certificateUpdate,
    marketplaceItemCreate,
    marketplaceItemUpdate,
    blockchainRegisterUser,
    blockchainIssueCertificate,
    pagination,
    search,
    adminUpdateUserRole,
    adminBlockUser,
    adminCreateUser,
    adminUpdateUser,
    adminUpdateUserStatus,
    adminUsersQuery,
    objectId
  }
};