const { ethers } = require("ethers");
const { blockchainService } = require("./blockchainService");

// Compatibility: ethers v5 exposed providers under `ethers.providers`,
// while ethers v6 exposes providers at the top-level (e.g. `ethers.JsonRpcProvider`).
// Detect an available JsonRpcProvider implementation and use it. If none is
// available the service will skip initialization (degraded mode) to avoid
// crashing the whole app.
function resolveJsonRpcProvider() {
  if (ethers && ethers.providers && ethers.providers.JsonRpcProvider) {
    return ethers.providers.JsonRpcProvider;
  }
  if (ethers && ethers.JsonRpcProvider) {
    return ethers.JsonRpcProvider;
  }
  try {
    // Fallback to @ethersproject/providers if present (used by some v5 installs)
    // but it's optional; handle failure gracefully below.
    // eslint-disable-next-line import/no-extraneous-dependencies
    const { JsonRpcProvider } = require("@ethersproject/providers");
    if (JsonRpcProvider) return JsonRpcProvider;
  } catch (err) {
    // ignore
  }
  return null;
}

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
      // Validate required runtime environment variables early so we fail fast
      // with a clear message instead of attempting to construct contracts
      // with null/undefined addresses which leads to cryptic errors.
      const requiredEnv = [
        "RPC_URL",
        "PRIVATE_KEY",
        "PZO_TOKEN_ADDRESS",
        "POINT_TOKEN_ADDRESS",
      ];
      const missing = requiredEnv.filter((k) => !process.env[k]);
      if (missing.length > 0) {
        console.error(
          "❌ Point Service missing required environment variables:",
          missing.join(", ")
        );
        return;
      }

      // Resolve a JsonRpcProvider implementation compatible with installed ethers
      const JsonRpcProvider = resolveJsonRpcProvider();
      if (!JsonRpcProvider) {
        console.warn(
          "JsonRpcProvider not available — skipping PointService initialization (degraded mode)"
        );
        return;
      }

      // Initialize provider and signer
      this.provider = new JsonRpcProvider(process.env.RPC_URL);
      // ethers.Wallet exists on both v5 and v6 under the top-level export
      this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);

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

      this.pzoToken = new ethers.Contract(
        process.env.PZO_TOKEN_ADDRESS,
        pzoTokenABI,
        this.signer
      );

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

      this.pointToken = new ethers.Contract(
        process.env.POINT_TOKEN_ADDRESS,
        pointTokenABI,
        this.signer
      );

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
