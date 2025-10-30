/**
 * Process deposit by User ID
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");
const BlockchainTransaction = require("../src/models/BlockchainTransaction");
const AdminWallet = require("../src/models/AdminWallet");

async function processDepositByUserId(txHash, userId, pzoAmount) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    const amount = parseFloat(pzoAmount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Invalid pzoAmount");
    }

    // Check if already processed
    const existingTx = await BlockchainTransaction.findOne({
      txHash,
      type: "deposit_points",
      status: "confirmed",
    });

    if (existingTx) {
      console.log("⚠️ Transaction already processed!");
      console.log("Processed at:", existingTx.metadata?.processedAt);
      console.log("EDU credited:", existingTx.metadata?.eduCredited);
      process.exit(0);
    }

    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    console.log("✅ Found user:", user.email);
    console.log("Current EDU balance:", user.eduTokenBalance || 0);

    // Get admin settings
    const adminWallet = await AdminWallet.findOne().sort({ createdAt: -1 });

    let eduAmount = amount; // Default 1:1
    if (adminWallet && adminWallet.eduPrice) {
      const price = parseFloat(adminWallet.eduPrice);
      if (!isNaN(price) && price > 0) {
        eduAmount = amount / price;
      }
    }

    console.log("Exchange rate:", adminWallet?.eduPrice || "default 1:1");
    console.log("PZO amount:", amount);
    console.log("EDU to credit:", eduAmount);

    // Credit EDU
    user.eduTokenBalance = (user.eduTokenBalance || 0) + eduAmount;
    await user.save();

    console.log("✅ Credited", eduAmount, "EDU to user");
    console.log("New balance:", user.eduTokenBalance);

    // Update transaction
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
            processedBy: "manual-script-by-userId",
          },
        },
      },
      { upsert: true, new: true }
    );

    console.log("✅ Transaction updated in database");
    console.log("");
    console.log("=== SUMMARY ===");
    console.log("User:", user.email);
    console.log("User ID:", user._id);
    console.log("PZO deposited:", amount);
    console.log("EDU credited:", eduAmount);
    console.log("New balance:", user.eduTokenBalance);
    console.log("TX Hash:", txHash);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log(
    "Usage: node process-deposit-by-userid.js <txHash> <userId> <pzoAmount>"
  );
  console.log(
    "Example: node process-deposit-by-userid.js 0xabc... 68ecef57f2d3ddc8fd99e5be 0.2"
  );
  process.exit(1);
}

const [txHash, userId, pzoAmount] = args;
processDepositByUserId(txHash, userId, pzoAmount);
