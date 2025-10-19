import { ethers } from 'ethers';

class PointService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.pzoToken = null;
    this.pointToken = null;
    this.contractAddresses = {
      pzoToken: process.env.REACT_APP_PZO_TOKEN_ADDRESS,
      pointToken: process.env.REACT_APP_POINT_TOKEN_ADDRESS
    };
    
    this.pzoTokenABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function transfer(address to, uint256 amount) returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) returns (bool)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function mint(address to, uint256 amount)",
      "function burn(uint256 amount)"
    ];

    this.pointTokenABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function exchangePZOToPoints(uint256 pzoAmount)",
      "function withdrawPointsToPZO(uint256 pointAmount)",
      "function getExchangeInfo() view returns (uint256 rate, uint256 pzoDecimals, uint256 pointDecimals)",
      "function calculatePointsFromPZO(uint256 pzoAmount) pure returns (uint256)",
      "function calculatePZOFromPoints(uint256 pointAmount) pure returns (uint256)",
      "event PointsExchanged(address indexed user, uint256 pzoAmount, uint256 pointAmount)",
      "event PointsWithdrawn(address indexed user, uint256 pointAmount, uint256 pzoAmount)"
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
        
        // Tạo contract instances
        this.pzoToken = new ethers.Contract(
          this.contractAddresses.pzoToken,
          this.pzoTokenABI,
          this.signer
        );

        this.pointToken = new ethers.Contract(
          this.contractAddresses.pointToken,
          this.pointTokenABI,
          this.signer
        );
        
        console.log('✅ Point Service connected:', await this.signer.getAddress());
        return true;
      } catch (error) {
        console.error('❌ Point Service connection failed:', error);
        return false;
      }
    } else {
      console.error('❌ MetaMask not installed');
      return false;
    }
  }

  // Lấy số dư PZO
  async getPZOBalance(userAddress) {
    try {
      const balance = await this.pzoToken.balanceOf(userAddress);
      return {
        success: true,
        balance: ethers.utils.formatEther(balance),
        balanceWei: balance.toString()
      };
    } catch (error) {
      console.error('Error getting PZO balance:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Lấy số dư Point
  async getPointBalance(userAddress) {
    try {
      const balance = await this.pointToken.balanceOf(userAddress);
      return {
        success: true,
        balance: ethers.utils.formatEther(balance),
        balanceWei: balance.toString()
      };
    } catch (error) {
      console.error('Error getting Point balance:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Lấy thông tin tỷ giá
  async getExchangeInfo() {
    try {
      const exchangeInfo = await this.pointToken.getExchangeInfo();
      return {
        success: true,
        data: {
          rate: exchangeInfo.rate.toString(),
          pzoDecimals: exchangeInfo.pzoDecimals.toString(),
          pointDecimals: exchangeInfo.pointDecimals.toString()
        }
      };
    } catch (error) {
      console.error('Error getting exchange info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Tính toán Point từ PZO
  async calculatePointsFromPZO(pzoAmount) {
    try {
      const pzoAmountWei = ethers.utils.parseEther(pzoAmount.toString());
      const points = await this.pointToken.calculatePointsFromPZO(pzoAmountWei);
      return {
        success: true,
        points: ethers.utils.formatEther(points),
        pointsWei: points.toString()
      };
    } catch (error) {
      console.error('Error calculating points:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Kiểm tra approval PZO
  async checkPZOApproval(userAddress, pzoAmount) {
    try {
      const pzoAmountWei = ethers.utils.parseEther(pzoAmount.toString());
      const allowance = await this.pzoToken.allowance(userAddress, this.contractAddresses.pointToken);
      
      return {
        success: true,
        approved: allowance.gte(pzoAmountWei),
        allowance: ethers.utils.formatEther(allowance),
        required: ethers.utils.formatEther(pzoAmountWei)
      };
    } catch (error) {
      console.error('Error checking PZO approval:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Approve PZO cho Point Token
  async approvePZO(pzoAmount) {
    try {
      const pzoAmountWei = ethers.utils.parseEther(pzoAmount.toString());
      const tx = await this.pzoToken.approve(this.contractAddresses.pointToken, pzoAmountWei);
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: tx.hash,
        receipt
      };
    } catch (error) {
      console.error('Error approving PZO:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Đổi PZO thành Point
  async exchangePZOToPoints(pzoAmount) {
    try {
      const pzoAmountWei = ethers.utils.parseEther(pzoAmount.toString());
      
      // Kiểm tra approval trước
      const userAddress = await this.signer.getAddress();
      const approvalCheck = await this.checkPZOApproval(userAddress, pzoAmount);
      
      if (!approvalCheck.success) {
        return {
          success: false,
          error: 'Failed to check approval: ' + approvalCheck.error
        };
      }
      
      if (!approvalCheck.approved) {
        return {
          success: false,
          error: 'PZO not approved. Please approve first.',
          needsApproval: true
        };
      }
      
      // Thực hiện exchange
      const tx = await this.pointToken.exchangePZOToPoints(pzoAmountWei);
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: tx.hash,
        receipt
      };
    } catch (error) {
      console.error('Error exchanging PZO to Points:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Rút Point về PZO
  async withdrawPointsToPZO(pointAmount) {
    try {
      const pointAmountWei = ethers.utils.parseEther(pointAmount.toString());
      const tx = await this.pointToken.withdrawPointsToPZO(pointAmountWei);
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: tx.hash,
        receipt
      };
    } catch (error) {
      console.error('Error withdrawing Points to PZO:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Lấy địa chỉ contract
  getContractAddresses() {
    return {
      success: true,
      data: {
        pzoToken: this.contractAddresses.pzoToken,
        pointToken: this.contractAddresses.pointToken,
        network: 'pioneZero',
        chainId: '5080'
      }
    };
  }
}

const pointService = new PointService();
export default pointService;

