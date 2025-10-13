const express = require('express');
const router = express.Router();
const Wallet = require('../models/Wallet');
const jwt = require('jsonwebtoken');

// Middleware để verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('🔐 Auth header:', authHeader);
  
  const token = authHeader?.split(' ')[1];
  console.log('🔐 Token:', token ? `${token.substring(0, 20)}...` : 'No token');
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'Không có token xác thực' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('✅ Token decoded successfully:', { id: decoded.id, userId: decoded.userId });
    req.userId = decoded.id || decoded.userId; // Support both formats
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token không hợp lệ' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token đã hết hạn' });
    }
    return res.status(401).json({ error: 'Lỗi xác thực token' });
  }
};

// ✅ Lưu ví (idempotent - không thêm trùng)
router.post('/save', verifyToken, async (req, res) => {
  const { address, chainId, network } = req.body;
  
  if (!address) {
    return res.status(400).json({ error: 'Thiếu địa chỉ ví' });
  }

  try {
    // Normalize address to lowercase
    const normalizedAddress = address.toLowerCase();
    
    // Tìm ví hiện có hoặc tạo mới (upsert)
    const wallet = await Wallet.findOneAndUpdate(
      { address: normalizedAddress },
      { 
        connected: true,
        user_id: req.userId,
        chainId: chainId || 5080,
        network: network || 'Pione Zero',
        lastConnected: new Date()
      },
      { 
        new: true, 
        upsert: true 
      }
    );

    console.log('✅ Wallet saved:', {
      address: wallet.address,
      userId: wallet.user_id,
      connected: wallet.connected
    });

    res.json({ 
      success: true, 
      wallet: {
        address: wallet.address,
        connected: wallet.connected,
        chainId: wallet.chainId,
        network: wallet.network,
        lastConnected: wallet.lastConnected
      }
    });
  } catch (error) {
    console.error('❌ Error saving wallet:', error);
    res.status(500).json({ error: 'Lỗi khi lưu ví' });
  }
});

// ❌ Xóa ví
router.post('/delete', verifyToken, async (req, res) => {
  const { address } = req.body;
  
  if (!address) {
    return res.status(400).json({ error: 'Thiếu địa chỉ ví' });
  }

  try {
    const normalizedAddress = address.toLowerCase();
    
    // Xóa ví hoặc đánh dấu disconnected
    const result = await Wallet.findOneAndDelete({ 
      address: normalizedAddress,
      user_id: req.userId 
    });

    if (!result) {
      return res.status(404).json({ error: 'Không tìm thấy ví để xóa' });
    }

    console.log('✅ Wallet deleted:', {
      address: result.address,
      userId: result.user_id
    });

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting wallet:', error);
    res.status(500).json({ error: 'Lỗi khi xóa ví' });
  }
});

// 🔍 Kiểm tra ví
router.post('/check', verifyToken, async (req, res) => {
  const { address } = req.body;
  
  if (!address) {
    return res.status(400).json({ error: 'Thiếu địa chỉ ví' });
  }

  try {
    const normalizedAddress = address.toLowerCase();
    
    const wallet = await Wallet.findOne({ 
      address: normalizedAddress,
      user_id: req.userId 
    });

    res.json({ 
      exists: !!wallet, 
      wallet: wallet ? {
        address: wallet.address,
        connected: wallet.connected,
        chainId: wallet.chainId,
        network: wallet.network,
        lastConnected: wallet.lastConnected
      } : null
    });
  } catch (error) {
    console.error('❌ Error checking wallet:', error);
    res.status(500).json({ error: 'Lỗi khi kiểm tra ví' });
  }
});

// 📋 Lấy tất cả ví của user
router.get('/user', verifyToken, async (req, res) => {
  try {
    const wallets = await Wallet.find({ 
      user_id: req.userId,
      connected: true 
    }).sort({ lastConnected: -1 });

    res.json({
      success: true,
      wallets: wallets.map(wallet => ({
        address: wallet.address,
        connected: wallet.connected,
        chainId: wallet.chainId,
        network: wallet.network,
        lastConnected: wallet.lastConnected
      }))
    });
  } catch (error) {
    console.error('❌ Error getting user wallets:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách ví' });
  }
});

module.exports = router;
