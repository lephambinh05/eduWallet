const mongoose = require("mongoose");
const { Schema } = mongoose;

const PortfolioChangeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenId: { type: String, default: null },
    changeType: {
      type: String,
      enum: ["mint", "update", "delete", "other"],
      required: true,
    },
    diff: { type: Schema.Types.Mixed, default: {} },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PortfolioChange", PortfolioChangeSchema);
