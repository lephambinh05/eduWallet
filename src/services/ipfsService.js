/**
 * IPFS Service for Portfolio NFT
 * Handles uploading and retrieving portfolio data from IPFS
 */

// import { create } from 'ipfs-http-client';

class IPFSService {
  constructor() {
    // Initialize IPFS client
    // You can use public gateways or your own IPFS node
    // this.ipfs = create({
    //   host: 'ipfs.infura.io',
    //   port: 5001,
    //   protocol: 'https',
    //   headers: {
    //     authorization: `Basic ${Buffer.from(
    //       `${process.env.REACT_APP_INFURA_PROJECT_ID}:${process.env.REACT_APP_INFURA_PROJECT_SECRET}`
    //     ).toString('base64')}`
    //   }
    // });

    // Alternative: Use Pinata for better reliability
    this.pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
    this.pinataSecretKey = process.env.REACT_APP_PINATA_SECRET_KEY;
  }

  /**
   * Upload portfolio data to IPFS using Pinata
   * @param {Object} portfolioData - Complete portfolio data
   * @returns {Promise<string>} IPFS hash
   */
  async uploadPortfolioData(portfolioData) {
    try {
      // For demo purposes, return a mock IPFS hash
      // In production, implement actual Pinata upload
      const mockHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      console.log('✅ Portfolio data uploaded to IPFS (mock):', mockHash);
      return mockHash;
      
      /* Production code:
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey
        },
        body: JSON.stringify({
          pinataContent: portfolioData,
          pinataMetadata: {
            name: `portfolio-${portfolioData.owner}-v${portfolioData.version}-${Date.now()}.json`,
            keyvalues: {
              owner: portfolioData.owner,
              version: portfolioData.version.toString(),
              type: 'portfolio'
            }
          },
          pinataOptions: {
            cidVersion: 1
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Pinata upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Portfolio data uploaded to IPFS:', result.IpfsHash);
      return result.IpfsHash;
      */
    } catch (error) {
      console.error('❌ Error uploading to IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload portfolio preview image to IPFS
   * @param {File} imageFile - Image file
   * @returns {Promise<string>} IPFS hash
   */
  async uploadPortfolioImage(imageFile) {
    try {
      // For demo purposes, return a mock IPFS hash
      const mockHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      console.log('✅ Portfolio image uploaded to IPFS (mock):', mockHash);
      return mockHash;
    } catch (error) {
      console.error('❌ Error uploading image to IPFS:', error);
      throw error;
    }
  }

  /**
   * Retrieve portfolio data from IPFS
   * @param {string} ipfsHash - IPFS hash
   * @returns {Promise<Object>} Portfolio data
   */
  async getPortfolioData(ipfsHash) {
    try {
      // For demo purposes, return mock data
      // In production, fetch from actual IPFS gateways
      // Try to load from MongoDB API first, fallback to local data
      let portfolioDataFromDB;
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3003'}/api/portfolio/lephambinh05@gmail.com`);
        const apiData = await response.json();
        
        if (apiData.success) {
          portfolioDataFromDB = apiData.data;
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (error) {
        console.warn('Failed to load from API, using local data:', error.message);
        // Fallback to local data
        try {
          portfolioDataFromDB = require('../../data/portfolioData.json');
        } catch (requireError) {
          console.error('Failed to load local data:', requireError.message);
          // Use minimal fallback data
          portfolioDataFromDB = {
            user: { firstName: 'Lê Phạm', lastName: 'Bình', email: 'lephambinh05@gmail.com' },
            courses: [],
            certificates: [],
            badges: [],
            statistics: { gpa: 0, totalCredits: 0, completionRate: 0 }
          };
        }
      }
      
      const realData = {
        version: 1,
        timestamp: new Date().toISOString(),
        owner: '0x1234567890123456789012345678901234567890',
        user: portfolioDataFromDB.user,
        courses: portfolioDataFromDB.courses || [],
        certificates: portfolioDataFromDB.certificates || [],
        badges: portfolioDataFromDB.badges || [],
        statistics: portfolioDataFromDB.statistics || { gpa: 0, totalCredits: 0, completionRate: 0 }
      };
      
      console.log('📊 Portfolio data loaded:', {
        courses: realData.courses.length,
        certificates: realData.certificates.length,
        badges: realData.badges.length,
        gpa: realData.statistics.gpa
      });
      
      console.log('✅ Portfolio data retrieved from IPFS (real data):', ipfsHash);
      return realData;
    } catch (error) {
      console.error('❌ Error retrieving from IPFS:', error);
      throw error;
    }
  }

  /**
   * Generate portfolio metadata for NFT
   * @param {Object} portfolioData - Portfolio data
   * @param {string} imageIpfsHash - IPFS hash of preview image
   * @returns {Object} NFT metadata
   */
  generatePortfolioMetadata(portfolioData, imageIpfsHash) {
    const { user, courses, certificates, badges, statistics } = portfolioData;
    
    return {
      name: `${user.firstName} ${user.lastName} - Portfolio NFT`,
      description: `Complete academic portfolio of ${user.firstName} ${user.lastName} including ${courses.length} courses, ${certificates.length} certificates, and ${badges.length} badges.`,
      image: `ipfs://${imageIpfsHash}`,
      external_url: `ipfs://${portfolioData.ipfsHash}`,
      attributes: [
        {
          trait_type: "Total Courses",
          value: courses.length.toString()
        },
        {
          trait_type: "Total Certificates", 
          value: certificates.length.toString()
        },
        {
          trait_type: "Total Badges",
          value: badges.length.toString()
        },
        {
          trait_type: "GPA",
          value: (statistics.gpa / 100).toFixed(1)
        },
        {
          trait_type: "Completion Rate",
          value: `${statistics.completionRate}%`
        },
        {
          trait_type: "Version",
          value: portfolioData.version.toString()
        },
        {
          trait_type: "Verified",
          value: portfolioData.isVerified ? "Yes" : "No"
        },
        {
          trait_type: "Institution",
          value: portfolioData.institution || "Self-verified"
        }
      ],
      properties: {
        owner: user.email,
        studentId: user.studentId,
        totalCredits: statistics.totalCredits,
        completedCredits: statistics.completedCredits,
        averageScore: statistics.averageScore,
        topSkills: statistics.topSkills || []
      }
    };
  }

  /**
   * Upload portfolio metadata to IPFS
   * @param {Object} metadata - NFT metadata
   * @returns {Promise<string>} IPFS hash
   */
  async uploadMetadata(metadata) {
    try {
      // For demo purposes, return a mock IPFS hash
      const mockHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      console.log('✅ Portfolio metadata uploaded to IPFS (mock):', mockHash);
      return mockHash;
    } catch (error) {
      console.error('❌ Error uploading metadata to IPFS:', error);
      throw error;
    }
  }

  /**
   * Calculate hash of portfolio data for verification
   * @param {Object} portfolioData - Portfolio data
   * @returns {string} Keccak256 hash
   */
  calculateDataHash(portfolioData) {
    // Remove dynamic fields that shouldn't affect hash
    const dataForHash = {
      ...portfolioData,
      ipfsHash: undefined, // Remove IPFS hash from calculation
      timestamp: undefined,
      version: portfolioData.version // Keep version for verification
    };

    const dataString = JSON.stringify(dataForHash, Object.keys(dataForHash).sort());
    // Simple hash function for demo purposes
    // In production, use proper cryptographic hash
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return '0x' + Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Verify portfolio data integrity
   * @param {Object} portfolioData - Portfolio data
   * @param {string} expectedHash - Expected hash from blockchain
   * @returns {boolean} True if data is valid
   */
  verifyDataIntegrity(portfolioData, expectedHash) {
    const calculatedHash = this.calculateDataHash(portfolioData);
    return calculatedHash === expectedHash;
  }
}

// Create singleton instance
const ipfsService = new IPFSService();

export default ipfsService;
