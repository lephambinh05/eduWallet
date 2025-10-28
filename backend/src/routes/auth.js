const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const router = express.Router();
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { generateToken, generateRefreshToken, verifyRefreshToken, authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - dateOfBirth
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, institution, admin]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post('/register',
  validate(schemas.userRegistration),
  asyncHandler(async (req, res) => {
    const { username, email, password, firstName, lastName, dateOfBirth, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      throw new AppError('User with this email or username already exists', 409);
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      phone,
      role: role || 'student'
    });

    // Generate tokens
    const token = generateToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Remove password from response
    user.password = undefined;

    logger.logUserAction(user._id, 'user_registered', { email, role });

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(email, {
        firstName,
        lastName,
        username,
        email
      });
      console.log(`✅ Welcome email sent to ${email}`);
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
        refreshToken
      }
    });
  })
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login',
  validate(schemas.userLogin),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    // Generate tokens
    const token = generateToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Remove password from response
    user.password = undefined;

    logger.logUserAction(user._id, 'user_logged_in', { email });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
        refreshToken
      }
    });
  })
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 401);
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', 401);
      }

      // Generate new tokens
      const newToken = generateToken({ id: user._id });
      const newRefreshToken = generateRefreshToken({ id: user._id });

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newToken,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  })
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout',
  authenticateToken,
  asyncHandler(async (req, res) => {
    logger.logUserAction(req.user._id, 'user_logged_out', {});

    res.json({
      success: true,
      message: 'Logout successful'
    });
  })
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
      .populate('institutionId', 'name institutionId type');

    res.json({
      success: true,
      data: { user }
    });
  })
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 */
router.post('/forgot-password',
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset token
    logger.logUserAction(user._id, 'password_reset_requested', { email });

    res.json({
      success: true,
      message: 'Password reset email sent',
      // In development, return the token for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  })
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password',
  asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    // Hash the token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Invalid or expired token', 400);
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    logger.logUserAction(user._id, 'password_reset_completed', {});

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  })
);

module.exports = router;