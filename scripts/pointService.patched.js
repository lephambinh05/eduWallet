// Patched by deploy helper: add safe ethers require and JsonRpcProvider fallback
let ethers;
try {
  ethers = require("ethers");
  // Some bundlers export default under .default
  if (ethers && ethers.default) ethers = ethers.default;
} catch (e) {
  console.error("ethers require failed", e);
  ethers = null;
}

let JsonRpcProvider = null;
if (ethers && ethers.providers && ethers.providers.JsonRpcProvider) {
  JsonRpcProvider = ethers.providers.JsonRpcProvider;
} else {
  try {
    JsonRpcProvider = require("@ethersproject/providers").JsonRpcProvider;
  } catch (e) {
    JsonRpcProvider = null;
  }
}

const { blockchainService } = require("./blockchainService");

class PointService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.pzoToken = null;
    this.pointToken = null;
    this.initializeContracts();
  }

  async initializeContracts() {
    try {
      if (!JsonRpcProvider) {
        console.warn(
          "JsonRpcProvider not available — skipping PointService initialization (degraded mode)"
        );
        return;
      }

      // Initialize provider and signer
      this.provider = new JsonRpcProvider(process.env.RPC_URL);
      this.signer = new (
        ethers && ethers.Wallet ? ethers.Wallet : require("ethers").Wallet
      )(process.env.PRIVATE_KEY, this.provider);

      // Initialize PZO Token contract
      const pzoTokenABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
        "function transferFrom(address from, address to, uint256 amount) returns (bool)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)",
        "function mint(address to, uint256 amount)",
        "function burn(uint256 amount)",
      ];

      this.pzoToken = new (
        ethers && ethers.Contract ? ethers.Contract : require("ethers").Contract
      )(process.env.PZO_TOKEN_ADDRESS, pzoTokenABI, this.signer);

      // Initialize Point Token contract
      const pointTokenABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function exchangePZOToPoints(uint256 pzoAmount)",
        "function withdrawPointsToPZO(uint256 pointAmount)",
        "function getExchangeInfo() view returns (uint256 rate, uint256 pzoDecimals, uint256 pointDecimals)",
        "function calculatePointsFromPZO(uint256 pzoAmount) pure returns (uint256)",
        "function calculatePZOFromPoints(uint256 pointAmount) pure returns (uint256)",
        "event PointsExchanged(address indexed user, uint256 pzoAmount, uint256 pointAmount)",
        "event PointsWithdrawn(address indexed user, uint256 pointAmount, uint256 pzoAmount)",
      ];

      this.pointToken = new (
        ethers && ethers.Contract ? ethers.Contract : require("ethers").Contract
      )(process.env.POINT_TOKEN_ADDRESS, pointTokenABI, this.signer);

      console.log("✅ Point Service initialized successfully");
    } catch (error) {
      console.error("❌ Point Service initialization failed:", error);
    }
  }

  // Get user's PZO balance
  async getPZOBalance(userAddress) {
    try {
      const balance = await this.pzoToken.balanceOf(userAddress);
      return {
        success: true,
        balance: ethers.utils.formatEther(balance),
        balanceWei: balance.toString(),
      };
    } catch (error) {
      console.error("Error getting PZO balance:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get user's Point balance
  async getPointBalance(userAddress) {
    try {
      const balance = await this.pointToken.balanceOf(userAddress);
      return {
        success: true,
        balance: ethers.utils.formatEther(balance),
        balanceWei: balance.toString(),
      };
    } catch (error) {
      console.error("Error getting Point balance:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get exchange rate information
  async getExchangeInfo() {
    try {
      const exchangeInfo = await this.pointToken.getExchangeInfo();
      return {
        success: true,
        data: {
          rate: exchangeInfo.rate.toString(),
          pzoDecimals: exchangeInfo.pzoDecimals.toString(),
          pointDecimals: exchangeInfo.pointDecimals.toString(),
        },
      };
    } catch (error) {
      console.error("Error getting exchange info:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Calculate points from PZO amount
  async calculatePointsFromPZO(pzoAmount) {
    try {
      const pzoAmountWei = ethers.utils.parseEther(pzoAmount.toString());
      const points = await this.pointToken.calculatePointsFromPZO(pzoAmountWei);
      return {
        success: true,
        points: ethers.utils.formatEther(points),
        pointsWei: points.toString(),
      };
    } catch (error) {
      console.error("Error calculating points:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Calculate PZO from points amount
  async calculatePZOFromPoints(pointAmount) {
    try {
      const pointAmountWei = ethers.utils.parseEther(pointAmount.toString());
      const pzo = await this.pointToken.calculatePZOFromPoints(pointAmountWei);
      return {
        success: true,
        pzo: ethers.utils.formatEther(pzo),
        pzoWei: pzo.toString(),
      };
    } catch (error) {
      console.error("Error calculating PZO:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Check if user has approved enough PZO for exchange
  async checkPZOApproval(userAddress, pzoAmount) {
    try {
      const pzoAmountWei = ethers.utils.parseEther(pzoAmount.toString());
      const allowance = await this.pzoToken.allowance(
        userAddress,
        process.env.POINT_TOKEN_ADDRESS
      );

      return {
        success: true,
        approved: allowance.gte(pzoAmountWei),
        allowance: ethers.utils.formatEther(allowance),
        required: ethers.utils.formatEther(pzoAmountWei),
      };
    } catch (error) {
      console.error("Error checking PZO approval:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get contract addresses
  async getContractAddresses() {
    try {
      return {
        success: true,
        data: {
          pzoToken: process.env.PZO_TOKEN_ADDRESS,
          pointToken: process.env.POINT_TOKEN_ADDRESS,
          network: "pioneZero",
          chainId: "5080",
        },
      };
    } catch (error) {
      console.error("Error getting contract addresses:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

const pointService = new PointService();
module.exports = { pointService };
