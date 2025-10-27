const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../middleware/errorHandler");

// Public endpoints (no auth) - lightweight and safe-only fields returned
router.get(
  "/admin-wallet",
  asyncHandler(async (req, res) => {
    const AdminWallet = require("../models/AdminWallet");
    const wallet = await AdminWallet.findOne().sort({ createdAt: -1 });

    if (!wallet) {
      return res.json({ success: true, data: { wallet: null } });
    }

    res.json({
      success: true,
      data: {
        address: wallet.address,
        eduPrice: wallet.eduPrice || null,
        minConvertPZO: wallet.minConvertPZO || null,
        maxConvertPZO: wallet.maxConvertPZO || null,
      },
    });
  })
);

module.exports = router;
