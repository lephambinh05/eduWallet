const express = require('express');
const { ethers } = require('ethers');
const router = express.Router();
const { pointService } = require('../services/pointService');
const { validate, schemas } = require('../middleware/validation');

// Get user's PZO balance
router.get('/pzo-balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address || !ethers.utils.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address'
      });
    }

    const result = await pointService.getPZOBalance(address);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          address,
          balance: result.balance,
          balanceWei: result.balanceWei,
          symbol: 'PZO'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in PZO balance endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user's Point balance
router.get('/point-balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address || !ethers.utils.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address'
      });
    }

    const result = await pointService.getPointBalance(address);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          address,
          balance: result.balance,
          balanceWei: result.balanceWei,
          symbol: 'POINT'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in Point balance endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get exchange rate information
router.get('/exchange-info', async (req, res) => {
  try {
    const result = await pointService.getExchangeInfo();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in exchange info endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Calculate points from PZO amount
router.post('/calculate-points', validate(schemas.calculatePoints), async (req, res) => {
  try {
    const { pzoAmount } = req.body;
    
    const result = await pointService.calculatePointsFromPZO(pzoAmount);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          pzoAmount,
          points: result.points,
          pointsWei: result.pointsWei
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in calculate points endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Calculate PZO from points amount
router.post('/calculate-pzo', validate(schemas.calculatePZO), async (req, res) => {
  try {
    const { pointAmount } = req.body;
    
    const result = await pointService.calculatePZOFromPoints(pointAmount);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          pointAmount,
          pzo: result.pzo,
          pzoWei: result.pzoWei
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in calculate PZO endpoint:', error);
    res.status(500).json({
      success: false,
        error: 'Internal server error'
    });
  }
});

// Check PZO approval
router.post('/check-approval', validate(schemas.checkApproval), async (req, res) => {
  try {
    const { userAddress, pzoAmount } = req.body;
    
    const result = await pointService.checkPZOApproval(userAddress, pzoAmount);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          userAddress,
          pzoAmount,
          approved: result.approved,
          allowance: result.allowance,
          required: result.required
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in check approval endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get contract addresses
router.get('/contract-addresses', async (req, res) => {
  try {
    const result = await pointService.getContractAddresses();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in contract addresses endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
