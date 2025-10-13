const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  address: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true // Normalize address to lowercase
  },
  connected: { 
    type: Boolean, 
    default: true 
  },
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    default: null 
  },
  chainId: {
    type: Number,
    default: 5080 // Pione Zero default
  },
  network: {
    type: String,
    default: "Pione Zero"
  },
  lastConnected: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

// Index for faster queries
walletSchema.index({ address: 1 });
walletSchema.index({ user_id: 1 });
walletSchema.index({ connected: 1 });

module.exports = mongoose.model("Wallet", walletSchema);
