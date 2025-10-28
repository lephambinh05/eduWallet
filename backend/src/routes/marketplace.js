const express = require("express");
const router = express.Router();
const { validate, schemas } = require("../middleware/validation");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const { authenticateToken, authorize } = require("../middleware/auth");
const MarketplaceItem = require("../models/MarketplaceItem");
const logger = require("../utils/logger");
const Purchase = require("../models/Purchase");

// Get all marketplace items
router.get(
  "/items",
  asyncHandler(async (req, res) => {
    const items = await MarketplaceItem.find({ isActive: true });
    res.json({ success: true, data: { items } });
  })
);

// Get marketplace item by ID
router.get(
  "/items/:id",
  asyncHandler(async (req, res) => {
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) {
      throw new AppError("Marketplace item not found", 404);
    }
    res.json({ success: true, data: { item } });
  })
);

// Create marketplace item (Admin only)
router.post(
  "/items",
  authenticateToken,
  authorize("admin", "super_admin"),
  validate(schemas.marketplaceItemCreate),
  asyncHandler(async (req, res) => {
    const item = await MarketplaceItem.create(req.body);
    res.status(201).json({ success: true, data: { item } });
  })
);

// Update marketplace item
router.put(
  "/items/:id",
  authenticateToken,
  authorize("admin", "super_admin"),
  validate(schemas.marketplaceItemUpdate),
  asyncHandler(async (req, res) => {
    const item = await MarketplaceItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) {
      throw new AppError("Marketplace item not found", 404);
    }
    res.json({ success: true, data: { item } });
  })
);

// Delete marketplace item (Admin only)
router.delete(
  "/items/:id",
  authenticateToken,
  authorize("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const item = await MarketplaceItem.findByIdAndDelete(req.params.id);
    if (!item) {
      throw new AppError("Marketplace item not found", 404);
    }
    res.json({
      success: true,
      message: "Marketplace item deleted successfully",
    });
  })
);

// Purchase item
router.post(
  "/items/:id/purchase",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) {
      throw new AppError("Marketplace item not found", 404);
    }

    if (item.stock <= 0) {
      throw new AppError("Item out of stock", 400);
    }

    // For now we persist a Purchase record server-side to allow revenue reporting.
    const quantity =
      Number(req.body.quantity) > 0 ? Number(req.body.quantity) : 1;
    const price = Number(item.price) || 0;
    const total = price * quantity;

    const purchase = await Purchase.create({
      itemId: item._id,
      buyer: req.user._id,
      seller: item.createdBy,
      price,
      quantity,
      total,
      metadata: req.body.metadata || {},
    });

    logger.info("Purchase recorded", {
      purchaseId: purchase._id,
      itemId: item._id,
      seller: item.createdBy,
      buyer: req.user._id,
      total,
    });

    // decrement stock
    item.stock = Math.max(0, item.stock - quantity);
    await item.save();

    // Create Enrollment so the buyer gains access to the purchased course
    try {
      const Enrollment = require("../models/Enrollment");
      const frontendBase = process.env.FRONTEND_URL || "";
      const accessLink = frontendBase
        ? `${frontendBase}/marketplace/items/${item._id}`
        : null;

      await Enrollment.create({
        user: req.user._id,
        itemId: item._id,
        purchase: purchase._id,
        seller: item.createdBy,
        courseTitle: item.name,
        accessLink,
        // initialize progress
        progressPercent: 0,
        totalPoints: 0,
        timeSpentSeconds: 0,
        status: "in_progress",
        metadata: {},
      });
    } catch (err) {
      // Non-fatal: log and continue
      logger.error("Failed to create enrollment for purchase", {
        err: err.message,
        itemId: item._id,
        purchaseId: purchase._id,
      });
    }

    // TODO: enqueue blockchain purchase flow / token transfer

    res.json({
      success: true,
      message: "Item purchased successfully",
      data: { purchase },
    });
  })
);

module.exports = router;
