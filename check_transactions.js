const mongoose = require("mongoose");

async function checkRecentTransactions() {
  try {
    await mongoose.connect("mongodb://localhost:27017/eduwallet");
    console.log("Connected to MongoDB");

    const Transaction = mongoose.model(
      "BlockchainTransaction",
      new mongoose.Schema({
        transactionHash: String,
        walletAddress: String,
        amount: Number,
        type: String,
        status: String,
        createdAt: Date,
      })
    );

    const transactions = await Transaction.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    console.log("Recent transactions:");
    transactions.forEach((tx) => {
      console.log(
        `${tx.createdAt}: ${tx.transactionHash} - ${tx.walletAddress} - ${tx.amount} ${tx.type} - ${tx.status}`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkRecentTransactions();
