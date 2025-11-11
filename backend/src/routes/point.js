const express = require("express");
const { ethers } = require("ethers");
const router = express.Router();
const { pointService } = require("../services/pointService");
const { validate, schemas } = require("../middleware/validation");
const { authenticateToken } = require("../middleware/auth");
const User = require("../models/User");
const BlockchainTransaction = require("../models/BlockchainTransaction");

// Get user's PZO balance
router.get("/pzo-balance/:address", async (req, res) => {
  try {
    const { address } = req.params;

    if (!address || !ethers.utils.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: "Invalid wallet address",
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
          symbol: "PZO",
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in PZO balance endpoint:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Get user's Point balance
router.get("/point-balance/:address", async (req, res) => {
  try {
    const { address } = req.params;

    if (!address || !ethers.utils.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: "Invalid wallet address",
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
          symbol: "POINT",
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in Point balance endpoint:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Get exchange rate information
router.get("/exchange-info", async (req, res) => {
  try {
    const result = await pointService.getExchangeInfo();

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in exchange info endpoint:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Calculate points from PZO amount
router.post(
  "/calculate-points",
  validate(schemas.calculatePoints),
  async (req, res) => {
    try {
      const { pzoAmount } = req.body;

      const result = await pointService.calculatePointsFromPZO(pzoAmount);

      if (result.success) {
        res.json({
          success: true,
          data: {
            pzoAmount,
            points: result.points,
            pointsWei: result.pointsWei,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Error in calculate points endpoint:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

// Calculate PZO from points amount
router.post(
  "/calculate-pzo",
  validate(schemas.calculatePZO),
  async (req, res) => {
    try {
      const { pointAmount } = req.body;

      const result = await pointService.calculatePZOFromPoints(pointAmount);

      if (result.success) {
        res.json({
          success: true,
          data: {
            pointAmount,
            pzo: result.pzo,
            pzoWei: result.pzoWei,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Error in calculate PZO endpoint:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

// Check PZO approval
router.post(
  "/check-approval",
  validate(schemas.checkApproval),
  async (req, res) => {
    try {
      const { userAddress, pzoAmount } = req.body;

      const result = await pointService.checkPZOApproval(
        userAddress,
        pzoAmount
      );

      if (result.success) {
        res.json({
          success: true,
          data: {
            userAddress,
            pzoAmount,
            approved: result.approved,
            allowance: result.allowance,
            required: result.required,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Error in check approval endpoint:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

// Process PZO deposit and credit EDU tokens to user account
router.post("/deposit", authenticateToken, async (req, res) => {
  try {
    const { txHash, pzoAmount } = req.body;
    const userId = req.user.id; // from authenticateToken middleware

    // Validation
    if (!txHash || !pzoAmount) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: txHash and pzoAmount",
      });
    }

    const amount = parseFloat(pzoAmount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid pzoAmount",
      });
    }

    // Check if this transaction has already been processed
    const existingTx = await BlockchainTransaction.findOne({
      txHash,
      type: "deposit_points",
      status: "confirmed",
    });

    if (existingTx) {
      return res.status(400).json({
        success: false,
        error: "Transaction already processed",
      });
    }

    // Get admin wallet settings to calculate EDU amount
    const AdminWallet = require("../models/AdminWallet");
    const adminWallet = await AdminWallet.findOne().sort({ createdAt: -1 });

    let eduAmount = amount; // Default 1:1 if no price configured
    if (adminWallet && adminWallet.eduPrice) {
      const price = parseFloat(adminWallet.eduPrice);
      if (!isNaN(price) && price > 0) {
        eduAmount = amount / price; // PZO / price = EDU
      }
    }

    // Find user and credit EDU tokens
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Credit EDU tokens to user account
    user.eduTokenBalance = (user.eduTokenBalance || 0) + eduAmount;
    await user.save();

    // Update or create transaction record
    await BlockchainTransaction.findOneAndUpdate(
      { txHash },
      {
        $set: {
          userId: userId,
          type: "deposit_points",
          amount: pzoAmount,
          status: "confirmed",
          metadata: {
            eduCredited: eduAmount,
            exchangeRate: adminWallet?.eduPrice || "default",
            processedAt: new Date(),
          },
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: {
        pzoDeposited: amount,
        eduCredited: eduAmount,
        newBalance: user.eduTokenBalance,
        txHash,
      },
      message: `Đã nạp thành công ${eduAmount.toFixed(2)} EDU vào tài khoản!`,
    });
  } catch (error) {
    console.error("Error processing deposit:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error while processing deposit",
    });
  }
});

// Public endpoint to process deposit without authentication (verify by wallet address)
router.post("/deposit-public", async (req, res) => {
  try {
    const { txHash, pzoAmount, walletAddress } = req.body;

    console.log("🔍 Deposit request received:", {
      txHash,
      pzoAmount,
      walletAddress,
      timestamp: new Date().toISOString(),
    });

    // Validation
    if (!txHash || !pzoAmount || !walletAddress) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: txHash, pzoAmount, and walletAddress",
      });
    }

    const amount = parseFloat(pzoAmount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid pzoAmount",
      });
    }

    // Check if this transaction has already been processed
    const existingTx = await BlockchainTransaction.findOne({
      txHash,
      type: "deposit_points",
      status: "confirmed",
    });

    if (existingTx) {
      return res.status(400).json({
        success: false,
        error: "Transaction already processed",
        data: {
          processedAt: existingTx.metadata?.processedAt,
          eduCredited: existingTx.metadata?.eduCredited,
        },
      });
    }

    // Find user by wallet address (check in Wallet collection)
    console.log("🔍 Looking up user by wallet address:", walletAddress);
    let user = await User.findByWalletAddress(walletAddress);

    // If not found, try case-insensitive search
    if (!user) {
      console.log("🔄 Trying case-insensitive search for wallet address");
      user = await User.findOne({
        walletAddress: new RegExp(`^${walletAddress}$`, "i"),
      });
    }

    // If still not found, try to find users with connected wallets and provide helpful error
    if (!user) {
      const usersWithWallets = await User.find(
        { walletAddress: { $exists: true, $ne: null } },
        { email: 1, walletAddress: 1, username: 1 }
      );

      if (usersWithWallets.length === 0) {
        console.log("❌ No users have connected wallets");
        return res.status(404).json({
          success: false,
          error:
            "Không có tài khoản nào đã kết nối ví. Vui lòng kết nối ví trước.",
        });
      }

      console.log(
        "ℹ️ Available wallet connections:",
        usersWithWallets.map((u) => ({
          email: u.email,
          wallet: u.walletAddress,
        }))
      );

      // Check if the requested wallet address is similar to any existing one
      const similarWallets = usersWithWallets.filter(
        (u) =>
          u.walletAddress
            .toLowerCase()
            .includes(walletAddress.toLowerCase().slice(-10)) ||
          walletAddress
            .toLowerCase()
            .includes(u.walletAddress.toLowerCase().slice(-10))
      );

      if (similarWallets.length > 0) {
        console.log(
          "💡 Found similar wallets:",
          similarWallets.map((u) => u.walletAddress)
        );
        return res.status(404).json({
          success: false,
          error: `Ví ${walletAddress} chưa được kết nối. Có thể bạn cần kết nối lại ví hoặc đang sử dụng ví khác.`,
        });
      }

      return res.status(404).json({
        success: false,
        error:
          "Ví chưa được kết nối với tài khoản. Vui lòng nhấp vào 'Kết nối ví' trong sidebar trước khi nạp điểm.",
      });
    }

    console.log("✅ User found:", {
      id: user._id,
      email: user.email,
      walletAddress: user.walletAddress,
    });

    // Get admin wallet settings to calculate EDU amount
    const AdminWallet = require("../models/AdminWallet");
    const adminWallet = await AdminWallet.findOne().sort({ createdAt: -1 });

    let eduAmount = amount; // Default 1:1 if no price configured
    if (adminWallet && adminWallet.eduPrice) {
      const price = parseFloat(adminWallet.eduPrice);
      if (!isNaN(price) && price > 0) {
        eduAmount = amount / price; // PZO / price = EDU
      }
    }

    // Credit EDU tokens to user account
    user.eduTokenBalance = (user.eduTokenBalance || 0) + eduAmount;
    await user.save();

    // Update or create transaction record
    await BlockchainTransaction.findOneAndUpdate(
      { txHash },
      {
        $set: {
          userId: user._id,
          from: walletAddress,
          type: "deposit_points",
          amount: pzoAmount,
          status: "confirmed",
          metadata: {
            eduCredited: eduAmount,
            exchangeRate: adminWallet?.eduPrice || "default",
            processedAt: new Date(),
            processedBy: "auto-deposit-public",
          },
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: {
        pzoDeposited: amount,
        eduCredited: eduAmount,
        newBalance: user.eduTokenBalance,
        txHash,
      },
      message: `Đã nạp thành công ${eduAmount.toFixed(2)} EDU vào tài khoản!`,
    });
  } catch (error) {
    console.error("Error processing public deposit:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error while processing deposit: " + error.message,
    });
  }
});

// Admin endpoint to manually process a deposit transaction
router.post("/admin/process-deposit", async (req, res) => {
  try {
    const { txHash, walletAddress, pzoAmount } = req.body;

    // Validation
    if (!txHash || !walletAddress || !pzoAmount) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: txHash, walletAddress, and pzoAmount",
      });
    }

    const amount = parseFloat(pzoAmount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid pzoAmount",
      });
    }

    // Check if this transaction has already been processed
    const existingTx = await BlockchainTransaction.findOne({
      txHash,
      type: "deposit_points",
      status: "confirmed",
    });

    if (existingTx) {
      return res.status(400).json({
        success: false,
        error: "Transaction already processed",
        data: {
          processedAt: existingTx.metadata?.processedAt,
          eduCredited: existingTx.metadata?.eduCredited,
        },
      });
    }

    // Find user by wallet address
    const user = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found with wallet address: " + walletAddress,
      });
    }

    // Get admin wallet settings to calculate EDU amount
    const AdminWallet = require("../models/AdminWallet");
    const adminWallet = await AdminWallet.findOne().sort({ createdAt: -1 });

    let eduAmount = amount; // Default 1:1 if no price configured
    if (adminWallet && adminWallet.eduPrice) {
      const price = parseFloat(adminWallet.eduPrice);
      if (!isNaN(price) && price > 0) {
        eduAmount = amount / price; // PZO / price = EDU
      }
    }

    // Credit EDU tokens to user account
    user.eduTokenBalance = (user.eduTokenBalance || 0) + eduAmount;
    await user.save();

    // Update or create transaction record
    await BlockchainTransaction.findOneAndUpdate(
      { txHash },
      {
        $set: {
          userId: user._id,
          type: "deposit_points",
          amount: pzoAmount,
          status: "confirmed",
          metadata: {
            eduCredited: eduAmount,
            exchangeRate: adminWallet?.eduPrice || "default",
            processedAt: new Date(),
            processedBy: "admin-manual",
          },
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          walletAddress: user.walletAddress,
        },
        pzoDeposited: amount,
        eduCredited: eduAmount,
        newBalance: user.eduTokenBalance,
        txHash,
      },
      message: `Đã xử lý thành công giao dịch! Cộng ${eduAmount.toFixed(
        2
      )} EDU cho user ${user.email}`,
    });
  } catch (error) {
    console.error("Error processing admin deposit:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error: " + error.message,
    });
  }
});

// Get contract addresses
router.get("/contract-addresses", async (req, res) => {
  try {
    const result = await pointService.getContractAddresses();

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in contract addresses endpoint:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

module.exports = router;
