const logger = require("../utils/logger");
const BlockchainTransaction = require("../models/BlockchainTransaction");
const blockchainService = require("./blockchainService");
const AdminWallet = require("../models/AdminWallet");
const User = require("../models/User");

/**
 * Reconcile pending blockchain transactions.
 * - Finds transactions with status 'pending' or without blockNumber
 * - Queries chain for receipt and updates DB status to 'success' or 'failed'
 */
async function reconcilePending({ limit = 50 } = {}) {
  try {
    const query = { $or: [{ status: "pending" }, { blockNumber: null }] };
    const pending = await BlockchainTransaction.find(query).limit(limit).lean();

    if (!pending || pending.length === 0) {
      logger.info("No pending transactions to reconcile");
      return { processed: 0 };
    }

    let processed = 0;

    for (const tx of pending) {
      try {
        const receipt = await blockchainService.getTransactionReceipt(
          tx.txHash
        );
        if (!receipt) {
          // still pending on chain
          continue;
        }

        const update = { blockNumber: receipt.blockNumber };
        // ethers v6: receipt.status === 1 -> success, 0 -> failed
        if (typeof receipt.status !== "undefined") {
          update.status = receipt.status === 1 ? "success" : "failed";
        } else if (receipt.confirmations && receipt.confirmations > 0) {
          update.status = "success";
        } else {
          update.status = "pending";
        }

        await BlockchainTransaction.findByIdAndUpdate(tx._id, update);
        processed++;
        logger.info("Reconciled tx", {
          txHash: tx.txHash,
          status: update.status,
        });

        // If transaction is a deposit_points and was successful, credit user with EDU/points
        try {
          if (update.status === "success" && tx.type === "deposit_points") {
            // Determine EDU amount: prefer metadata.eduAmount, else compute using admin.eduPrice
            let eduAmount = null;
            if (tx.metadata && tx.metadata.eduAmount) {
              eduAmount = parseFloat(tx.metadata.eduAmount);
            }

            if (!eduAmount && tx.amount) {
              // fetch admin conversion price
              const admin = await AdminWallet.findOne()
                .sort({ createdAt: -1 })
                .lean();
              if (admin && admin.eduPrice) {
                const price = parseFloat(admin.eduPrice);
                const pzoAmount = parseFloat(tx.amount);
                if (!isNaN(price) && price > 0 && !isNaN(pzoAmount)) {
                  eduAmount = pzoAmount / price;
                }
              }
            }

            if (eduAmount && !isNaN(eduAmount) && eduAmount > 0) {
              // 1) Mint on-chain EDU tokens to the user's wallet if server wallet is available
              const recipient = tx.to || null;
              try {
                if (
                  recipient &&
                  blockchainService &&
                  typeof blockchainService.mintEduTokens === "function"
                ) {
                  await blockchainService.mintEduTokens(
                    recipient,
                    eduAmount.toString()
                  );
                  logger.info("Minted EDU tokens on-chain", {
                    to: recipient,
                    amount: eduAmount,
                  });
                }
              } catch (mintErr) {
                logger.error("Failed to mint EDU tokens after reconcile", {
                  error: mintErr.message,
                  txHash: tx.txHash,
                });
              }

              // 2) Update user stats/off-chain records (if userId present)
              if (tx.userId) {
                try {
                  await User.findByIdAndUpdate(tx.userId, {
                    $inc: { "stats.totalRewards": eduAmount },
                  });
                  await logger.logUserAction(tx.userId, "deposit_credited", {
                    eduAmount,
                    txHash: tx.txHash,
                  });
                } catch (userErr) {
                  logger.error("Failed to update user stats after reconcile", {
                    error: userErr.message,
                    userId: tx.userId,
                  });
                }
              }
            }
          }
        } catch (err) {
          logger.error("Error handling post-reconcile credit logic", {
            error: err.message,
            txHash: tx.txHash,
          });
        }
      } catch (err) {
        logger.error("Error reconciling tx " + tx.txHash, {
          error: err.message,
        });
      }
    }

    return { processed };
  } catch (error) {
    logger.error("Failed to reconcile pending transactions", {
      error: error.message,
    });
    throw error;
  }
}

module.exports = {
  reconcilePending,
};
