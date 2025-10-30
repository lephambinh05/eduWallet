/**
 * Check transaction details
 */

require("dotenv").config();
const mongoose = require("mongoose");

// Import models properly
const User = require("../src/models/User");
const BlockchainTransaction = require("../src/models/BlockchainTransaction");

async function checkTransaction(txHash) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    const tx = await BlockchainTransaction.findOne({ txHash }).populate(
      "userId",
      "email walletAddress firstName lastName"
    );

    if (!tx) {
      console.log("❌ Transaction not found in database");
      console.log("TX Hash:", txHash);
      console.log("");
      console.log("This transaction may not have been saved yet.");
      console.log("Please provide:");
      console.log("1. Your wallet address (địa chỉ ví đã chuyển PZO)");
      console.log("2. Số lượng PZO đã chuyển");
    } else {
      console.log("✅ Transaction found!");
      console.log("");
      console.log("=== TRANSACTION DETAILS ===");
      console.log("TX Hash:", tx.txHash);
      console.log("Type:", tx.type);
      console.log("Status:", tx.status);
      console.log("Amount:", tx.amount);
      console.log("From:", tx.from);
      console.log("To:", tx.to);
      console.log("Network:", tx.network);
      console.log("Created:", tx.createdAt);

      if (tx.userId) {
        console.log("");
        console.log("=== USER INFO ===");
        console.log("Email:", tx.userId.email);
        console.log("Name:", tx.userId.firstName, tx.userId.lastName);
        console.log("Wallet:", tx.userId.walletAddress);
      }

      if (tx.metadata) {
        console.log("");
        console.log("=== METADATA ===");
        console.log(JSON.stringify(tx.metadata, null, 2));
      }

      if (tx.status === "confirmed" && tx.metadata?.eduCredited) {
        console.log("");
        console.log("✅ This transaction has already been processed!");
        console.log("EDU credited:", tx.metadata.eduCredited);
        console.log("Processed at:", tx.metadata.processedAt);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

const txHash = process.argv[2];
if (!txHash) {
  console.log("Usage: node check-transaction.js <txHash>");
  process.exit(1);
}

checkTransaction(txHash);
