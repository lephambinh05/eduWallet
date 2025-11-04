const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');
const Certificate = require('../models/Certificate');
const logger = require('../utils/logger');

// Get all certificates
router.get('/', asyncHandler(async (req, res) => {
  const certificates = await Certificate.find()
    .populate('userId', 'firstName lastName email')
    .populate('institutionId', 'name institutionId type');
  res.json({ success: true, data: { certificates } });
}));

// Get certificate by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id)
    .populate('userId', 'firstName lastName email')
    .populate('institutionId', 'name institutionId type');
  if (!certificate) {
    throw new AppError('Certificate not found', 404);
  }
  res.json({ success: true, data: { certificate } });
}));

// Create certificate
router.post('/',
  authenticateToken,
  validate(schemas.certificateCreate),
  asyncHandler(async (req, res) => {
    const certificate = await Certificate.create(req.body);
    res.status(201).json({ success: true, data: { certificate } });
  })
);

// Update certificate
router.put('/:id',
  authenticateToken,
  validate(schemas.certificateUpdate),
  asyncHandler(async (req, res) => {
    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!certificate) {
      throw new AppError('Certificate not found', 404);
    }
    res.json({ success: true, data: { certificate } });
  })
);

// Delete certificate
router.delete('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const certificate = await Certificate.findByIdAndDelete(req.params.id);
    if (!certificate) {
      throw new AppError('Certificate not found', 404);
    }
    res.json({ success: true, message: 'Certificate deleted successfully' });
  })
);

module.exports = router;
