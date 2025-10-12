# EduWallet Smart Contracts - Integration Guide

## Tổng quan

Hướng dẫn này sẽ giúp bạn tích hợp các smart contracts của EduWallet vào ứng dụng React frontend. Hệ thống bao gồm 5 contracts chính:

1. **EDUToken** - Token ERC-20 cho hệ thống phần thưởng
2. **LearnPassNFT** - NFT ERC-721 cho hộ chiếu học tập
3. **CertificateNFT** - NFT ERC-721 cho chứng chỉ học tập
4. **EduWalletFactory** - Factory contract quản lý toàn bộ hệ thống
5. **EduWalletMarketplace** - Marketplace cho việc đổi thưởng

## Cài đặt Dependencies

### 1. Cài đặt các package cần thiết

```bash
npm install ethers @openzeppelin/contracts
npm install --save-dev @types/node
```

### 2. Cấu hình Environment Variables

Tạo file `.env` trong thư mục root của dự án:

```env
# Network Configuration
REACT_APP_NETWORK_NAME=Pione Zero
REACT_APP_CHAIN_ID=5080
REACT_APP_RPC_URL=https://rpc.zeroscan.org

# Alternative networks
REACT_APP_PIONE_CHAIN_ID=5090
REACT_APP_PIONE_CHAIN_RPC_URL=https://rpc.pionescan.com

# Contract Addresses (sau khi deploy)
REACT_APP_EDU_TOKEN_ADDRESS=0x...
REACT_APP_LEARNPASS_NFT_ADDRESS=0x...
REACT_APP_CERTIFICATE_NFT_ADDRESS=0x...
REACT_APP_FACTORY_ADDRESS=0x...
REACT_APP_MARKETPLACE_ADDRESS=0x...

# Base URI for NFT metadata
REACT_APP_BASE_TOKEN_URI=https://api.eduwallet.com/metadata/
```

## Contract ABIs và Addresses

### 1. Tạo file contract configuration

```javascript
// src/config/contracts.js
export const CONTRACT_ADDRESSES = {
  EDU_TOKEN: process.env.REACT_APP_EDU_TOKEN_ADDRESS,
  LEARNPASS_NFT: process.env.REACT_APP_LEARNPASS_NFT_ADDRESS,
  CERTIFICATE_NFT: process.env.REACT_APP_CERTIFICATE_NFT_ADDRESS,
  FACTORY: process.env.REACT_APP_FACTORY_ADDRESS,
  MARKETPLACE: process.env.REACT_APP_MARKETPLACE_ADDRESS,
};

export const NETWORK_CONFIG = {
  name: process.env.REACT_APP_NETWORK_NAME,
  chainId: parseInt(process.env.REACT_APP_CHAIN_ID),
  rpcUrl: process.env.REACT_APP_RPC_URL,
};

export const BASE_TOKEN_URI = process.env.REACT_APP_BASE_TOKEN_URI;
```

### 2. Import ABIs

```javascript
// src/contracts/abis.js
import EDU_TOKEN_ABI from './abis/EDUToken.json';
import LEARNPASS_NFT_ABI from './abis/LearnPassNFT.json';
import CERTIFICATE_NFT_ABI from './abis/CertificateNFT.json';
import FACTORY_ABI from './abis/EduWalletFactory.json';
import MARKETPLACE_ABI from './abis/EduWalletMarketplace.json';

export {
  EDU_TOKEN_ABI,
  LEARNPASS_NFT_ABI,
  CERTIFICATE_NFT_ABI,
  FACTORY_ABI,
  MARKETPLACE_ABI,
};
```

## Blockchain Service Layer

### 1. Tạo Blockchain Service

```javascript
// src/services/blockchainService.js
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from '../config/contracts';
import {
  EDU_TOKEN_ABI,
  LEARNPASS_NFT_ABI,
  CERTIFICATE_NFT_ABI,
  FACTORY_ABI,
  MARKETPLACE_ABI,
} from '../contracts/abis';

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
  }

  // Kết nối wallet
  async connectWallet() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    
    // Kiểm tra network
    const network = await this.provider.getNetwork();
    if (network.chainId !== BigInt(NETWORK_CONFIG.chainId)) {
      await this.switchNetwork();
    }

    this.initializeContracts();
    return this.signer.address;
  }

  // Chuyển đổi network
  async switchNetwork() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
      });
    } catch (switchError) {
      // Nếu network chưa được thêm vào MetaMask
      if (switchError.code === 4902) {
        const networkConfig = {
          chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
          chainName: NETWORK_CONFIG.name,
          rpcUrls: [NETWORK_CONFIG.rpcUrl],
          nativeCurrency: {
            name: NETWORK_CONFIG.chainId === 5080 ? 'PZO' : 'PIO',
            symbol: NETWORK_CONFIG.chainId === 5080 ? 'PZO' : 'PIO',
            decimals: 18,
          },
          blockExplorerUrls: [
            NETWORK_CONFIG.chainId === 5080 
              ? 'https://zeroscan.org/' 
              : 'https://scan.pionechain.com/'
          ],
        };
        
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [networkConfig],
        });
      }
    }
  }

  // Khởi tạo contracts
  initializeContracts() {
    this.contracts = {
      eduToken: new ethers.Contract(
        CONTRACT_ADDRESSES.EDU_TOKEN,
        EDU_TOKEN_ABI,
        this.signer
      ),
      learnPassNFT: new ethers.Contract(
        CONTRACT_ADDRESSES.LEARNPASS_NFT,
        LEARNPASS_NFT_ABI,
        this.signer
      ),
      certificateNFT: new ethers.Contract(
        CONTRACT_ADDRESSES.CERTIFICATE_NFT,
        CERTIFICATE_NFT_ABI,
        this.signer
      ),
      factory: new ethers.Contract(
        CONTRACT_ADDRESSES.FACTORY,
        FACTORY_ABI,
        this.signer
      ),
      marketplace: new ethers.Contract(
        CONTRACT_ADDRESSES.MARKETPLACE,
        MARKETPLACE_ABI,
        this.signer
      ),
    };
  }

  // Lấy số dư EDU token
  async getEDUBalance(address) {
    const balance = await this.contracts.eduToken.balanceOf(address);
    return ethers.formatEther(balance);
  }

  // Lấy thông tin LearnPass
  async getLearnPassData(tokenId) {
    return await this.contracts.learnPassNFT.getLearnPassData(tokenId);
  }

  // Lấy danh sách chứng chỉ của student
  async getStudentCertificates(studentAddress) {
    return await this.contracts.factory.getStudentCertificates(studentAddress);
  }

  // Mua sản phẩm trên marketplace
  async purchaseProduct(productId, quantity, deliveryAddress = '') {
    const product = await this.contracts.marketplace.getProduct(productId);
    const totalPrice = product.price * BigInt(quantity);
    
    // Approve EDU tokens
    const approveTx = await this.contracts.eduToken.approve(
      CONTRACT_ADDRESSES.MARKETPLACE,
      totalPrice
    );
    await approveTx.wait();

    // Purchase product
    const purchaseTx = await this.contracts.marketplace.purchaseProduct(
      productId,
      quantity,
      deliveryAddress
    );
    const receipt = await purchaseTx.wait();
    
    return receipt;
  }
}

export default new BlockchainService();
```

## React Hooks cho Blockchain

### 1. Wallet Hook

```javascript
// src/hooks/useWallet.js
import { useState, useEffect, useCallback } from 'react';
import blockchainService from '../services/blockchainService';

export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState('0');

  const connectWallet = useCallback(async () => {
    try {
      setIsConnecting(true);
      const address = await blockchainService.connectWallet();
      setAccount(address);
      setIsConnected(true);
      
      // Lấy số dư EDU token
      const eduBalance = await blockchainService.getEDUBalance(address);
      setBalance(eduBalance);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setBalance('0');
  }, []);

  // Lắng nghe thay đổi account
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, [disconnectWallet]);

  return {
    account,
    isConnected,
    isConnecting,
    balance,
    connectWallet,
    disconnectWallet,
  };
};
```

### 2. LearnPass Hook

```javascript
// src/hooks/useLearnPass.js
import { useState, useEffect } from 'react';
import blockchainService from '../services/blockchainService';

export const useLearnPass = (studentAddress) => {
  const [learnPassData, setLearnPassData] = useState(null);
  const [courseCompletions, setCourseCompletions] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLearnPassData = async () => {
    if (!studentAddress) return;

    try {
      setLoading(true);
      
      // Lấy token ID của LearnPass
      const tokenId = await blockchainService.contracts.factory.getStudentLearnPass(studentAddress);
      
      if (tokenId > 0) {
        // Lấy thông tin LearnPass
        const data = await blockchainService.getLearnPassData(tokenId);
        setLearnPassData(data);

        // Lấy danh sách khóa học đã hoàn thành
        const courses = await blockchainService.contracts.learnPassNFT.getCourseCompletions(tokenId);
        setCourseCompletions(courses);

        // Lấy danh sách badges
        const badgeList = await blockchainService.contracts.learnPassNFT.getBadges(tokenId);
        setBadges(badgeList);
      }
    } catch (error) {
      console.error('Failed to fetch LearnPass data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearnPassData();
  }, [studentAddress]);

  return {
    learnPassData,
    courseCompletions,
    badges,
    loading,
    refetch: fetchLearnPassData,
  };
};
```

### 3. Marketplace Hook

```javascript
// src/hooks/useMarketplace.js
import { useState, useEffect } from 'react';
import blockchainService from '../services/blockchainService';

export const useMarketplace = () => {
  const [products, setProducts] = useState([]);
  const [userPurchases, setUserPurchases] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productIds = await blockchainService.contracts.marketplace.getAllProductIds();
      
      const productList = await Promise.all(
        productIds.map(async (id) => {
          const product = await blockchainService.contracts.marketplace.getProduct(id);
          return {
            id: id.toString(),
            ...product,
            price: ethers.formatEther(product.price),
          };
        })
      );
      
      setProducts(productList);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPurchases = async (userAddress) => {
    if (!userAddress) return;

    try {
      const purchaseIds = await blockchainService.contracts.marketplace.getUserPurchases(userAddress);
      
      const purchaseList = await Promise.all(
        purchaseIds.map(async (id) => {
          const purchase = await blockchainService.contracts.marketplace.getPurchase(id);
          return {
            id: id.toString(),
            ...purchase,
            totalPrice: ethers.formatEther(purchase.totalPrice),
          };
        })
      );
      
      setUserPurchases(purchaseList);
    } catch (error) {
      console.error('Failed to fetch user purchases:', error);
    }
  };

  const purchaseProduct = async (productId, quantity, deliveryAddress = '') => {
    try {
      setLoading(true);
      const receipt = await blockchainService.purchaseProduct(productId, quantity, deliveryAddress);
      return receipt;
    } catch (error) {
      console.error('Failed to purchase product:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    userPurchases,
    loading,
    fetchProducts,
    fetchUserPurchases,
    purchaseProduct,
  };
};
```

## React Components

### 1. Wallet Connection Component

```javascript
// src/components/WalletConnection.jsx
import React from 'react';
import { useWallet } from '../hooks/useWallet';

const WalletConnection = () => {
  const { account, isConnected, isConnecting, balance, connectWallet, disconnectWallet } = useWallet();

  if (isConnected) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <p>Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
          <p>EDU Balance: {balance} EDU</p>
        </div>
        <button onClick={disconnectWallet} className="btn-disconnect">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={connectWallet} 
      disabled={isConnecting}
      className="btn-connect"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
};

export default WalletConnection;
```

### 2. LearnPass Display Component

```javascript
// src/components/LearnPassDisplay.jsx
import React from 'react';
import { useLearnPass } from '../hooks/useLearnPass';

const LearnPassDisplay = ({ studentAddress }) => {
  const { learnPassData, courseCompletions, badges, loading } = useLearnPass(studentAddress);

  if (loading) {
    return <div>Loading LearnPass data...</div>;
  }

  if (!learnPassData) {
    return <div>No LearnPass found for this student.</div>;
  }

  return (
    <div className="learnpass-display">
      <div className="learnpass-header">
        <h2>LearnPass NFT</h2>
        <div className="student-info">
          <h3>{learnPassData.studentName}</h3>
          <p>Student ID: {learnPassData.studentId}</p>
          <p>Institution: {learnPassData.institutionName}</p>
          <p>Major: {learnPassData.major}</p>
          <p>GPA: {(learnPassData.gpa / 100).toFixed(2)}</p>
        </div>
      </div>

      <div className="course-completions">
        <h3>Course Completions</h3>
        {courseCompletions.map((course, index) => (
          <div key={index} className="course-item">
            <h4>{course.courseName}</h4>
            <p>Grade: {(course.grade / 100).toFixed(1)}%</p>
            <p>Credit Hours: {course.creditHours}</p>
            <p>Completed: {new Date(course.completionDate * 1000).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      <div className="badges">
        <h3>Badges Earned</h3>
        {badges.map((badge, index) => (
          <div key={index} className="badge-item">
            <h4>{badge.badgeName}</h4>
            <p>{badge.badgeDescription}</p>
            <p>Type: {badge.badgeType}</p>
            <p>Earned: {new Date(badge.earnedDate * 1000).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearnPassDisplay;
```

### 3. Marketplace Component

```javascript
// src/components/Marketplace.jsx
import React, { useState } from 'react';
import { useMarketplace } from '../hooks/useMarketplace';
import { useWallet } from '../hooks/useWallet';

const Marketplace = () => {
  const { products, loading, purchaseProduct } = useMarketplace();
  const { account, balance } = useWallet();
  const [purchasing, setPurchasing] = useState({});

  const handlePurchase = async (productId, quantity = 1) => {
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setPurchasing(prev => ({ ...prev, [productId]: true }));
      await purchaseProduct(productId, quantity);
      alert('Purchase successful!');
    } catch (error) {
      alert(`Purchase failed: ${error.message}`);
    } finally {
      setPurchasing(prev => ({ ...prev, [productId]: false }));
    }
  };

  if (loading) {
    return <div>Loading marketplace...</div>;
  }

  return (
    <div className="marketplace">
      <h2>EduWallet Marketplace</h2>
      <div className="balance-info">
        <p>Your EDU Balance: {balance} EDU</p>
      </div>
      
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>Category: {product.category}</p>
            <p>Price: {product.price} EDU</p>
            <p>Stock: {product.stockQuantity}</p>
            <p>Type: {product.isDigital ? 'Digital' : 'Physical'}</p>
            
            <button
              onClick={() => handlePurchase(product.id)}
              disabled={purchasing[product.id] || product.stockQuantity === 0}
              className="btn-purchase"
            >
              {purchasing[product.id] ? 'Purchasing...' : 'Purchase'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
```

## Error Handling và Loading States

### 1. Error Boundary Component

```javascript
// src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Blockchain Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong with the blockchain connection.</h2>
          <p>Error: {this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### 2. Loading Component

```javascript
// src/components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
```

## Testing

### 1. Unit Tests cho Blockchain Service

```javascript
// src/services/__tests__/blockchainService.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import blockchainService from '../blockchainService';

// Mock ethers
vi.mock('ethers', () => ({
  ethers: {
    BrowserProvider: vi.fn(),
    Contract: vi.fn(),
    formatEther: vi.fn(),
  },
}));

describe('BlockchainService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should connect wallet successfully', async () => {
    const mockAddress = '0x1234567890123456789012345678901234567890';
    const mockProvider = {
      getSigner: vi.fn().mockResolvedValue({ address: mockAddress }),
      getNetwork: vi.fn().mockResolvedValue({ chainId: 80001n }),
    };

    vi.mocked(ethers.BrowserProvider).mockReturnValue(mockProvider);

    const address = await blockchainService.connectWallet();
    expect(address).toBe(mockAddress);
  });
});
```

## Best Practices

### 1. Gas Optimization
- Sử dụng `estimateGas` trước khi thực hiện transaction
- Implement retry logic cho failed transactions
- Sử dụng batch transactions khi có thể

### 2. Security
- Validate tất cả input từ user
- Sử dụng proper error handling
- Implement rate limiting cho API calls

### 3. User Experience
- Hiển thị loading states
- Provide clear error messages
- Implement transaction status tracking

### 4. Performance
- Cache contract data khi có thể
- Sử dụng React.memo cho components
- Implement pagination cho large data sets

## Troubleshooting

### Common Issues

1. **"MetaMask not installed"**
   - Hướng dẫn user cài đặt MetaMask
   - Provide fallback options

2. **"Wrong network"**
   - Tự động chuyển đổi network
   - Hiển thị hướng dẫn thêm network

3. **"Insufficient funds"**
   - Check EDU token balance
   - Check MATIC balance for gas fees

4. **"Transaction failed"**
   - Increase gas limit
   - Check contract permissions
   - Verify contract addresses

### Debug Tools

```javascript
// src/utils/debug.js
export const debugTransaction = async (tx) => {
  console.log('Transaction hash:', tx.hash);
  console.log('Gas used:', tx.gasUsed?.toString());
  console.log('Gas price:', tx.gasPrice?.toString());
  console.log('Block number:', tx.blockNumber);
};

export const debugContractCall = async (contract, method, ...args) => {
  try {
    console.log(`Calling ${method} with args:`, args);
    const result = await contract[method](...args);
    console.log(`Result:`, result);
    return result;
  } catch (error) {
    console.error(`Error calling ${method}:`, error);
    throw error;
  }
};
```

## Kết luận

Hướng dẫn này cung cấp một foundation vững chắc để tích hợp EduWallet smart contracts vào React frontend. Hãy nhớ:

1. Test thoroughly trên testnet trước khi deploy lên mainnet
2. Implement proper error handling và user feedback
3. Optimize gas usage và transaction costs
4. Keep contracts và frontend code synchronized
5. Monitor và log tất cả blockchain interactions

Để biết thêm thông tin chi tiết, tham khảo documentation của từng contract hoặc liên hệ team development.
