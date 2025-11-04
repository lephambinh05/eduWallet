const mongoose = require("mongoose");

const blockchainTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    txHash: { type: String, required: true, index: true },
    type: { type: String, required: true }, // e.g., 'mint', 'transfer', 'issueCertificate'
    tokenId: { type: String, default: null },
    contractAddress: { type: String, default: null, index: true },
    ipfsHash: { type: String, default: null },
    metadataURI: { type: String, default: null },
    to: { type: String, default: null },
    amount: { type: String, default: null },
    blockNumber: { type: Number, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "success",
    },
  },
  {
    timestamps: true,
  }
);

blockchainTransactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model(
  "BlockchainTransaction",
  blockchainTransactionSchema
);
