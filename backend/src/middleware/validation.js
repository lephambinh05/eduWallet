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

// Export schemas and validation function
module.exports = {
  validate,
  schemas: {
    addLearningRecord,
    earnBadge,
    createPortfolio,
    authorizeIssuer,
    calculatePoints,
    calculatePZO,
    checkApproval
  }
};