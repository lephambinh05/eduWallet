const express = require('express');
const router = express.Router();
const { validate, validateQuery, validateParams, schemas } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// ==================== Dashboard ====================
router.get('/dashboard',
  authenticateToken,
  authorize('admin', 'super_admin'),
  asyncHandler(adminController.getDashboardStats)
);

// ==================== User Management ====================

// Get all users with filters
router.get('/users',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validateQuery(schemas.adminUsersQuery),
  asyncHandler(adminController.getAllUsers)
);

// Export users to CSV
router.get('/users/export',
  authenticateToken,
  authorize('admin', 'super_admin'),
  asyncHandler(adminController.exportUsers)
);

// Create new user
router.post('/users',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validate(schemas.adminCreateUser),
  asyncHandler(adminController.createUser)
);

// Bulk operations
router.post('/users/bulk-delete',
  authenticateToken,
  authorize('admin', 'super_admin'),
  asyncHandler(adminController.bulkDeleteUsers)
);

router.post('/users/bulk-update-role',
  authenticateToken,
  authorize('admin', 'super_admin'),
  asyncHandler(adminController.bulkUpdateRole)
);

// Get single user
router.get('/users/:id',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validateParams(schemas.objectId),
  asyncHandler(adminController.getUserById)
);

// Update user
router.put('/users/:id',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validateParams(schemas.objectId),
  validate(schemas.adminUpdateUser),
  asyncHandler(adminController.updateUser)
);

// Delete user
router.delete('/users/:id',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validateParams(schemas.objectId),
  asyncHandler(adminController.deleteUser)
);

// Update user role
router.patch('/users/:id/role',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validateParams(schemas.objectId),
  validate(schemas.adminUpdateUserRole),
  asyncHandler(adminController.updateUserRole)
);

// Update user status
router.patch('/users/:id/status',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validateParams(schemas.objectId),
  validate(schemas.adminUpdateUserStatus),
  asyncHandler(adminController.updateUserStatus)
);

// Block user
router.post('/users/:id/block',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validateParams(schemas.objectId),
  validate(schemas.adminBlockUser),
  asyncHandler(adminController.blockUser)
);

// Unblock user
router.post('/users/:id/unblock',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validateParams(schemas.objectId),
  asyncHandler(adminController.unblockUser)
);

// Get user activities
router.get('/users/:id/activities',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validateParams(schemas.objectId),
  asyncHandler(adminController.getUserActivities)
);

// ==================== Activity Logs ====================
router.get('/activities',
  authenticateToken,
  authorize('admin', 'super_admin'),
  asyncHandler(adminController.getSystemActivities)
);

// ==================== Institutions Management ====================
router.get('/institutions',
  authenticateToken,
  authorize('admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const Institution = require('../models/Institution');
    const institutions = await Institution.find()
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: { institutions } });
  })
);

router.post('/institutions/:id/approve',
  authenticateToken,
  authorize('admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const Institution = require('../models/Institution');
    const { AppError } = require('../middleware/errorHandler');
    const logger = require('../utils/logger');
    
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, verifiedAt: new Date(), verifiedBy: req.user._id },
      { new: true }
    );

    if (!institution) {
      throw new AppError('Institution not found', 404);
    }

    await logger.logUserAction(req.user._id, 'institution_approved', { 
      institutionId: req.params.id 
    });

    res.json({ success: true, data: { institution } });
  })
);

router.post('/institutions/:id/reject',
  authenticateToken,
  authorize('admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const Institution = require('../models/Institution');
    const { AppError } = require('../middleware/errorHandler');
    const logger = require('../utils/logger');
    
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      { isVerified: false, rejectedAt: new Date(), rejectedBy: req.user._id },
      { new: true }
    );

    if (!institution) {
      throw new AppError('Institution not found', 404);
    }

    await logger.logUserAction(req.user._id, 'institution_rejected', { 
      institutionId: req.params.id 
    });

    res.json({ success: true, data: { institution } });
  })
);

// ==================== Certificate Management ====================

// Get all certificates with filters
router.get('/certificates',
  authenticateToken,
  authorize('admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const Certificate = require('../models/Certificate');
    const { page = 1, limit = 12, search, status, institution, fromDate, toDate } = req.query;
    
    const query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { courseName: { $regex: search, $options: 'i' } },
        { certificateId: { $regex: search, $options: 'i' } },
        { issuerName: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Institution filter
    if (institution) {
      query.issuer = institution;
    }
    
    // Date range filter
    if (fromDate || toDate) {
      query.issueDate = {};
      if (fromDate) query.issueDate.$gte = new Date(fromDate);
      if (toDate) query.issueDate.$lte = new Date(toDate);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [certificates, total] = await Promise.all([
      Certificate.find(query)
        .populate('student', 'firstName lastName email walletAddress studentId')
        .populate('issuer', 'name logo institutionId')
        .sort({ issueDate: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      Certificate.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: {
        certificates,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  })
);

// Get certificate by ID
router.get('/certificates/:id',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validateParams(schemas.objectId),
  asyncHandler(async (req, res) => {
    const Certificate = require('../models/Certificate');
    const { AppError } = require('../middleware/errorHandler');
    
    const certificate = await Certificate.findById(req.params.id)
      .populate('student', 'firstName lastName email walletAddress studentId')
      .populate('issuer', 'name logo website institutionId');
    
    if (!certificate) {
      throw new AppError('Certificate not found', 404);
    }
    
    res.json({ success: true, data: { certificate } });
  })
);

// Verify certificate
router.post('/certificates/:id/verify',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validateParams(schemas.objectId),
  asyncHandler(async (req, res) => {
    const Certificate = require('../models/Certificate');
    const ActivityLog = require('../models/ActivityLog');
    const { AppError } = require('../middleware/errorHandler');
    
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      throw new AppError('Certificate not found', 404);
    }
    
    if (certificate.status === 'verified') {
      throw new AppError('Certificate is already verified', 400);
    }
    
    certificate.status = 'verified';
    certificate.verifiedAt = new Date();
    certificate.verifiedBy = req.user._id;
    await certificate.save();
    
    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'certificate_verified',
      description: `Certificate ${certificate.certificateId} verified for student ${certificate.student}`,
      targetResource: {
        resourceType: 'Certificate',
        resourceId: certificate._id
      },
      metadata: {
        certificateId: certificate.certificateId,
        studentId: certificate.student
      }
    });
    
    res.json({
      success: true,
      message: 'Certificate verified successfully',
      data: { certificate }
    });
  })
);

// Revoke certificate
router.post('/certificates/:id/revoke',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validateParams(schemas.objectId),
  asyncHandler(async (req, res) => {
    const Certificate = require('../models/Certificate');
    const ActivityLog = require('../models/ActivityLog');
    const { AppError } = require('../middleware/errorHandler');
    const { reason } = req.body;
    
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      throw new AppError('Certificate not found', 404);
    }
    
    if (certificate.status === 'revoked') {
      throw new AppError('Certificate is already revoked', 400);
    }
    
    certificate.status = 'revoked';
    certificate.revokedAt = new Date();
    certificate.revokedBy = req.user._id;
    certificate.revocationReason = reason;
    await certificate.save();
    
    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'certificate_revoked',
      description: `Certificate ${certificate.certificateId} revoked. Reason: ${reason}`,
      targetResource: {
        resourceType: 'Certificate',
        resourceId: certificate._id
      },
      metadata: {
        certificateId: certificate.certificateId,
        studentId: certificate.student,
        reason
      }
    });
    
    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      data: { certificate }
    });
  })
);

// Get certificate activities
router.get('/certificates/:id/activities',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validateParams(schemas.objectId),
  asyncHandler(async (req, res) => {
    const ActivityLog = require('../models/ActivityLog');
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [activities, total] = await Promise.all([
      ActivityLog.find({
        targetType: 'Certificate',
        targetId: req.params.id
      })
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      ActivityLog.countDocuments({
        targetType: 'Certificate',
        targetId: req.params.id
      })
    ]);
    
    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total
        }
      }
    });
  })
);

// ==================== LearnPass Management ====================

// Get all LearnPasses with filters
router.get('/learnpasses',
  authenticateToken,
  authorize('admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const LearnPass = require('../models/LearnPass');
    const { page = 1, limit = 12, search, status, verificationStatus, institution } = req.query;
    
    const query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Verification status filter
    if (verificationStatus === 'verified') {
      query.isVerified = true;
    } else if (verificationStatus === 'unverified') {
      query.isVerified = false;
    }
    
    // Institution filter
    if (institution) {
      query.institutionId = institution;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [learnPasses, total] = await Promise.all([
      LearnPass.find(query)
        .populate('owner', 'firstName lastName email walletAddress studentId')
        .populate('institutionId', 'name logo institutionId')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      LearnPass.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: {
        learnPasses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  })
);

// Get LearnPass by ID
router.get('/learnpasses/:id',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validateParams(schemas.objectId),
  asyncHandler(async (req, res) => {
    const LearnPass = require('../models/LearnPass');
    const { AppError } = require('../middleware/errorHandler');
    
    const learnPass = await LearnPass.findById(req.params.id)
      .populate('owner', 'firstName lastName email walletAddress studentId')
      .populate('institutionId', 'name logo website institutionId');
    
    if (!learnPass) {
      throw new AppError('LearnPass not found', 404);
    }
    
    res.json({ success: true, data: { learnPass } });
  })
);

// Verify LearnPass
router.post('/learnpasses/:id/verify',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validateParams(schemas.objectId),
  asyncHandler(async (req, res) => {
    const LearnPass = require('../models/LearnPass');
    const ActivityLog = require('../models/ActivityLog');
    const { AppError } = require('../middleware/errorHandler');
    
    const learnPass = await LearnPass.findById(req.params.id);
    
    if (!learnPass) {
      throw new AppError('LearnPass not found', 404);
    }
    
    if (learnPass.isVerified) {
      throw new AppError('LearnPass is already verified', 400);
    }
    
    learnPass.isVerified = true;
    learnPass.verifiedAt = new Date();
    learnPass.verifiedBy = req.user._id;
    await learnPass.save();
    
    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'learnpass_verified',
      description: `LearnPass ${learnPass.tokenId} verified for student ${learnPass.studentId}`,
      targetResource: {
        resourceType: 'LearnPass',
        resourceId: learnPass._id
      },
      metadata: {
        tokenId: learnPass.tokenId,
        studentId: learnPass.studentId,
        ownerId: learnPass.owner
      }
    });
    
    res.json({
      success: true,
      message: 'LearnPass verified successfully',
      data: { learnPass }
    });
  })
);

// Suspend LearnPass
router.post('/learnpasses/:id/suspend',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validateParams(schemas.objectId),
  asyncHandler(async (req, res) => {
    const LearnPass = require('../models/LearnPass');
    const ActivityLog = require('../models/ActivityLog');
    const { AppError } = require('../middleware/errorHandler');
    const { reason } = req.body;
    
    const learnPass = await LearnPass.findById(req.params.id);
    
    if (!learnPass) {
      throw new AppError('LearnPass not found', 404);
    }
    
    if (learnPass.status === 'suspended') {
      throw new AppError('LearnPass is already suspended', 400);
    }
    
    learnPass.status = 'suspended';
    learnPass.suspendedAt = new Date();
    learnPass.suspendedBy = req.user._id;
    learnPass.suspensionReason = reason;
    await learnPass.save();
    
    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'learnpass_suspended',
      description: `LearnPass ${learnPass.tokenId} suspended. Reason: ${reason}`,
      targetResource: {
        resourceType: 'LearnPass',
        resourceId: learnPass._id
      },
      metadata: {
        tokenId: learnPass.tokenId,
        studentId: learnPass.studentId,
        reason
      }
    });
    
    res.json({
      success: true,
      message: 'LearnPass suspended successfully',
      data: { learnPass }
    });
  })
);

// Reactivate LearnPass
router.post('/learnpasses/:id/reactivate',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validateParams(schemas.objectId),
  asyncHandler(async (req, res) => {
    const LearnPass = require('../models/LearnPass');
    const ActivityLog = require('../models/ActivityLog');
    const { AppError } = require('../middleware/errorHandler');
    
    const learnPass = await LearnPass.findById(req.params.id);
    
    if (!learnPass) {
      throw new AppError('LearnPass not found', 404);
    }
    
    if (learnPass.status !== 'suspended') {
      throw new AppError('LearnPass is not suspended', 400);
    }
    
    learnPass.status = 'active';
    learnPass.reactivatedAt = new Date();
    learnPass.reactivatedBy = req.user._id;
    await learnPass.save();
    
    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'learnpass_reactivated',
      description: `LearnPass ${learnPass.tokenId} reactivated for student ${learnPass.studentId}`,
      targetResource: {
        resourceType: 'LearnPass',
        resourceId: learnPass._id
      },
      metadata: {
        tokenId: learnPass.tokenId,
        studentId: learnPass.studentId
      }
    });
    
    res.json({
      success: true,
      message: 'LearnPass reactivated successfully',
      data: { learnPass }
    });
  })
);

// Revoke LearnPass
router.post('/learnpasses/:id/revoke',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validateParams(schemas.objectId),
  asyncHandler(async (req, res) => {
    const LearnPass = require('../models/LearnPass');
    const ActivityLog = require('../models/ActivityLog');
    const { AppError } = require('../middleware/errorHandler');
    const { reason } = req.body;
    
    const learnPass = await LearnPass.findById(req.params.id);
    
    if (!learnPass) {
      throw new AppError('LearnPass not found', 404);
    }
    
    if (learnPass.status === 'revoked') {
      throw new AppError('LearnPass is already revoked', 400);
    }
    
    learnPass.status = 'revoked';
    learnPass.revokedAt = new Date();
    learnPass.revokedBy = req.user._id;
    learnPass.revocationReason = reason;
    await learnPass.save();
    
    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'learnpass_revoked',
      description: `LearnPass ${learnPass.tokenId} revoked. Reason: ${reason}`,
      targetResource: {
        resourceType: 'LearnPass',
        resourceId: learnPass._id
      },
      metadata: {
        tokenId: learnPass.tokenId,
        studentId: learnPass.studentId,
        reason
      }
    });
    
    res.json({
      success: true,
      message: 'LearnPass revoked successfully',
      data: { learnPass }
    });
  })
);

// Get LearnPass activities
router.get('/learnpasses/:id/activities',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validateParams(schemas.objectId),
  asyncHandler(async (req, res) => {
    const ActivityLog = require('../models/ActivityLog');
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [activities, total] = await Promise.all([
      ActivityLog.find({
        targetType: 'LearnPass',
        targetId: req.params.id
      })
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      ActivityLog.countDocuments({
        targetType: 'LearnPass',
        targetId: req.params.id
      })
    ]);
    
    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total
        }
      }
    });
  })
);

// ==================== System Management ====================
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
