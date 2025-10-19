const { ethers } = require('ethers');
const logger = require('../utils/logger');

/**
 * EduWalletDataStore Service
 * Service để tương tác với smart contract EduWalletDataStore
 */
class EduWalletDataStoreService {
  constructor(provider, wallet) {
    this.provider = provider;
    this.wallet = wallet;
    this.contract = null;
    this.contractAddress = process.env.EDUWALLET_DATASTORE_ADDRESS;
    
    if (this.contractAddress) {
      this.initializeContract();
    }
  }

  /**
   * Initialize smart contract instance
   */
  initializeContract() {
    try {
      // Contract ABI - cần cập nhật sau khi compile contract
      const contractABI = [
        // Learning Records
        "function addLearningRecord(string memory _studentName, string memory _institution, string memory _courseName, string memory _certificateHash, uint256 _score, address _student) external",
        "function getLearningRecord(uint256 _id) external view returns (uint256 id, string memory studentName, string memory institution, string memory courseName, string memory certificateHash, uint256 completionDate, uint256 score, bool verified, address issuer, address student)",
        "function getStudentRecords(address _student) external view returns (uint256[] memory)",
        
        // Badges
        "function earnBadge(string memory _name, string memory _description, string memory _imageHash, address _student) external",
        "function getBadge(uint256 _id) external view returns (uint256 id, string memory name, string memory description, string memory imageHash, uint256 earnedDate, address student, bool active)",
        "function getStudentBadges(address _student) external view returns (uint256[] memory)",
        
        // Portfolios
        "function createPortfolio(string memory _title, string memory _description, string memory _projectHash, string[] memory _skills) external",
        "function getPortfolio(uint256 _id) external view returns (uint256 id, string memory title, string memory description, string memory projectHash, string[] memory skills, uint256 createdDate, address owner)",
        "function getStudentPortfolios(address _student) external view returns (uint256[] memory)",
        
        // Authorization
        "function authorizeIssuer(address _issuer, bool _authorized) external",
        "function authorizedIssuers(address _issuer) external view returns (bool)",
        
        // Counts
        "function getCounts() external view returns (uint256 records, uint256 badges, uint256 portfolios)",
        "function recordCount() external view returns (uint256)",
        "function badgeCount() external view returns (uint256)",
        "function portfolioCount() external view returns (uint256)",
        
        // Owner
        "function owner() external view returns (address)",
        
        // Events
        "event LearningRecordAdded(uint256 indexed id, string studentName, string courseName, address indexed student)",
        "event BadgeEarned(uint256 indexed id, string name, address indexed student)",
        "event PortfolioCreated(uint256 indexed id, string title, address indexed owner)",
        "event IssuerAuthorized(address indexed issuer, bool authorized)"
      ];

      this.contract = new ethers.Contract(
        this.contractAddress,
        contractABI,
        this.wallet || this.provider
      );

      logger.info('EduWalletDataStore contract initialized', {
        address: this.contractAddress
      });
    } catch (error) {
      logger.error('Failed to initialize EduWalletDataStore contract:', error);
      throw error;
    }
  }

  /**
   * Thêm học bạ mới
   */
  async addLearningRecord(data) {
    try {
      const {
        studentName,
        institution,
        courseName,
        certificateHash,
        score,
        studentAddress
      } = data;

      const tx = await this.contract.addLearningRecord(
        studentName,
        institution,
        courseName,
        certificateHash,
        score,
        studentAddress
      );

      const receipt = await tx.wait();
      
      logger.info('Learning record added successfully', {
        txHash: tx.hash,
        studentAddress,
        courseName
      });

      return {
        success: true,
        txHash: tx.hash,
        receipt,
        data: {
          studentName,
          institution,
          courseName,
          score,
          studentAddress
        }
      };
    } catch (error) {
      logger.error('Failed to add learning record:', error);
      throw error;
    }
  }

  /**
   * Tạo badge mới
   */
  async earnBadge(data) {
    try {
      const {
        name,
        description,
        imageHash,
        studentAddress
      } = data;

      const tx = await this.contract.earnBadge(
        name,
        description,
        imageHash,
        studentAddress
      );

      const receipt = await tx.wait();
      
      logger.info('Badge earned successfully', {
        txHash: tx.hash,
        studentAddress,
        badgeName: name
      });

      return {
        success: true,
        txHash: tx.hash,
        receipt,
        data: {
          name,
          description,
          imageHash,
          studentAddress
        }
      };
    } catch (error) {
      logger.error('Failed to earn badge:', error);
      throw error;
    }
  }

  /**
   * Tạo portfolio mới
   */
  async createPortfolio(data) {
    try {
      const {
        title,
        description,
        projectHash,
        skills
      } = data;

      const tx = await this.contract.createPortfolio(
        title,
        description,
        projectHash,
        skills
      );

      const receipt = await tx.wait();
      
      logger.info('Portfolio created successfully', {
        txHash: tx.hash,
        title
      });

      return {
        success: true,
        txHash: tx.hash,
        receipt,
        data: {
          title,
          description,
          projectHash,
          skills
        }
      };
    } catch (error) {
      logger.error('Failed to create portfolio:', error);
      throw error;
    }
  }

  /**
   * Ủy quyền issuer mới
   */
  async authorizeIssuer(issuerAddress, authorized) {
    try {
      const tx = await this.contract.authorizeIssuer(issuerAddress, authorized);
      const receipt = await tx.wait();
      
      logger.info('Issuer authorization updated', {
        txHash: tx.hash,
        issuerAddress,
        authorized
      });

      return {
        success: true,
        txHash: tx.hash,
        receipt,
        data: {
          issuerAddress,
          authorized
        }
      };
    } catch (error) {
      logger.error('Failed to authorize issuer:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin học bạ
   */
  async getLearningRecord(recordId) {
    try {
      const record = await this.contract.getLearningRecord(recordId);
      
      return {
        success: true,
        data: {
          id: record.id.toString(),
          studentName: record.studentName,
          institution: record.institution,
          courseName: record.courseName,
          certificateHash: record.certificateHash,
          completionDate: record.completionDate.toString(),
          score: record.score.toString(),
          verified: record.verified,
          issuer: record.issuer,
          student: record.student
        }
      };
    } catch (error) {
      logger.error('Failed to get learning record:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin badge
   */
  async getBadge(badgeId) {
    try {
      const badge = await this.contract.getBadge(badgeId);
      
      return {
        success: true,
        data: {
          id: badge.id.toString(),
          name: badge.name,
          description: badge.description,
          imageHash: badge.imageHash,
          earnedDate: badge.earnedDate.toString(),
          student: badge.student,
          active: badge.active
        }
      };
    } catch (error) {
      logger.error('Failed to get badge:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin portfolio
   */
  async getPortfolio(portfolioId) {
    try {
      const portfolio = await this.contract.getPortfolio(portfolioId);
      
      return {
        success: true,
        data: {
          id: portfolio.id.toString(),
          title: portfolio.title,
          description: portfolio.description,
          projectHash: portfolio.projectHash,
          skills: portfolio.skills,
          createdDate: portfolio.createdDate.toString(),
          owner: portfolio.owner
        }
      };
    } catch (error) {
      logger.error('Failed to get portfolio:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách học bạ của sinh viên
   */
  async getStudentRecords(studentAddress) {
    try {
      const recordIds = await this.contract.getStudentRecords(studentAddress);
      
      const records = [];
      for (const id of recordIds) {
        const record = await this.getLearningRecord(id);
        records.push(record.data);
      }
      
      return {
        success: true,
        data: records
      };
    } catch (error) {
      logger.error('Failed to get student records:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách badge của sinh viên
   */
  async getStudentBadges(studentAddress) {
    try {
      const badgeIds = await this.contract.getStudentBadges(studentAddress);
      
      const badges = [];
      for (const id of badgeIds) {
        const badge = await this.getBadge(id);
        badges.push(badge.data);
      }
      
      return {
        success: true,
        data: badges
      };
    } catch (error) {
      logger.error('Failed to get student badges:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách portfolio của sinh viên
   */
  async getStudentPortfolios(studentAddress) {
    try {
      const portfolioIds = await this.contract.getStudentPortfolios(studentAddress);
      
      const portfolios = [];
      for (const id of portfolioIds) {
        const portfolio = await this.getPortfolio(id);
        portfolios.push(portfolio.data);
      }
      
      return {
        success: true,
        data: portfolios
      };
    } catch (error) {
      logger.error('Failed to get student portfolios:', error);
      throw error;
    }
  }

  /**
   * Lấy tổng số records, badges, portfolios
   */
  async getCounts() {
    try {
      const counts = await this.contract.getCounts();
      
      return {
        success: true,
        data: {
          records: counts.records.toString(),
          badges: counts.badges.toString(),
          portfolios: counts.portfolios.toString()
        }
      };
    } catch (error) {
      logger.error('Failed to get counts:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra quyền issuer
   */
  async isAuthorizedIssuer(address) {
    try {
      const isAuthorized = await this.contract.authorizedIssuers(address);
      return {
        success: true,
        data: {
          address,
          isAuthorized
        }
      };
    } catch (error) {
      logger.error('Failed to check issuer authorization:', error);
      throw error;
    }
  }

  /**
   * Lấy owner của contract
   */
  async getOwner() {
    try {
      const owner = await this.contract.owner();
      return {
        success: true,
        data: {
          owner
        }
      };
    } catch (error) {
      logger.error('Failed to get contract owner:', error);
      throw error;
    }
  }
}

module.exports = EduWalletDataStoreService;
