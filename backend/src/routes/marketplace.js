const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken, authorize } = require('../middleware/auth');
const MarketplaceItem = require('../models/MarketplaceItem');
const logger = require('../utils/logger');

// Get all marketplace items
router.get('/items', asyncHandler(async (req, res) => {
  const items = await MarketplaceItem.find({ isActive: true });
  res.json({ success: true, data: { items } });
}));

// Get marketplace item by ID
router.get('/items/:id', asyncHandler(async (req, res) => {
  const item = await MarketplaceItem.findById(req.params.id);
  if (!item) {
    throw new AppError('Marketplace item not found', 404);
  }
  res.json({ success: true, data: { item } });
}));

// Create marketplace item (Admin only)
router.post('/items',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validate(schemas.marketplaceItemCreate),
  asyncHandler(async (req, res) => {
    const item = await MarketplaceItem.create(req.body);
    res.status(201).json({ success: true, data: { item } });
  })
);

// Update marketplace item
router.put('/items/:id',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validate(schemas.marketplaceItemUpdate),
  asyncHandler(async (req, res) => {
    const item = await MarketplaceItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) {
      throw new AppError('Marketplace item not found', 404);
    }
    res.json({ success: true, data: { item } });
  })
);

// Delete marketplace item (Admin only)
router.delete('/items/:id',
  authenticateToken,
  authorize('admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const item = await MarketplaceItem.findByIdAndDelete(req.params.id);
    if (!item) {
      throw new AppError('Marketplace item not found', 404);
    }
    res.json({ success: true, message: 'Marketplace item deleted successfully' });
  })
);

// Purchase item
router.post('/items/:id/purchase',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) {
      throw new AppError('Marketplace item not found', 404);
    }
    
    if (item.stock <= 0) {
      throw new AppError('Item out of stock', 400);
    }

    // TODO: Implement purchase logic with blockchain
    item.stock -= 1;
    await item.save();

    res.json({ success: true, message: 'Item purchased successfully' });
  })
);

module.exports = router;
