const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken, checkOwnership } = require('../middleware/auth');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, institution, admin, super_admin]
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         description: Insufficient permissions
 */
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, role, search } = req.query;
    const query = {};

    // Only admin can see all users
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      throw new AppError('Insufficient permissions', 403);
    }

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -twoFactorSecret -passwordResetToken -emailVerificationToken')
      .populate('institutionId', 'name institutionId type')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  })
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Access denied
 */
router.get('/:id',
  authenticateToken,
  checkOwnership('id'),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
      .select('-password -twoFactorSecret -passwordResetToken -emailVerificationToken')
      .populate('institutionId', 'name institutionId type');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: { user }
    });
  })
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               preferences:
 *                 type: object
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Access denied
 */
router.put('/:id',
  authenticateToken,
  checkOwnership('id'),
  validate(schemas.userUpdate),
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password -twoFactorSecret -passwordResetToken -emailVerificationToken');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    logger.logUserAction(req.user._id, 'user_updated', { targetUserId: req.params.id });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  })
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Insufficient permissions
 */
router.delete('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    // Only admin can delete users
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      throw new AppError('Insufficient permissions', 403);
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    logger.logUserAction(req.user._id, 'user_deleted', { targetUserId: req.params.id });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  })
);

/**
 * @swagger
 * /api/users/wallet:
 *   post:
 *     summary: Connect wallet to user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *             properties:
 *               walletAddress:
 *                 type: string
 *     responses:
 *       200:
 *         description: Wallet connected successfully
 *       400:
 *         description: Invalid wallet address
 */
router.post('/wallet',
  authenticateToken,
  validate(schemas.walletAddress),
  asyncHandler(async (req, res) => {
    const { walletAddress } = req.body;

    // Check if wallet is already connected to another user
    const existingUser = await User.findOne({ walletAddress });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      throw new AppError('Wallet address is already connected to another account', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { walletAddress },
      { new: true, runValidators: true }
    ).select('-password -twoFactorSecret -passwordResetToken -emailVerificationToken');

    logger.logUserAction(req.user._id, 'wallet_connected', { walletAddress });

    res.json({
      success: true,
      message: 'Wallet connected successfully',
      data: { user }
    });
  })
);

/**
 * @swagger
 * /api/users/wallet:
 *   delete:
 *     summary: Disconnect wallet from user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet disconnected successfully
 */
router.delete('/wallet',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { walletAddress: 1 } },
      { new: true }
    ).select('-password -twoFactorSecret -passwordResetToken -emailVerificationToken');

    logger.logUserAction(req.user._id, 'wallet_disconnected', {});

    res.json({
      success: true,
      message: 'Wallet disconnected successfully',
      data: { user }
    });
  })
);

module.exports = router;
