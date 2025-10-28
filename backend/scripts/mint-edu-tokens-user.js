const mongoose = require('mongoose');
const User = require('../src/models/User');
const BlockchainService = require('../src/services/blockchainService');
require('dotenv').config({ path: '../.env' });

async function mintEduTokensForUser(email, amount) {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet');
    console.log('✅ Connected to MongoDB');

    // Tìm user theo email
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error(`❌ User with email ${email} not found`);
    }

    console.log(`📧 Found user: ${user.fullName} (${user.email})`);
    console.log(`💳 Wallet address: ${user.walletAddress}`);

    if (!user.walletAddress) {
      throw new Error('❌ User does not have a wallet address');
    }

    // Khởi tạo blockchain service
    const blockchainService = new BlockchainService();
    await blockchainService.init();
    console.log('🔗 Blockchain service initialized');

    // Kiểm tra balance hiện tại
    const currentBalance = await blockchainService.getEduTokenBalance(user.walletAddress);
    console.log(`💰 Current EDU Token balance: ${currentBalance}`);

    // Mint EDU tokens
    console.log(`🏭 Minting ${amount} EDU tokens for ${user.email}...`);
    const result = await blockchainService.mintEduTokens(user.walletAddress, amount);
    
    console.log('🎉 EDU Tokens minted successfully!');
    console.log(`📄 Transaction Hash: ${result.transactionHash}`);
    console.log(`📦 Block Number: ${result.blockNumber}`);

    // Kiểm tra balance mới
    const newBalance = await blockchainService.getEduTokenBalance(user.walletAddress);
    console.log(`💰 New EDU Token balance: ${newBalance}`);

    // Cập nhật stats của user
    await User.findByIdAndUpdate(user._id, {
      $inc: { 'stats.totalRewards': amount },
      $set: { 'stats.lastActivity': new Date() }
    });

    console.log('✅ User stats updated');

    return {
      success: true,
      user: {
        email: user.email,
        name: user.fullName,
        walletAddress: user.walletAddress
      },
      transaction: {
        hash: result.transactionHash,
        blockNumber: result.blockNumber,
        amount: amount
      },
      balance: {
        before: currentBalance,
        after: newBalance
      }
    };

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Script chính
async function main() {
  try {
    const targetEmail = 'lephambinh05@gmail.com';
    const tokenAmount = 100;

    console.log('🚀 Starting EDU Token minting process...');
    console.log(`📧 Target email: ${targetEmail}`);
    console.log(`💰 Amount to mint: ${tokenAmount} EDU tokens`);
    console.log('─'.repeat(50));

    const result = await mintEduTokensForUser(targetEmail, tokenAmount);
    
    console.log('─'.repeat(50));
    console.log('🎉 SUCCESS! EDU Tokens minted successfully!');
    console.log('📊 Summary:');
    console.log(`👤 User: ${result.user.name} (${result.user.email})`);
    console.log(`💳 Wallet: ${result.user.walletAddress}`);
    console.log(`💰 Amount minted: ${tokenAmount} EDU tokens`);
    console.log(`📄 Transaction: ${result.transaction.hash}`);
    console.log(`💰 Balance: ${result.balance.before} → ${result.balance.after}`);

  } catch (error) {
    console.error('💥 FAILED!', error.message);
    process.exit(1);
  }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  main();
}

module.exports = { mintEduTokensForUser };