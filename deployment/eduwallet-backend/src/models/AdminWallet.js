const mongoose = require("mongoose");

const AdminWalletSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  chainId: {
    type: String,
    default: null,
  },
  networkName: {
    type: String,
    default: null,
  },
  // Conversion settings controlled by admin
  // eduPrice: number stored as string to preserve precision (PZO per 1 EDU)
  eduPrice: {
    type: String,
    default: null,
  },
  // Minimum and maximum PZO a user may convert in a single operation
  minConvertPZO: {
    type: String,
    default: null,
  },
  maxConvertPZO: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AdminWallet", AdminWalletSchema);
