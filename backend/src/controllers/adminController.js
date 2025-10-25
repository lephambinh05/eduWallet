const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Admin
 */
exports.getDashboardStats = async (req, res) => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    inactiveUsers,
    newUsersThisMonth,
    newUsersThisWeek,
    studentCount,
    adminCount,
    institutionCount,
    emailVerifiedCount
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: false }),
    User.countDocuments({ createdAt: { $gte: lastMonth } }),
    User.countDocuments({ createdAt: { $gte: lastWeek } }),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: { $in: ['admin', 'super_admin'] } }),
    User.countDocuments({ role: 'institution' }),
    User.countDocuments({ isEmailVerified: true })
  ]);

  // Get recent users
  const recentUsers = await User.find()
    .select('username email firstName lastName role createdAt avatar')
    .sort({ createdAt: -1 })
    .limit(5);

  const stats = {
    overview: {
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsersThisMonth,
      newUsersThisWeek,
      emailVerifiedCount
    },
    usersByRole: {
      students: studentCount,
      admins: adminCount,
      institutions: institutionCount
    },
    recentUsers
  };

  res.json({
    success: true,
    data: { stats }
  });
};

/**
 * @desc    Get all users with pagination, search, and filters
 * @route   GET /api/admin/users
 * @access  Admin
 */
exports.getAllUsers = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    role,
    status,
    search,
    sortBy = 'createdAt',
    order = 'desc',
    isEmailVerified
  } = req.query;

  // Build query
  const query = {};

  if (role) {
    query.role = role;
  }

  if (status === 'active') {
    query.isActive = true;
  } else if (status === 'inactive') {
    query.isActive = false;
  } else if (status === 'blocked') {
    query.isBlocked = true;
  }

  if (isEmailVerified !== undefined) {
    query.isEmailVerified = isEmailVerified;
  }

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort
  const sortOrder = order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  // Execute query
  const skip = (page - 1) * limit;
  
  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -passwordResetToken -emailVerificationToken -twoFactorSecret')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    }
  });
};

/**
 * @desc    Get single user by ID
 * @route   GET /api/admin/users/:id
 * @access  Admin
 */
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -passwordResetToken -emailVerificationToken -twoFactorSecret');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: { user }
  });
};

/**
 * @desc    Create new user
 * @route   POST /api/admin/users
 * @access  Admin
 */
exports.createUser = async (req, res) => {
  const {
    username,
    email,
    password,
    firstName,
    lastName,
    dateOfBirth,
    phone,
    role,
    isActive,
    isEmailVerified
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    throw new AppError('User with this email or username already exists', 409);
  }

  // Create user
  const user = new User({
    username,
    email,
    password,
    firstName,
    lastName,
    dateOfBirth,
    phone,
    role: role || 'student',
    isActive: isActive !== undefined ? isActive : true,
    isEmailVerified: isEmailVerified || false
  });

  await user.save();

  // Log action
  await logger.logUserAction(req.user._id, 'user_created', {
    targetUserId: user._id,
    targetUserEmail: user.email,
    role: user.role
  });

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: { user: userResponse }
  });
};

/**
 * @desc    Update user
 * @route   PUT /api/admin/users/:id
 * @access  Admin
 */
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  // Don't allow password update through this endpoint
  delete updateData.password;

  // Check if trying to update email or username to existing value
  if (updateData.email || updateData.username) {
    const existingUser = await User.findOne({
      _id: { $ne: id },
      $or: [
        ...(updateData.email ? [{ email: updateData.email }] : []),
        ...(updateData.username ? [{ username: updateData.username }] : [])
      ]
    });

    if (existingUser) {
      throw new AppError('Email or username already exists', 409);
    }
  }

  // Prevent admin from demoting themselves
  if (updateData.role && id === req.user._id.toString()) {
    if (req.user.role === 'super_admin' && updateData.role !== 'super_admin') {
      throw new AppError('Cannot demote yourself', 403);
    }
    if (req.user.role === 'admin' && !['admin', 'super_admin'].includes(updateData.role)) {
      throw new AppError('Cannot demote yourself', 403);
    }
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-password -passwordResetToken -emailVerificationToken -twoFactorSecret');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Log action
  await logger.logUserAction(req.user._id, 'user_updated', {
    targetUserId: user._id,
    targetUserEmail: user.email,
    updates: Object.keys(updateData)
  });

  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user }
  });
};

/**
 * @desc    Delete user (soft delete)
 * @route   DELETE /api/admin/users/:id
 * @access  Admin
 */
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (id === req.user._id.toString()) {
    throw new AppError('Cannot delete your own account', 403);
  }

  const user = await User.findById(id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Soft delete - just deactivate
  user.isActive = false;
  user.deletedAt = new Date();
  user.deletedBy = req.user._id;
  await user.save();

  // Log action
  await logger.logUserAction(req.user._id, 'user_deleted', {
    targetUserId: user._id,
    targetUserEmail: user.email
  });

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
};

/**
 * @desc    Update user role
 * @route   PATCH /api/admin/users/:id/role
 * @access  Admin
 */
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Prevent admin from changing their own role
  if (id === req.user._id.toString()) {
    throw new AppError('Cannot change your own role', 403);
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Log action
  await logger.logUserAction(req.user._id, 'user_role_updated', {
    targetUserId: user._id,
    targetUserEmail: user.email,
    newRole: role
  });

  res.json({
    success: true,
    message: 'User role updated successfully',
    data: { user }
  });
};

/**
 * @desc    Update user status (active/inactive)
 * @route   PATCH /api/admin/users/:id/status
 * @access  Admin
 */
exports.updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive, reason } = req.body;

  // Prevent admin from deactivating themselves
  if (id === req.user._id.toString()) {
    throw new AppError('Cannot change your own status', 403);
  }

  const updateData = { isActive };
  
  if (!isActive && reason) {
    updateData.deactivationReason = reason;
    updateData.deactivatedAt = new Date();
    updateData.deactivatedBy = req.user._id;
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  ).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Log action
  await logger.logUserAction(req.user._id, 'user_status_updated', {
    targetUserId: user._id,
    targetUserEmail: user.email,
    newStatus: isActive ? 'active' : 'inactive',
    reason
  });

  res.json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: { user }
  });
};

/**
 * @desc    Block user
 * @route   POST /api/admin/users/:id/block
 * @access  Admin
 */
exports.blockUser = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  // Prevent admin from blocking themselves
  if (id === req.user._id.toString()) {
    throw new AppError('Cannot block your own account', 403);
  }

  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: true,
      isActive: false,
      blockedReason: reason,
      blockedAt: new Date(),
      blockedBy: req.user._id
    },
    { new: true }
  ).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Log action
  await logger.logUserAction(req.user._id, 'user_blocked', {
    targetUserId: user._id,
    targetUserEmail: user.email,
    reason
  });

  res.json({
    success: true,
    message: 'User blocked successfully',
    data: { user }
  });
};

/**
 * @desc    Unblock user
 * @route   POST /api/admin/users/:id/unblock
 * @access  Admin
 */
exports.unblockUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: false,
      isActive: true,
      $unset: { blockedReason: 1, blockedAt: 1, blockedBy: 1 }
    },
    { new: true }
  ).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Log action
  await logger.logUserAction(req.user._id, 'user_unblocked', {
    targetUserId: user._id,
    targetUserEmail: user.email
  });

  res.json({
    success: true,
    message: 'User unblocked successfully',
    data: { user }
  });
};

/**
 * @desc    Get user activities/logs
 * @route   GET /api/admin/users/:id/activities
 * @access  Admin
 */
exports.getUserActivities = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;

  // Verify user exists
  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get activities from logger
  const activities = await logger.getUserActivities(id, {
    page: parseInt(page),
    limit: parseInt(limit)
  });

  res.json({
    success: true,
    data: activities
  });
};

/**
 * @desc    Get system activities
 * @route   GET /api/admin/activities
 * @access  Admin
 */
exports.getSystemActivities = async (req, res) => {
  const { page = 1, limit = 50, actionType, userId } = req.query;

  const activities = await logger.getActivities({
    page: parseInt(page),
    limit: parseInt(limit),
    actionType,
    userId
  });

  res.json({
    success: true,
    data: activities
  });
};

/**
 * @desc    Bulk delete users
 * @route   POST /api/admin/users/bulk-delete
 * @access  Admin
 */
exports.bulkDeleteUsers = async (req, res) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new AppError('Please provide an array of user IDs', 400);
  }

  // Prevent admin from deleting themselves
  if (userIds.includes(req.user._id.toString())) {
    throw new AppError('Cannot delete your own account', 403);
  }

  const result = await User.updateMany(
    { _id: { $in: userIds } },
    {
      isActive: false,
      deletedAt: new Date(),
      deletedBy: req.user._id
    }
  );

  // Log action
  await logger.logUserAction(req.user._id, 'users_bulk_deleted', {
    count: result.modifiedCount,
    userIds
  });

  res.json({
    success: true,
    message: `${result.modifiedCount} users deleted successfully`,
    data: { deletedCount: result.modifiedCount }
  });
};

/**
 * @desc    Bulk update user role
 * @route   POST /api/admin/users/bulk-update-role
 * @access  Admin
 */
exports.bulkUpdateRole = async (req, res) => {
  const { userIds, role } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new AppError('Please provide an array of user IDs', 400);
  }

  if (!role) {
    throw new AppError('Please provide a role', 400);
  }

  // Prevent admin from changing their own role
  if (userIds.includes(req.user._id.toString())) {
    throw new AppError('Cannot change your own role', 403);
  }

  const result = await User.updateMany(
    { _id: { $in: userIds } },
    { role }
  );

  // Log action
  await logger.logUserAction(req.user._id, 'users_bulk_role_updated', {
    count: result.modifiedCount,
    userIds,
    newRole: role
  });

  res.json({
    success: true,
    message: `${result.modifiedCount} users updated successfully`,
    data: { updatedCount: result.modifiedCount }
  });
};

/**
 * @desc    Export users to CSV
 * @route   GET /api/admin/users/export
 * @access  Admin
 */
exports.exportUsers = async (req, res) => {
  const { role, status } = req.query;

  const query = {};
  if (role) query.role = role;
  if (status === 'active') query.isActive = true;
  if (status === 'inactive') query.isActive = false;

  const users = await User.find(query)
    .select('username email firstName lastName role isActive createdAt')
    .lean();

  // Convert to CSV
  const csv = [
    ['Username', 'Email', 'First Name', 'Last Name', 'Role', 'Status', 'Created At'].join(','),
    ...users.map(user => [
      user.username,
      user.email,
      user.firstName,
      user.lastName,
      user.role,
      user.isActive ? 'Active' : 'Inactive',
      new Date(user.createdAt).toISOString()
    ].join(','))
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
  res.send(csv);
};
