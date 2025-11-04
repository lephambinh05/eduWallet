/**
 * Portfolio NFT Service
 * Handles all interactions with Portfolio NFT smart contract
 */

import { ethers } from "ethers";
import ipfsService from "./ipfsService";
import { getCurrentUser } from "../utils/userUtils";
import logger from "../utils/logger";

class PortfolioNFTService {
  constructor() {
    this.contract = null;
    this.provider = null;
    this.signer = null;
    this.contractAddress = process.env.REACT_APP_PORTFOLIO_NFT_ADDRESS;
    this.contractABI = this.getContractABI();
    logger.log(
      "🔍 Portfolio NFT Service initialized with address:",
      this.contractAddress
    );
  }

  /**
   * Initialize service with provider and signer
   * @param {Object} provider - Ethers provider
   * @param {Object} signer - Ethers signer
   */
  async initialize(provider, signer) {
    this.provider = provider;
    this.signer = signer;

    if (this.contractAddress) {
      this.contract = new ethers.Contract(
        this.contractAddress,
        this.contractABI,
        signer
      );
    }
  }

  /**
   * Get contract ABI - Updated for new PortfolioNFT contract
   * @returns {Array} Contract ABI
   */
  getContractABI() {
    return [
      // ERC721 functions
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function tokenURI(uint256 tokenId) view returns (string)",
      "function ownerOf(uint256 tokenId) view returns (address)",
      "function balanceOf(address owner) view returns (uint256)",
      "function totalSupply() view returns (uint256)",

      // Portfolio NFT specific functions
      "function mintPortfolio(address to, string studentName, string studentId, string email, string institution, uint256 gpa, string ipfsHash, string metadataURI) returns (uint256)",
      "function getPortfolioInfo(uint256 tokenId) view returns (string studentName, string studentId, string email, string institution, uint256 gpa, uint256 mintDate, string ipfsHash, bool verified)",
      "function getOwnerTokens(address owner) view returns (uint256[])",
      "function verifyPortfolio(uint256 tokenId, bool verified)",

      // Events
      "event PortfolioMinted(uint256 indexed tokenId, address indexed owner, string studentName, string ipfsHash, uint256 mintDate)",
      "event PortfolioVerified(uint256 indexed tokenId, bool verified)",
    ];
  }

  /**
   * Mint a new Portfolio NFT (Updated for new contract)
   * @param {Object} portfolioData - Complete portfolio data
   * @param {Object} options - Minting options
   * @returns {Promise<Object>} Transaction result
   */
  async mintPortfolio(portfolioData, options = {}) {
    try {
      logger.log("🚀 Starting Portfolio NFT minting process...");

      // Check if contract is initialized
      if (!this.contract || !this.signer) {
        throw new Error(
          "Contract not initialized. Please connect wallet first."
        );
      }

      const user = getCurrentUser();
      if (!user) {
        throw new Error("User not found. Please login first.");
      }

      // Get wallet address
      const walletAddress = await this.signer.getAddress();
      logger.log("👤 Minting for address:", walletAddress);

      // Prepare portfolio data for IPFS
      const portfolioForIPFS = {
        ...portfolioData,
        timestamp: new Date().toISOString(),
        owner: walletAddress,
        institution: options.institution || user.institution || "Unknown",
      };

      // Upload portfolio data to IPFS
      logger.log("📤 Uploading portfolio data to IPFS...");
      const ipfsHash = await ipfsService.uploadPortfolioData(portfolioForIPFS);
      logger.log("✅ IPFS Hash:", ipfsHash);

      // Generate metadata
      const metadata = ipfsService.generatePortfolioMetadata(
        portfolioForIPFS,
        options.imageIpfsHash || "QmDefaultImageHash"
      );

      // Upload metadata to IPFS
      logger.log("📤 Uploading metadata to IPFS...");
      const metadataIpfsHash = await ipfsService.uploadMetadata(metadata);
      const metadataURI = `ipfs://${metadataIpfsHash}`;
      logger.log("✅ Metadata URI:", metadataURI);

      // Calculate GPA * 100 for contract
      const gpaValue = Math.round((portfolioData.statistics?.gpa || 0) * 100);

      // Mint NFT on blockchain
      logger.log("⛓️ Minting NFT on blockchain...");
      const tx = await this.contract.mintPortfolio(
        walletAddress, // to
        user.name || "Student", // studentName
        user.studentId || user.id || "N/A", // studentId
        user.email, // email
        user.institution || "Unknown", // institution
        gpaValue, // gpa (multiplied by 100)
        ipfsHash, // ipfsHash
        metadataURI // metadataURI
      );

      logger.log("⏳ Waiting for transaction confirmation...");
      logger.log("📝 Transaction hash:", tx.hash);

      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed!");

      // Get token ID from event or totalSupply
      let tokenId;
      try {
        const totalSupply = await this.contract.totalSupply();
        tokenId = totalSupply.sub(1); // Use BigNumber.sub() for ethers v5
        logger.log("🎉 Portfolio NFT minted successfully!");
        logger.log("   Token ID:", tokenId.toString());
      } catch (e) {
        logger.warn("⚠️ Could not get token ID from totalSupply:", e.message);
        // Fallback: try to parse from event
        if (receipt.logs && receipt.logs.length > 0) {
          const event = receipt.logs.find(
            (log) =>
              log.topics[0] ===
              ethers.utils.id("Transfer(address,address,uint256)")
          );
          if (event && event.topics[3]) {
            tokenId = ethers.BigNumber.from(event.topics[3]);
            logger.log("✅ Got token ID from event:", tokenId.toString());
          }
        }
        if (!tokenId) {
          logger.warn("⚠️ Could not determine token ID, using 0 as fallback");
          tokenId = ethers.BigNumber.from(0);
        }
      }

      // Save mint history locally and send to backend if logged in
      const mintRecord = {
        tokenId: tokenId ? tokenId.toString() : "unknown",
        txHash: tx.hash,
        transactionHash: tx.hash,
        ipfsHash,
        metadataURI,
        owner: walletAddress,
        studentName: user.name || "Student",
        timestamp: new Date().toISOString(),
        type: "portfolio_mint",
      };

      // Do not save mint history to localStorage anymore (persist to backend instead)

      // Try send to backend if user is logged in and backend URL is configured
      try {
        if (typeof window !== "undefined") {
          const accessToken = localStorage.getItem("accessToken");
          // Only attempt if accessToken present
          if (accessToken) {
            // Lazy import to avoid circular issues
            const api = await import("../config/api");
            await api.blockchainAPI.saveTransaction({
              txHash: tx.hash,
              type: "portfolio_mint",
              tokenId: tokenId ? tokenId.toString() : null,
              ipfsHash,
              metadataURI,
              to: walletAddress,
              metadata: { portfolioSummary: mintRecord.portfolioSummary },
            });
          }
        }
      } catch (e) {
        logger.warn(
          "⚠️ Could not persist mint record to backend:",
          e.message || e
        );
      }

      return {
        success: true,
        tokenId: tokenId ? tokenId.toString() : "unknown",
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        ipfsHash,
        metadataURI,
        portfolioSummary: {
          owner: walletAddress,
          studentName: user.name || "Student",
          studentId: user.studentId || user.id || "N/A",
          email: user.email,
          institution: user.institution || "Unknown",
          gpa: gpaValue / 100,
          totalCourses:
            (portfolioData.courses?.length || 0) +
            (portfolioData.completedCourses?.length || 0),
          totalCertificates: portfolioData.certificates?.length || 0,
          totalBadges: portfolioData.badges?.length || 0,
        },
      };
    } catch (error) {
      console.error("❌ Error minting Portfolio NFT:", error);
      throw error;
    }
  }

  // Persist a mint history record to browser localStorage
  _saveMintHistory(record) {
    if (typeof window === "undefined") return;
    const key = "portfolioMintHistory";
    const existingRaw = window.localStorage.getItem(key);
    let list = [];
    try {
      list = existingRaw ? JSON.parse(existingRaw) : [];
    } catch (_) {
      list = [];
    }
    // Prepend newest first
    list.unshift({
      ...record,
    });
    // Keep last 50 records to avoid unbounded growth
    if (list.length > 50) list = list.slice(0, 50);
    window.localStorage.setItem(key, JSON.stringify(list));
  }

  /**
   * Update existing Portfolio NFT
   * @param {number} tokenId - Token ID
   * @param {Object} newPortfolioData - New portfolio data
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Transaction result
   */
  async updatePortfolio(tokenId, newPortfolioData, options = {}) {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }

      // Get current portfolio
      const currentPortfolio = await this.getPortfolioSummary(tokenId);
      const newVersion = currentPortfolio.version + 1;

      // Prepare new portfolio data
      const user = getCurrentUser();
      const portfolioForIPFS = {
        ...newPortfolioData,
        version: newVersion,
        timestamp: new Date().toISOString(),
        owner: user.walletAddress || (await this.signer.getAddress()),
        institution: options.institution || currentPortfolio.institution,
        isVerified: !!options.institution || currentPortfolio.isVerified,
      };

      // Upload new data to IPFS
      console.log("📤 Uploading updated portfolio data to IPFS...");
      const ipfsHash = await ipfsService.uploadPortfolioData(portfolioForIPFS);

      // Calculate new data hash
      const dataHash = await ipfsService.calculateDataHash(portfolioForIPFS);

      // Generate new metadata
      const metadata = ipfsService.generatePortfolioMetadata(
        portfolioForIPFS,
        options.imageIpfsHash || "QmDefaultImageHash"
      );

      // Upload new metadata
      const metadataIpfsHash = await ipfsService.uploadMetadata(metadata);
      const metadataURI = `ipfs://${metadataIpfsHash}`;

      // Prepare new portfolio summary
      const newPortfolioSummary = {
        owner: currentPortfolio.owner,
        institution: options.institution || currentPortfolio.institution,
        totalCourses: newPortfolioData.courses.length,
        totalCertificates: newPortfolioData.certificates.length,
        totalBadges: newPortfolioData.badges.length,
        gpa: Math.round(newPortfolioData.statistics.gpa * 100),
        dataHash,
        ipfsHash,
        institutionSignature:
          options.institutionSignature || currentPortfolio.institutionSignature,
        version: newVersion,
        lastUpdated: Math.floor(Date.now() / 1000),
        isVerified: !!options.institution || currentPortfolio.isVerified,
        exists: true,
      };

      // Estimate gas
      const gasEstimate = await this.contract.updatePortfolio.estimateGas(
        tokenId,
        newPortfolioSummary,
        metadataURI
      );

      // Update NFT
      console.log("🔄 Updating Portfolio NFT...");
      const tx = await this.contract.updatePortfolio(
        tokenId,
        newPortfolioSummary,
        metadataURI,
        {
          gasLimit: (gasEstimate * 120n) / 100n,
          ...options.transactionOptions,
        }
      );

      const receipt = await tx.wait();

      return {
        success: true,
        tokenId,
        transactionHash: receipt.hash,
        ipfsHash,
        metadataURI,
        newVersion,
        portfolioSummary: newPortfolioSummary,
      };
    } catch (error) {
      console.error("❌ Error updating Portfolio NFT:", error);
      throw error;
    }
  }

  /**
   * Get portfolio summary from blockchain
   * @param {number} tokenId - Token ID
   * @returns {Promise<Object>} Portfolio summary
   */
  async getPortfolioSummary(tokenId) {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }

      logger.log(
        "🔍 Getting portfolio info from blockchain for token:",
        tokenId
      );

      // Call contract getPortfolioInfo function
      const portfolioInfo = await this.contract.getPortfolioInfo(tokenId);

      // portfolioInfo returns: studentName, studentId, email, institution, gpa, mintDate, ipfsHash, verified
      const [
        studentName,
        studentId,
        email,
        institution,
        gpa,
        mintDate,
        ipfsHash,
        verified,
      ] = portfolioInfo;

      // Get owner from ownerOf
      const owner = await this.contract.ownerOf(tokenId);

      const summary = {
        owner,
        studentName,
        studentId,
        email,
        institution,
        gpa: (gpa.toNumber() / 100).toFixed(2), // Convert back from uint256
        mintDate: new Date(mintDate.toNumber() * 1000).toISOString(),
        ipfsHash,
        verified,
        tokenId: tokenId.toString(),
        exists: true,
      };

      logger.log("✅ Portfolio summary retrieved from blockchain:", summary);
      return summary;
    } catch (error) {
      console.error("❌ Error getting portfolio summary:", error);
      throw error;
    }
  }

  /**
   * Get portfolio by owner address
   * @param {string} ownerAddress - Owner address
   * @returns {Promise<number|null>} Token ID or null
   */
  async getPortfolioByOwner(ownerAddress) {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }

      logger.log("🔍 Getting portfolio tokens for owner:", ownerAddress);

      // Call getOwnerTokens to get all tokens owned by address
      const tokens = await this.contract.getOwnerTokens(ownerAddress);

      if (tokens.length === 0) {
        logger.warn("⚠️ No portfolios found for owner:", ownerAddress);
        return null;
      }

      // Return first token ID
      const tokenId = tokens[0].toString();
      logger.log(
        "✅ Portfolio found for owner:",
        ownerAddress,
        "Token ID:",
        tokenId
      );
      return tokenId;
    } catch (error) {
      console.error("❌ Error getting portfolio by owner:", error);
      throw error;
    }
  }

  /**
   * Get complete portfolio data (blockchain + IPFS)
   * @param {number} tokenId - Token ID
   * @returns {Promise<Object>} Complete portfolio data
   */
  async getCompletePortfolio(tokenId) {
    try {
      logger.log("📥 Getting complete portfolio for token:", tokenId);

      // Get summary from blockchain (includes IPFS hash)
      const summary = await this.getPortfolioSummary(tokenId);

      logger.log("📦 Summary retrieved, IPFS hash:", summary.ipfsHash);

      // Get detailed data from IPFS using the hash stored on blockchain
      const detailedData = await ipfsService.getPortfolioData(summary.ipfsHash);

      logger.log("📊 Complete portfolio data:", {
        tokenId,
        ipfsHash: summary.ipfsHash,
        courses: detailedData.courses?.length || 0,
        certificates: detailedData.certificates?.length || 0,
        badges: detailedData.badges?.length || 0,
        gpa: detailedData.statistics?.gpa || summary.gpa || 0,
      });

      return {
        ...summary,
        detailedData,
        isValid: true, // Data is valid if we successfully retrieved it from IPFS
        tokenId: tokenId.toString(),
      };
    } catch (error) {
      console.error("❌ Error getting complete portfolio:", error);
      throw error;
    }
  }

  /**
   * Check if portfolio is verified
   * @param {number} tokenId - Token ID
   * @returns {Promise<boolean>} Verification status
   */
  async isPortfolioVerified(tokenId) {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }

      const info = await this.contract.getPortfolioInfo(tokenId);
      return info[7]; // verified is the 8th element (index 7)
    } catch (error) {
      console.error("❌ Error checking portfolio verification:", error);
      throw error;
    }
  }

  /**
   * Get all portfolio tokens owned by an address
   * @param {string} ownerAddress - Owner address
   * @returns {Promise<Array>} Array of token IDs
   */
  async getAllOwnerTokens(ownerAddress) {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }

      logger.log("🔍 Getting all tokens for owner:", ownerAddress);
      const tokens = await this.contract.getOwnerTokens(ownerAddress);
      const tokenIds = tokens.map((t) => t.toString());

      logger.log("✅ Found", tokenIds.length, "portfolio NFTs");
      return tokenIds;
    } catch (error) {
      console.error("❌ Error getting owner tokens:", error);
      throw error;
    }
  }

  /**
   * Get portfolio statistics
   * @returns {Promise<Object>} Portfolio stats
   */
  async getPortfolioStats() {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }

      const [totalMinted, totalVerified] =
        await this.contract.getPortfolioStats();

      return {
        totalMinted: totalMinted.toString(),
        totalVerified: totalVerified.toString(),
        verificationRate:
          totalMinted > 0
            ? ((Number(totalVerified) / Number(totalMinted)) * 100).toFixed(2)
            : "0",
      };
    } catch (error) {
      console.error("❌ Error getting portfolio stats:", error);
      throw error;
    }
  }

  /**
   * Verify institution signature
   * @param {Object} portfolioSummary - Portfolio summary
   * @returns {Promise<boolean>} Signature validity
   */
  async verifyInstitutionSignature(portfolioSummary) {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }

      return await this.contract.verifyInstitutionSignature(portfolioSummary);
    } catch (error) {
      console.error("❌ Error verifying institution signature:", error);
      throw error;
    }
  }
}

// Create singleton instance
const portfolioNFTService = new PortfolioNFTService();

export default portfolioNFTService;
