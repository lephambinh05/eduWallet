import { ethers } from 'ethers';

class PortfolioContractService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.contractAddress = process.env.REACT_APP_PORTFOLIO_CONTRACT_ADDRESS;
    this.contractABI = [
      // Portfolio functions
      "function createPortfolio(string memory _title, string memory _description, string memory _projectHash, string[] memory _skills) external",
      "function getPortfolio(uint256 _id) external view returns (uint256 id, string memory title, string memory description, string memory projectHash, string[] memory skills, uint256 createdDate, address owner)",
      "function getStudentPortfolios(address _student) external view returns (uint256[] memory)",
      "function portfolioCount() external view returns (uint256)",
      
      // Events
      "event PortfolioCreated(uint256 indexed id, string title, address indexed owner)"
    ];
  }

  // Kết nối với MetaMask
  async connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Yêu cầu kết nối
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Tạo provider và signer (ethers v5 syntax)
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = this.provider.getSigner();
        
        // Tạo contract instance
        this.contract = new ethers.Contract(
          this.contractAddress,
          this.contractABI,
          this.signer
        );
        
        console.log('✅ Portfolio Contract connected:', await this.signer.getAddress());
        return true;
      } catch (error) {
        console.error('❌ Portfolio Contract connection failed:', error);
        return false;
      }
    } else {
      console.error('❌ MetaMask not installed');
      return false;
    }
  }

  // Tạo Portfolio NFT
  async createPortfolioNFT(portfolioData) {
    try {
      const {
        title,
        description,
        projectHash,
        skills
      } = portfolioData;

      const tx = await this.contract.createPortfolio(
        title,
        description,
        projectHash,
        skills
      );
      
      console.log('📝 Portfolio NFT transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Portfolio NFT transaction confirmed:', receipt);
      
      return {
        success: true,
        txHash: tx.hash,
        receipt: receipt,
        data: {
          title,
          description,
          projectHash,
          skills
        }
      };
    } catch (error) {
      console.error('❌ Create Portfolio NFT failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Lấy thông tin Portfolio
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
          createdDate: new Date(parseInt(portfolio.createdDate.toString()) * 1000),
          owner: portfolio.owner
        }
      };
    } catch (error) {
      console.error('❌ Get Portfolio failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Lấy danh sách Portfolio của sinh viên
  async getStudentPortfolios(studentAddress) {
    try {
      const portfolioIds = await this.contract.getStudentPortfolios(studentAddress);
      
      const portfolios = [];
      for (const id of portfolioIds) {
        const portfolio = await this.getPortfolio(id);
        if (portfolio.success) {
          portfolios.push(portfolio.data);
        }
      }
      
      return {
        success: true,
        data: portfolios
      };
    } catch (error) {
      console.error('❌ Get Student Portfolios failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Lấy tổng số Portfolio
  async getPortfolioCount() {
    try {
      const count = await this.contract.portfolioCount();
      return {
        success: true,
        data: count.toString()
      };
    } catch (error) {
      console.error('❌ Get Portfolio Count failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Lấy địa chỉ ví hiện tại
  async getCurrentAddress() {
    if (this.signer) {
      return await this.signer.getAddress();
    }
    return null;
  }

  // Kiểm tra kết nối
  isConnected() {
    return this.contract !== null && this.signer !== null;
  }
}

export default new PortfolioContractService();
