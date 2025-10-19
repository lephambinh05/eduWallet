const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken, authorize } = require('../middleware/auth');
const blockchainService = require('../services/blockchainService');
const EduWalletDataStoreService = require('../services/eduWalletDataStoreService');
const logger = require('../utils/logger');

// Initialize EduWalletDataStore service
let eduWalletDataStoreService;
try {
  if (blockchainService.provider && blockchainService.wallet) {
    eduWalletDataStoreService = new EduWalletDataStoreService(
      blockchainService.provider,
      blockchainService.wallet
    );
  }
} catch (error) {
  logger.warn('EduWalletDataStore service initialization failed:', error.message);
}

// Middleware để kiểm tra service có sẵn
const requireService = (req, res, next) => {
  if (!eduWalletDataStoreService) {
    return next(new AppError('EduWalletDataStore service not available', 503));
  }
  next();
};

// ========== LEARNING RECORDS ==========

/**
 * @swagger
 * /api/eduwallet/learning-records:
 *   post:
 *     summary: Thêm học bạ mới
 *     tags: [EduWallet DataStore]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentName
 *               - institution
 *               - courseName
 *               - certificateHash
 *               - score
 *               - studentAddress
 *             properties:
 *               studentName:
 *                 type: string
 *               institution:
 *                 type: string
 *               courseName:
 *                 type: string
 *               certificateHash:
 *                 type: string
 *               score:
 *                 type: number
 *               studentAddress:
 *                 type: string
 */
router.post('/learning-records', 
  authenticateToken,
  authorize(['institution', 'admin']),
  requireService,
  validate(schemas.addLearningRecord),
  asyncHandler(async (req, res) => {
    const result = await eduWalletDataStoreService.addLearningRecord(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Learning record added successfully',
      data: result
    });
  })
);

/**
 * @swagger
 * /api/eduwallet/learning-records/{id}:
 *   get:
 *     summary: Lấy thông tin học bạ theo ID
 *     tags: [EduWallet DataStore]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/learning-records/:id', 
  requireService,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await eduWalletDataStoreService.getLearningRecord(id);
    
    res.json({
      success: true,
      data: result.data
    });
  })
);

/**
 * @swagger
 * /api/eduwallet/students/{address}/records:
 *   get:
 *     summary: Lấy danh sách học bạ của sinh viên
 *     tags: [EduWallet DataStore]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/students/:address/records', 
  requireService,
  asyncHandler(async (req, res) => {
    const { address } = req.params;
    const result = await eduWalletDataStoreService.getStudentRecords(address);
    
    res.json({
      success: true,
      data: result.data
    });
  })
);

// ========== BADGES ==========

/**
 * @swagger
 * /api/eduwallet/badges:
 *   post:
 *     summary: Tạo badge mới cho sinh viên
 *     tags: [EduWallet DataStore]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - imageHash
 *               - studentAddress
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               imageHash:
 *                 type: string
 *               studentAddress:
 *                 type: string
 */
router.post('/badges', 
  authenticateToken,
  authorize(['institution', 'admin']),
  requireService,
  validate(schemas.earnBadge),
  asyncHandler(async (req, res) => {
    const result = await eduWalletDataStoreService.earnBadge(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Badge earned successfully',
      data: result
    });
  })
);

/**
 * @swagger
 * /api/eduwallet/badges/{id}:
 *   get:
 *     summary: Lấy thông tin badge theo ID
 *     tags: [EduWallet DataStore]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/badges/:id', 
  requireService,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await eduWalletDataStoreService.getBadge(id);
    
    res.json({
      success: true,
      data: result.data
    });
  })
);

/**
 * @swagger
 * /api/eduwallet/students/{address}/badges:
 *   get:
 *     summary: Lấy danh sách badge của sinh viên
 *     tags: [EduWallet DataStore]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/students/:address/badges', 
  requireService,
  asyncHandler(async (req, res) => {
    const { address } = req.params;
    const result = await eduWalletDataStoreService.getStudentBadges(address);
    
    res.json({
      success: true,
      data: result.data
    });
  })
);

// ========== PORTFOLIOS ==========

/**
 * @swagger
 * /api/eduwallet/portfolios:
 *   post:
 *     summary: Tạo portfolio mới
 *     tags: [EduWallet DataStore]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - projectHash
 *               - skills
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               projectHash:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 */
router.post('/portfolios', 
  authenticateToken,
  requireService,
  validate(schemas.createPortfolio),
  asyncHandler(async (req, res) => {
    const result = await eduWalletDataStoreService.createPortfolio(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Portfolio created successfully',
      data: result
    });
  })
);

/**
 * @swagger
 * /api/eduwallet/portfolios/{id}:
 *   get:
 *     summary: Lấy thông tin portfolio theo ID
 *     tags: [EduWallet DataStore]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/portfolios/:id', 
  requireService,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await eduWalletDataStoreService.getPortfolio(id);
    
    res.json({
      success: true,
      data: result.data
    });
  })
);

/**
 * @swagger
 * /api/eduwallet/students/{address}/portfolios:
 *   get:
 *     summary: Lấy danh sách portfolio của sinh viên
 *     tags: [EduWallet DataStore]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/students/:address/portfolios', 
  requireService,
  asyncHandler(async (req, res) => {
    const { address } = req.params;
    const result = await eduWalletDataStoreService.getStudentPortfolios(address);
    
    res.json({
      success: true,
      data: result.data
    });
  })
);

// ========== AUTHORIZATION ==========

/**
 * @swagger
 * /api/eduwallet/authorize-issuer:
 *   post:
 *     summary: Ủy quyền issuer mới (chỉ admin)
 *     tags: [EduWallet DataStore]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - issuerAddress
 *               - authorized
 *             properties:
 *               issuerAddress:
 *                 type: string
 *               authorized:
 *                 type: boolean
 */
router.post('/authorize-issuer', 
  authenticateToken,
  authorize(['admin']),
  requireService,
  validate(schemas.authorizeIssuer),
  asyncHandler(async (req, res) => {
    const { issuerAddress, authorized } = req.body;
    const result = await eduWalletDataStoreService.authorizeIssuer(issuerAddress, authorized);
    
    res.json({
      success: true,
      message: `Issuer ${authorized ? 'authorized' : 'unauthorized'} successfully`,
      data: result
    });
  })
);

/**
 * @swagger
 * /api/eduwallet/check-issuer/{address}:
 *   get:
 *     summary: Kiểm tra quyền issuer
 *     tags: [EduWallet DataStore]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/check-issuer/:address', 
  requireService,
  asyncHandler(async (req, res) => {
    const { address } = req.params;
    const result = await eduWalletDataStoreService.isAuthorizedIssuer(address);
    
    res.json({
      success: true,
      data: result.data
    });
  })
);

// ========== GENERAL INFO ==========

/**
 * @swagger
 * /api/eduwallet/counts:
 *   get:
 *     summary: Lấy tổng số records, badges, portfolios
 *     tags: [EduWallet DataStore]
 */
router.get('/counts', 
  requireService,
  asyncHandler(async (req, res) => {
    const result = await eduWalletDataStoreService.getCounts();
    
    res.json({
      success: true,
      data: result.data
    });
  })
);

/**
 * @swagger
 * /api/eduwallet/owner:
 *   get:
 *     summary: Lấy owner của contract
 *     tags: [EduWallet DataStore]
 */
router.get('/owner', 
  requireService,
  asyncHandler(async (req, res) => {
    const result = await eduWalletDataStoreService.getOwner();
    
    res.json({
      success: true,
      data: result.data
    });
  })
);

/**
 * @swagger
 * /api/eduwallet/contract-info:
 *   get:
 *     summary: Lấy thông tin contract
 *     tags: [EduWallet DataStore]
 */
router.get('/contract-info', 
  requireService,
  asyncHandler(async (req, res) => {
    const [counts, owner] = await Promise.all([
      eduWalletDataStoreService.getCounts(),
      eduWalletDataStoreService.getOwner()
    ]);
    
    res.json({
      success: true,
      data: {
        contractAddress: process.env.EDUWALLET_DATASTORE_ADDRESS,
        network: process.env.BLOCKCHAIN_NETWORK,
        chainId: process.env.BLOCKCHAIN_CHAIN_ID,
        rpcUrl: process.env.BLOCKCHAIN_RPC_URL,
        counts: counts.data,
        owner: owner.data.owner
      }
    });
  })
);

module.exports = router;
