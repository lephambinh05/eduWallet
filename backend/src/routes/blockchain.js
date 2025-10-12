const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken, authorize } = require('../middleware/auth');
const blockchainService = require('../services/blockchainService');
const logger = require('../utils/logger');

// Get network info
router.get('/network-info', asyncHandler(async (req, res) => {
  const networkInfo = {
    network: process.env.BLOCKCHAIN_NETWORK || 'pioneZero',
    chainId: process.env.BLOCKCHAIN_CHAIN_ID || 5080,
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'https://rpc.zeroscan.org'
  };
  res.json({ success: true, data: { networkInfo } });
}));

// Get wallet balance
router.get('/wallet-balance/:address', asyncHandler(async (req, res) => {
  const { address } = req.params;
  const balance = await blockchainService.getWalletBalance(address);
  res.json({ success: true, data: { balance } });
}));

// Get EDU token balance
router.get('/edu-token-balance/:address', asyncHandler(async (req, res) => {
  const { address } = req.params;
  const balance = await blockchainService.getEduTokenBalance(address);
  res.json({ success: true, data: { balance } });
}));

// Register user on blockchain
router.post('/register-user',
  authenticateToken,
  validate(schemas.blockchainRegisterUser),
  asyncHandler(async (req, res) => {
    const txHash = await blockchainService.registerUserAndMintLearnPass(
      req.body.userAddress,
      req.body.studentId,
      req.body.name,
      req.body.email,
      req.body.profilePictureURI,
      req.body.coursesCompletedURI,
      req.body.skillsAcquiredURI,
      req.body.learnPassTokenURI
    );
    
    res.json({ success: true, data: { txHash } });
  })
);

// Issue certificate
router.post('/issue-certificate',
  authenticateToken,
  authorize('institution', 'admin'),
  validate(schemas.blockchainIssueCertificate),
  asyncHandler(async (req, res) => {
    const txHash = await blockchainService.issueCertificateForUser(
      req.body.studentAddress,
      req.body.certificateId,
      req.body.courseName,
      req.body.issuerName,
      req.body.issueDate,
      req.body.gradeOrScore,
      req.body.skillsCovered,
      req.body.certificateURI,
      req.body.certificateTokenURI
    );
    
    res.json({ success: true, data: { txHash } });
  })
);

// Get LearnPass metadata
router.get('/learnpass-metadata/:tokenId', asyncHandler(async (req, res) => {
  const { tokenId } = req.params;
  const metadata = await blockchainService.getLearnPassMetadata(tokenId);
  res.json({ success: true, data: { metadata } });
}));

// Get certificate metadata
router.get('/certificate-metadata/:tokenId', asyncHandler(async (req, res) => {
  const { tokenId } = req.params;
  const metadata = await blockchainService.getCertificateMetadata(tokenId);
  res.json({ success: true, data: { metadata } });
}));

// Verify certificate
router.post('/verify-certificate/:tokenId',
  authenticateToken,
  authorize('verifier', 'admin'),
  asyncHandler(async (req, res) => {
    const { tokenId } = req.params;
    const txHash = await blockchainService.verifyCertificate(tokenId);
    res.json({ success: true, data: { txHash } });
  })
);

// Get marketplace items
router.get('/marketplace/items', asyncHandler(async (req, res) => {
  const items = await blockchainService.getActiveMarketplaceItems();
  res.json({ success: true, data: { items } });
}));

// Purchase marketplace item
router.post('/marketplace/purchase/:itemId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const txHash = await blockchainService.purchaseMarketplaceItem(itemId, req.user.walletAddress);
    res.json({ success: true, data: { txHash } });
  })
);

// Transfer EDU tokens
router.post('/transfer-edu-tokens',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { to, amount } = req.body;
    const txHash = await blockchainService.transferEduTokens(req.user.walletAddress, to, amount);
    res.json({ success: true, data: { txHash } });
  })
);

// Get transaction details
router.get('/transaction/:txHash', asyncHandler(async (req, res) => {
  const { txHash } = req.params;
  const transaction = await blockchainService.getTransaction(txHash);
  res.json({ success: true, data: { transaction } });
}));

module.exports = router;