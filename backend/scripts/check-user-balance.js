/**
 * Check user's EDU token balance
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");

async function checkUserBalance(userId) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    const user = await User.findById(userId);

    if (!user) {
      console.log("❌ User not found");
      process.exit(1);
    }

    console.log("");
    console.log("=== USER INFO ===");
    console.log("ID:", user._id);
    console.log("Email:", user.email);
    console.log("Name:", user.firstName, user.lastName);
    console.log("Username:", user.username);
    console.log("");
    console.log("=== BALANCE ===");
    console.log("EDU Token Balance:", user.eduTokenBalance);
    console.log("Wallet Address (in User model):", user.walletAddress);
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

const userId = process.argv[2] || "68ecef57f2d3ddc8fd99e5be";
checkUserBalance(userId);
