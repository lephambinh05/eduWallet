const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');
const LearnPass = require('../models/LearnPass');
const logger = require('../utils/logger');

// Get all LearnPasses
router.get('/', asyncHandler(async (req, res) => {
  const learnPasses = await LearnPass.find().populate('userId', 'firstName lastName email');
  res.json({ success: true, data: { learnPasses } });
}));

// Get LearnPass by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const learnPass = await LearnPass.findById(req.params.id).populate('userId', 'firstName lastName email');
  if (!learnPass) {
    throw new AppError('LearnPass not found', 404);
  }
  res.json({ success: true, data: { learnPass } });
}));

// Create LearnPass
router.post('/',
  authenticateToken,
  validate(schemas.learnPassCreate),
  asyncHandler(async (req, res) => {
    const learnPass = await LearnPass.create(req.body);
    res.status(201).json({ success: true, data: { learnPass } });
  })
);

// Update LearnPass
router.put('/:id',
  authenticateToken,
  validate(schemas.learnPassUpdate),
  asyncHandler(async (req, res) => {
    const learnPass = await LearnPass.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!learnPass) {
      throw new AppError('LearnPass not found', 404);
    }
    res.json({ success: true, data: { learnPass } });
  })
);

// Delete LearnPass
router.delete('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const learnPass = await LearnPass.findByIdAndDelete(req.params.id);
    if (!learnPass) {
      throw new AppError('LearnPass not found', 404);
    }
    res.json({ success: true, message: 'LearnPass deleted successfully' });
  })
);

module.exports = router;
