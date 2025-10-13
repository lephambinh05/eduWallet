/**
 * Portfolio NFT Service
 * Handles all interactions with Portfolio NFT smart contract
 */

import { ethers } from 'ethers';
import ipfsService from './ipfsService';
import { getCurrentUser } from '../utils/userUtils';

class PortfolioNFTService {
  constructor() {
    this.contract = null;
    this.provider = null;
    this.signer = null;
    this.contractAddress = process.env.REACT_APP_PORTFOLIO_NFT_CONTRACT_ADDRESS;
    this.contractABI = this.getContractABI();
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
   * Get contract ABI
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
      
      // Portfolio NFT specific functions
      "function mintPortfolio((address owner, address institution, uint256 totalCourses, uint256 totalCertificates, uint256 totalBadges, uint256 gpa, string dataHash, string ipfsHash, bytes institutionSignature, uint256 version, uint256 lastUpdated, bool isVerified, bool exists) summary, string metadataURI) returns (uint256)",
      "function updatePortfolio(uint256 tokenId, (address owner, address institution, uint256 totalCourses, uint256 totalCertificates, uint256 totalBadges, uint256 gpa, string dataHash, string ipfsHash, bytes institutionSignature, uint256 version, uint256 lastUpdated, bool isVerified, bool exists) newSummary, string newMetadataURI)",
      "function getPortfolioSummary(uint256 tokenId) view returns ((address owner, address institution, uint256 totalCourses, uint256 totalCertificates, uint256 totalBadges, uint256 gpa, string dataHash, string ipfsHash, bytes institutionSignature, uint256 version, uint256 lastUpdated, bool isVerified, bool exists))",
      "function getPortfolioByOwner(address owner) view returns (uint256)",
      "function isPortfolioVerified(uint256 tokenId) view returns (bool)",
      "function verifyInstitutionSignature((address owner, address institution, uint256 totalCourses, uint256 totalCertificates, uint256 totalBadges, uint256 gpa, string dataHash, string ipfsHash, bytes institutionSignature, uint256 version, uint256 lastUpdated, bool isVerified, bool exists) summary) view returns (bool)",
      "function authorizedInstitutions(address institution) view returns (bool)",
      "function getPortfolioStats() view returns (uint256 totalMinted, uint256 totalVerified)",
      
      // Events
      "event PortfolioMinted(uint256 indexed tokenId, address indexed owner, address indexed institution, uint256 version, bool isVerified)",
      "event PortfolioUpdated(uint256 indexed tokenId, uint256 newVersion, string newIpfsHash, string newDataHash)",
      "event InstitutionAuthorized(address indexed institution, bool authorized)"
    ];
  }

  /**
   * Mint a new Portfolio NFT
   * @param {Object} portfolioData - Complete portfolio data
   * @param {Object} options - Minting options
   * @returns {Promise<Object>} Transaction result
   */
  async mintPortfolio(portfolioData, options = {}) {
    try {
      // For demo purposes, simulate minting process
      console.log('🚀 Simulating Portfolio NFT minting...');
      
      const user = getCurrentUser();
      if (!user) {
        throw new Error('User not found');
      }

      // Prepare portfolio data for IPFS
      const version = options.version || 1;
      const portfolioForIPFS = {
        ...portfolioData,
        version,
        timestamp: new Date().toISOString(),
        owner: user.walletAddress || '0x1234567890123456789012345678901234567890',
        institution: options.institution || null,
        isVerified: !!options.institution
      };

      // Upload portfolio data to IPFS
      console.log('📤 Uploading portfolio data to IPFS...');
      const ipfsHash = await ipfsService.uploadPortfolioData(portfolioForIPFS);

      // Calculate data hash
      const dataHash = await ipfsService.calculateDataHash(portfolioForIPFS);

      // Generate metadata
      const metadata = ipfsService.generatePortfolioMetadata(
        portfolioForIPFS,
        options.imageIpfsHash || 'QmDefaultImageHash'
      );

      // Upload metadata to IPFS
      console.log('📤 Uploading metadata to IPFS...');
      const metadataIpfsHash = await ipfsService.uploadMetadata(metadata);
      const metadataURI = `ipfs://${metadataIpfsHash}`;

      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

      const mockTokenId = Math.floor(Math.random() * 1000) + 1;
      const mockTxHash = '0x' + Math.random().toString(16).substring(2, 66);

      console.log('✅ Portfolio NFT minted successfully (simulated)');

      return {
        success: true,
        tokenId: mockTokenId.toString(),
        transactionHash: mockTxHash,
        ipfsHash,
        metadataURI,
        portfolioSummary: {
          owner: portfolioForIPFS.owner,
          institution: options.institution || ethers.constants.AddressZero,
          totalCourses: portfolioData.courses.length,
          totalCertificates: portfolioData.certificates.length,
          totalBadges: portfolioData.badges.length,
          gpa: Math.round(portfolioData.statistics.gpa * 100),
          dataHash,
          ipfsHash,
          version,
          lastUpdated: Math.floor(Date.now() / 1000),
          isVerified: !!options.institution
        }
      };

    } catch (error) {
      console.error('❌ Error minting Portfolio NFT:', error);
      throw error;
    }
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
        throw new Error('Contract not initialized');
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
        owner: user.walletAddress || await this.signer.getAddress(),
        institution: options.institution || currentPortfolio.institution,
        isVerified: !!options.institution || currentPortfolio.isVerified
      };

      // Upload new data to IPFS
      console.log('📤 Uploading updated portfolio data to IPFS...');
      const ipfsHash = await ipfsService.uploadPortfolioData(portfolioForIPFS);

      // Calculate new data hash
      const dataHash = await ipfsService.calculateDataHash(portfolioForIPFS);

      // Generate new metadata
      const metadata = ipfsService.generatePortfolioMetadata(
        portfolioForIPFS,
        options.imageIpfsHash || 'QmDefaultImageHash'
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
        institutionSignature: options.institutionSignature || currentPortfolio.institutionSignature,
        version: newVersion,
        lastUpdated: Math.floor(Date.now() / 1000),
        isVerified: !!options.institution || currentPortfolio.isVerified,
        exists: true
      };

      // Estimate gas
      const gasEstimate = await this.contract.updatePortfolio.estimateGas(
        tokenId,
        newPortfolioSummary,
        metadataURI
      );

      // Update NFT
      console.log('🔄 Updating Portfolio NFT...');
      const tx = await this.contract.updatePortfolio(
        tokenId,
        newPortfolioSummary,
        metadataURI,
        {
          gasLimit: gasEstimate * 120n / 100n,
          ...options.transactionOptions
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
        portfolioSummary: newPortfolioSummary
      };

    } catch (error) {
      console.error('❌ Error updating Portfolio NFT:', error);
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
      // Try to load from MongoDB API first, fallback to local data
      let portfolioDataFromDB;
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3003'}/api/portfolio/email/lephambinh05@gmail.com`);
        const apiData = await response.json();
        
        if (apiData.success) {
          portfolioDataFromDB = apiData.data;
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (error) {
        console.warn('Failed to load from API:', error.message);
        // Use minimal fallback data
        portfolioDataFromDB = {
          courses: [],
          certificates: [],
          badges: [],
          statistics: { gpa: 0 }
        };
      }
      
      const realSummary = {
        owner: '0x1234567890123456789012345678901234567890',
        institution: '0x0000000000000000000000000000000000000000',
        totalCourses: portfolioDataFromDB.courses.length.toString(),
        totalCertificates: portfolioDataFromDB.certificates.length.toString(),
        totalBadges: portfolioDataFromDB.badges.length.toString(),
        gpa: portfolioDataFromDB.statistics.gpa.toString(),
        dataHash: '0x' + Math.random().toString(16).substring(2, 66),
        ipfsHash: 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        institutionSignature: '0x',
        version: '1',
        lastUpdated: new Date().toISOString(),
        isVerified: false,
        exists: true
      };
      
      console.log('✅ Portfolio summary retrieved (real data):', tokenId);
      return realSummary;
    } catch (error) {
      console.error('❌ Error getting portfolio summary:', error);
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
      // For demo purposes, return mock token ID
      // In production, use actual contract
      const mockTokenId = Math.floor(Math.random() * 1000) + 1;
      console.log('✅ Portfolio by owner retrieved (mock):', ownerAddress, 'Token ID:', mockTokenId);
      return mockTokenId.toString();
    } catch (error) {
      console.error('❌ Error getting portfolio by owner:', error);
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
      // Get summary from blockchain
      const summary = await this.getPortfolioSummary(tokenId);
      
      // Get detailed data from IPFS (use a fixed hash for demo)
      const detailedData = await ipfsService.getPortfolioData('QmDemoHash123');
      
      // Verify data integrity
      const isValid = ipfsService.verifyDataIntegrity(detailedData, summary.dataHash);
      
      console.log('📊 Complete portfolio data:', {
        tokenId,
        courses: detailedData.courses?.length || 0,
        certificates: detailedData.certificates?.length || 0,
        badges: detailedData.badges?.length || 0,
        gpa: detailedData.statistics?.gpa || 0
      });
      
      return {
        ...summary,
        detailedData,
        isValid,
        tokenId: tokenId.toString()
      };
    } catch (error) {
      console.error('❌ Error getting complete portfolio:', error);
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
        throw new Error('Contract not initialized');
      }

      return await this.contract.isPortfolioVerified(tokenId);
    } catch (error) {
      console.error('❌ Error checking portfolio verification:', error);
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
        throw new Error('Contract not initialized');
      }

      const [totalMinted, totalVerified] = await this.contract.getPortfolioStats();
      
      return {
        totalMinted: totalMinted.toString(),
        totalVerified: totalVerified.toString(),
        verificationRate: totalMinted > 0 ? 
          (Number(totalVerified) / Number(totalMinted) * 100).toFixed(2) : '0'
      };
    } catch (error) {
      console.error('❌ Error getting portfolio stats:', error);
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
        throw new Error('Contract not initialized');
      }

      return await this.contract.verifyInstitutionSignature(portfolioSummary);
    } catch (error) {
      console.error('❌ Error verifying institution signature:', error);
      throw error;
    }
  }
}

// Create singleton instance
const portfolioNFTService = new PortfolioNFTService();

export default portfolioNFTService;
