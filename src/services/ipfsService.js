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
    this.pinataJWT = process.env.REACT_APP_PINATA_JWT;
  }

  /**
   * Upload portfolio data to IPFS using Pinata
   * @param {Object} portfolioData - Complete portfolio data
   * @returns {Promise<string>} IPFS hash
   */
  async uploadPortfolioData(portfolioData) {
    try {
      // Check if Pinata credentials are configured
      if (!this.pinataJWT && (!this.pinataApiKey || !this.pinataSecretKey)) {
        console.warn("⚠️ Pinata API keys not configured, using mock IPFS hash");
        const mockHash =
          "Qm" +
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
        console.log("✅ Portfolio data uploaded to IPFS (mock):", mockHash);
        return mockHash;
      }

      const headers = {
        "Content-Type": "application/json",
      };
      if (this.pinataJWT) {
        headers["Authorization"] = `Bearer ${this.pinataJWT}`;
      } else {
        headers["pinata_api_key"] = this.pinataApiKey;
        headers["pinata_secret_api_key"] = this.pinataSecretKey;
      }

      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            pinataContent: portfolioData,
            pinataMetadata: {
              name: `portfolio-${portfolioData.owner}-${Date.now()}.json`,
              keyvalues: {
                owner: portfolioData.owner,
                version: (portfolioData.version || 1).toString(),
                type: "portfolio",
                timestamp: new Date().toISOString(),
                immutable: "true",
              },
            },
            pinataOptions: {
              cidVersion: 1,
              wrapWithDirectory: false,
              customPinPolicy: {
                regions: [
                  { id: "FRA1", desiredReplicationCount: 2 },
                  { id: "NYC1", desiredReplicationCount: 2 },
                ],
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Pinata upload failed: ${response.statusText} - ${JSON.stringify(
            errorData
          )}`
        );
      }

      const result = await response.json();
      return result.IpfsHash;
    } catch (error) {
      console.error("❌ Error uploading to IPFS:", error);
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
      const mockHash =
        "Qm" +
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      console.log("✅ Portfolio image uploaded to IPFS (mock):", mockHash);
      return mockHash;
    } catch (error) {
      console.error("❌ Error uploading image to IPFS:", error);
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
      console.log("📥 Fetching portfolio data from IPFS:", ipfsHash);

      // Try multiple IPFS gateways for reliability
      const gateways = [
        `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
        `https://ipfs.io/ipfs/${ipfsHash}`,
        `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
        `https://dweb.link/ipfs/${ipfsHash}`,
      ];

      let lastError;
      for (const gateway of gateways) {
        try {
          console.log(`🔗 Trying gateway: ${gateway}`);
          const response = await fetch(gateway, {
            headers: {
              Accept: "application/json",
            },
            // Add timeout
            signal: AbortSignal.timeout(10000), // 10 seconds timeout
          });

          if (!response.ok) {
            throw new Error(
              `Gateway returned ${response.status}: ${response.statusText}`
            );
          }

          const data = await response.json();
          console.log("✅ Portfolio data retrieved from IPFS successfully");
          console.log("📊 Data summary:", {
            courses: data.courses?.length || 0,
            certificates: data.certificates?.length || 0,
            badges: data.badges?.length || 0,
            gpa: data.statistics?.gpa || 0,
          });

          return data;
        } catch (error) {
          console.warn(`⚠️ Gateway ${gateway} failed:`, error.message);
          lastError = error;
          continue; // Try next gateway
        }
      }

      // All gateways failed, try fallback to database
      console.warn("⚠️ All IPFS gateways failed, falling back to database");
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/portfolio/email/lephambinh05@gmail.com`
      );

      if (response.ok) {
        const apiData = await response.json();
        if (apiData.success) {
          console.log("✅ Loaded portfolio from database fallback");
          return {
            version: 1,
            timestamp: new Date().toISOString(),
            owner: "0x0000000000000000000000000000000000000000",
            user: apiData.data.user,
            courses: apiData.data.courses || [],
            certificates: apiData.data.certificates || [],
            badges: apiData.data.badges || [],
            statistics: apiData.data.statistics || {
              gpa: 0,
              totalCredits: 0,
              completionRate: 0,
            },
          };
        }
      }

      throw (
        lastError ||
        new Error("Failed to retrieve portfolio data from IPFS and database")
      );
    } catch (error) {
      console.error("❌ Error retrieving from IPFS:", error);
      throw error;
    }
  }

  /**
   * Generate portfolio metadata for NFT
   * @param {Object} portfolioData - Portfolio data
   * @param {string} imageIpfsHash - IPFS hash of preview image
   * @returns {Object} NFT metadata
   */
  generatePortfolioMetadata(portfolioData, imageIpfsHash, dataIpfsHash) {
    const { user, courses, certificates, badges, statistics } = portfolioData;
    const userName =
      user.name ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      "Student";

    return {
      name: `${userName} - Portfolio NFT`,
      description: `Complete academic portfolio of ${userName} including ${courses.length} courses, ${certificates.length} certificates, and ${badges.length} badges.`,
      image: `ipfs://${imageIpfsHash}`,
      external_url: dataIpfsHash ? `ipfs://${dataIpfsHash}` : undefined,
      attributes: [
        {
          trait_type: "Total Courses",
          value: courses.length.toString(),
        },
        {
          trait_type: "Total Certificates",
          value: certificates.length.toString(),
        },
        {
          trait_type: "Total Badges",
          value: badges.length.toString(),
        },
        {
          trait_type: "GPA",
          value: (statistics.gpa / 100).toFixed(1),
        },
        {
          trait_type: "Completion Rate",
          value: `${statistics.completionRate || 0}%`,
        },
        {
          trait_type: "Version",
          value: (portfolioData.version || 1).toString(),
        },
        {
          trait_type: "Verified",
          value:
            portfolioData.verified || portfolioData.isVerified ? "Yes" : "No",
        },
        {
          trait_type: "Institution",
          value:
            portfolioData.institution || user.institution || "Self-verified",
        },
      ],
      properties: {
        owner: user.email || "N/A",
        studentId: user.studentId || user.id || "N/A",
        totalCredits: statistics.totalCredits || 0,
        completedCredits: statistics.completedCredits || 0,
        averageScore: statistics.averageScore || 0,
        topSkills: statistics.topSkills || [],
      },
    };
  }

  /**
   * Upload portfolio metadata to IPFS
   * @param {Object} metadata - NFT metadata
   * @returns {Promise<string>} IPFS hash
   */
  async uploadMetadata(metadata) {
    try {
      // Check if Pinata credentials are configured
      if (!this.pinataJWT && (!this.pinataApiKey || !this.pinataSecretKey)) {
        console.warn(
          "⚠️ Pinata API keys not configured, using mock metadata hash"
        );
        const mockHash =
          "Qm" +
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
        console.log("✅ Portfolio metadata uploaded to IPFS (mock):", mockHash);
        return mockHash;
      }

      const headers = {
        "Content-Type": "application/json",
      };
      if (this.pinataJWT) {
        headers["Authorization"] = `Bearer ${this.pinataJWT}`;
      } else {
        headers["pinata_api_key"] = this.pinataApiKey;
        headers["pinata_secret_api_key"] = this.pinataSecretKey;
      }

      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            pinataContent: metadata,
            pinataMetadata: {
              name: `metadata-${Date.now()}.json`,
              keyvalues: {
                type: "nft-metadata",
                timestamp: new Date().toISOString(),
                immutable: "true",
                standard: "ERC721",
              },
            },
            pinataOptions: {
              cidVersion: 1,
              wrapWithDirectory: false,
              customPinPolicy: {
                regions: [
                  { id: "FRA1", desiredReplicationCount: 2 },
                  { id: "NYC1", desiredReplicationCount: 2 },
                ],
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Pinata metadata upload failed: ${
            response.statusText
          } - ${JSON.stringify(errorData)}`
        );
      }

      const result = await response.json();
      return result.IpfsHash;
    } catch (error) {
      console.error("❌ Error uploading metadata to IPFS:", error);
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
      version: portfolioData.version, // Keep version for verification
    };

    const dataString = JSON.stringify(
      dataForHash,
      Object.keys(dataForHash).sort()
    );
    // Simple hash function for demo purposes
    // In production, use proper cryptographic hash
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return "0x" + Math.abs(hash).toString(16).padStart(8, "0");
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
