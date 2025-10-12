const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const institutionRoutes = require('./institutions');
const learnPassRoutes = require('./learnpass');
const certificateRoutes = require('./certificates');
const marketplaceRoutes = require('./marketplace');
const blockchainRoutes = require('./blockchain');
const adminRoutes = require('./admin');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EduWallet Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/institutions', institutionRoutes);
router.use('/learnpass', learnPassRoutes);
router.use('/certificates', certificateRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/blockchain', blockchainRoutes);
router.use('/admin', adminRoutes);

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});

module.exports = router;
