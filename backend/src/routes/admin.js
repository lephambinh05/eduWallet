const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Institution = require('../models/Institution');
const LearnPass = require('../models/LearnPass');
const Certificate = require('../models/Certificate');
const logger = require('../utils/logger');

// Get dashboard stats
router.get('/dashboard',
  authenticateToken,
  authorize('admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalInstitutions: await Institution.countDocuments(),
      totalLearnPasses: await LearnPass.countDocuments(),
      totalCertificates: await Certificate.countDocuments(),
      activeUsers: await User.countDocuments({ isActive: true }),
      verifiedInstitutions: await Institution.countDocuments({ isVerified: true })
    };
    
    res.json({ success: true, data: { stats } });
  })
);

// Get all users (Admin only)
router.get('/users',
  authenticateToken,
  authorize('admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, role, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
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

// Update user role
router.put('/users/:id/role',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validate(schemas.adminUpdateUserRole),
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    logger.logUserAction(req.user._id, 'user_role_updated', { 
      targetUserId: req.params.id, 
      newRole: req.body.role 
    });

    res.json({ success: true, data: { user } });
  })
);

// Block user
router.post('/users/:id/block',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validate(schemas.adminBlockUser),
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: false,
        blockedReason: req.body.reason,
        blockedAt: new Date(),
        blockedBy: req.user._id
      },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    logger.logUserAction(req.user._id, 'user_blocked', { 
      targetUserId: req.params.id, 
      reason: req.body.reason 
    });

    res.json({ success: true, data: { user } });
  })
);

// Unblock user
router.post('/users/:id/unblock',
  authenticateToken,
  authorize('admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: true,
        $unset: { blockedReason: 1, blockedAt: 1, blockedBy: 1 }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    logger.logUserAction(req.user._id, 'user_unblocked', { 
      targetUserId: req.params.id 
    });

    res.json({ success: true, data: { user } });
  })
);

// Get all institutions (Admin only)
router.get('/institutions',
  authenticateToken,
  authorize('admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const institutions = await Institution.find()
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: { institutions } });
  })
);

// Approve institution
router.post('/institutions/:id/approve',
  authenticateToken,
  authorize('admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, verifiedAt: new Date(), verifiedBy: req.user._id },
      { new: true }
    );

    if (!institution) {
      throw new AppError('Institution not found', 404);
    }

    logger.logUserAction(req.user._id, 'institution_approved', { 
      institutionId: req.params.id 
    });

    res.json({ success: true, data: { institution } });
  })
);

// Reject institution
router.post('/institutions/:id/reject',
  authenticateToken,
  authorize('admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      { isVerified: false, rejectedAt: new Date(), rejectedBy: req.user._id },
      { new: true }
    );

    if (!institution) {
      throw new AppError('Institution not found', 404);
    }

    logger.logUserAction(req.user._id, 'institution_rejected', { 
      institutionId: req.params.id 
    });

    res.json({ success: true, data: { institution } });
  })
);

// Get system logs
router.get('/logs',
  authenticateToken,
  authorize('admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    // TODO: Implement log retrieval
    res.json({ success: true, data: { logs: [] } });
  })
);

// Get system health
router.get('/health',
  authenticateToken,
  authorize('admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    };
    
    res.json({ success: true, data: { health } });
  })
);

module.exports = router;
