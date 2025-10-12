const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken, authorize } = require('../middleware/auth');
const Institution = require('../models/Institution');
const logger = require('../utils/logger');

// Get all institutions
router.get('/', asyncHandler(async (req, res) => {
  const institutions = await Institution.find({ isActive: true });
  res.json({ success: true, data: { institutions } });
}));

// Get institution by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const institution = await Institution.findById(req.params.id);
  if (!institution) {
    throw new AppError('Institution not found', 404);
  }
  res.json({ success: true, data: { institution } });
}));

// Create institution (Admin only)
router.post('/',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validate(schemas.institutionRegistration),
  asyncHandler(async (req, res) => {
    const institution = await Institution.create(req.body);
    res.status(201).json({ success: true, data: { institution } });
  })
);

// Update institution
router.put('/:id',
  authenticateToken,
  validate(schemas.institutionUpdate),
  asyncHandler(async (req, res) => {
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!institution) {
      throw new AppError('Institution not found', 404);
    }
    res.json({ success: true, data: { institution } });
  })
);

// Delete institution (Admin only)
router.delete('/:id',
  authenticateToken,
  authorize('admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const institution = await Institution.findByIdAndDelete(req.params.id);
    if (!institution) {
      throw new AppError('Institution not found', 404);
    }
    res.json({ success: true, message: 'Institution deleted successfully' });
  })
);

module.exports = router;
