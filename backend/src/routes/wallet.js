const express = require("express");
const router = express.Router();
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const { authenticateToken } = require("../middleware/auth");
const User = require("../models/User");

/**
 * @swagger
 * /api/wallet/save:
 *   post:
 *     summary: Save wallet connection to database (idempotent)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: string
 *               chainId:
 *                 type: number
 *               network:
 *                 type: string
 *     responses:
 *       200:
 *         description: Wallet saved successfully
 */
router.post(
  "/save",
  authenticateToken,
  asyncHandler(async (req, res) => {
    console.log("🔍 Wallet save request:", {
      body: req.body,
      user: req.user ? { id: req.user._id, email: req.user.email } : null,
    });

    const { address, chainId, network } = req.body;

    if (!address) {
      console.log("❌ Missing wallet address");
      throw new AppError("Wallet address is required", 400);
    }

    console.log("🔍 Checking wallet conflict for address:", address);

    // Check if wallet is already connected to another user
    const existingUser = await User.findOne({ walletAddress: address });
    if (
      existingUser &&
      existingUser._id.toString() !== req.user._id.toString()
    ) {
      console.log("❌ Wallet conflict detected:", {
        existingUser: existingUser._id,
        currentUser: req.user._id,
      });
      throw new AppError(
        "Wallet address is already connected to another account",
        400
      );
    }

    console.log("✅ No wallet conflict, proceeding with save");

    // Update user with wallet info
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        walletAddress: address,
        $set: {
          "walletInfo.chainId": chainId,
          "walletInfo.networkName": network,
          "walletInfo.isConnected": true,
          "walletInfo.connectedAt": new Date(),
        },
      },
      { new: true }
    ).select(
      "-password -twoFactorSecret -passwordResetToken -emailVerificationToken"
    );

    console.log("✅ Wallet saved successfully for user:", req.user._id);

    res.json({
      success: true,
      message: "Wallet saved successfully",
      data: { user },
    });
  })
);

/**
 * @swagger
 * /api/wallet/delete:
 *   post:
 *     summary: Delete wallet connection from database
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Wallet deleted successfully
 */
router.post(
  "/delete",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { address } = req.body;

    // Verify wallet belongs to current user
    if (req.user.walletAddress !== address) {
      throw new AppError(
        "Cannot delete wallet that doesn't belong to you",
        403
      );
    }

    // Remove wallet from user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          walletAddress: 1,
          walletInfo: 1,
        },
      },
      { new: true }
    ).select(
      "-password -twoFactorSecret -passwordResetToken -emailVerificationToken"
    );

    res.json({
      success: true,
      message: "Wallet deleted successfully",
      data: { user },
    });
  })
);

/**
 * @swagger
 * /api/wallet/check:
 *   post:
 *     summary: Check if wallet exists in database
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Wallet check result
 */
router.post(
  "/check",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { address } = req.body;

    if (!address) {
      throw new AppError("Wallet address is required", 400);
    }

    // Find user with this wallet
    const user = await User.findOne({ walletAddress: address }).select(
      "-password -twoFactorSecret -passwordResetToken -emailVerificationToken"
    );

    if (!user) {
      return res.json({
        success: true,
        data: {
          exists: false,
          wallet: null,
        },
      });
    }

    // Check if wallet belongs to current user
    const belongsToCurrentUser =
      user._id.toString() === req.user._id.toString();

    res.json({
      success: true,
      data: {
        exists: true,
        belongsToCurrentUser,
        wallet: {
          address: user.walletAddress,
          connected: user.walletInfo?.isConnected || true,
          network: user.walletInfo?.networkName,
          chainId: user.walletInfo?.chainId,
          connectedAt: user.walletInfo?.connectedAt,
        },
      },
    });
  })
);

/**
 * @swagger
 * /api/wallet/user:
 *   get:
 *     summary: Get current user's wallets
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User wallets retrieved successfully
 */
router.get(
  "/user",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select(
      "walletAddress walletInfo"
    );

    const wallets = [];
    if (user.walletAddress) {
      wallets.push({
        address: user.walletAddress,
        connected: user.walletInfo?.isConnected || true,
        network: user.walletInfo?.networkName,
        chainId: user.walletInfo?.chainId,
        connectedAt: user.walletInfo?.connectedAt,
      });
    }

    res.json({
      success: true,
      data: { wallets },
    });
  })
);

module.exports = router;
