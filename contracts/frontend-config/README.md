# EduWallet Frontend Configuration

## Blockchain Network Configuration

File này chứa cấu hình blockchain cho frontend React của EduWallet, sử dụng **Pione Zero Chain** và **Pione Chain** thay vì Polygon Mumbai.

## Networks được hỗ trợ

### 1. Pione Zero Chain (Testnet)
- **Chain ID**: 5080
- **Currency**: PZO
- **RPC URL**: https://rpc.zeroscan.org
- **Explorer**: https://zeroscan.org
- **Mục đích**: Testing và development

### 2. Pione Chain (Mainnet)
- **Chain ID**: 5090
- **Currency**: PIO
- **RPC URL**: https://rpc.pionescan.com
- **Explorer**: https://scan.pionechain.com
- **Mục đích**: Production

### 3. Polygon (Backup)
- **Chain ID**: 137
- **Currency**: MATIC
- **RPC URL**: https://polygon-rpc.com
- **Explorer**: https://polygonscan.com
- **Mục đích**: Backup option

## Cách sử dụng

### 1. Import configuration

```javascript
import { 
  BLOCKCHAIN_NETWORKS, 
  DEFAULT_NETWORK, 
  getNetworkConfig,
  getContractAddresses,
  NetworkUtils 
} from './blockchainConfig';
```

### 2. Kết nối với network

```javascript
// Lấy network config cho MetaMask
const networkConfig = getNetworkConfig('pioneZero');

// Thêm network vào MetaMask
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [networkConfig],
});
```

### 3. Lấy contract addresses

```javascript
// Lấy addresses cho network hiện tại
const addresses = getContractAddresses('pioneZero');
console.log('Factory Address:', addresses.FACTORY);
```

### 4. Kiểm tra network

```javascript
// Kiểm tra network có được hỗ trợ không
const isSupported = NetworkUtils.isSupportedNetwork(chainId);

// Lấy tên network
const networkName = NetworkUtils.getNetworkName(chainId);
```

## Environment Variables

Cập nhật file `.env` với các biến sau:

```env
# Default network
REACT_APP_DEFAULT_NETWORK=pioneZero

# Contract addresses for Pione Zero
REACT_APP_EDU_TOKEN_ADDRESS=0x...
REACT_APP_LEARNPASS_NFT_ADDRESS=0x...
REACT_APP_CERTIFICATE_NFT_ADDRESS=0x...
REACT_APP_FACTORY_ADDRESS=0x...
REACT_APP_MARKETPLACE_ADDRESS=0x...

# Contract addresses for Pione Chain
REACT_APP_PIONE_CHAIN_EDU_TOKEN_ADDRESS=0x...
REACT_APP_PIONE_CHAIN_LEARNPASS_NFT_ADDRESS=0x...
REACT_APP_PIONE_CHAIN_CERTIFICATE_NFT_ADDRESS=0x...
REACT_APP_PIONE_CHAIN_FACTORY_ADDRESS=0x...
REACT_APP_PIONE_CHAIN_MARKETPLACE_ADDRESS=0x...

# Base URI for NFT metadata
REACT_APP_BASE_TOKEN_URI=https://api.eduwallet.com/metadata/

# API configuration
REACT_APP_API_BASE_URL=https://api.eduwallet.com

# Feature flags
REACT_APP_ENABLE_MARKETPLACE=true
REACT_APP_ENABLE_REWARDS=true
REACT_APP_ENABLE_VERIFICATION=true
```

## MetaMask Configuration

### Thêm Pione Zero Chain vào MetaMask

```javascript
const addPioneZeroNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x13d8', // 5080 in hex
        chainName: 'Pione Zero',
        rpcUrls: ['https://rpc.zeroscan.org'],
        nativeCurrency: {
          name: 'Pione Zero',
          symbol: 'PZO',
          decimals: 18,
        },
        blockExplorerUrls: ['https://zeroscan.org/'],
      }],
    });
  } catch (error) {
    console.error('Failed to add Pione Zero network:', error);
  }
};
```

### Thêm Pione Chain vào MetaMask

```javascript
const addPioneChainNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x13e6', // 5090 in hex
        chainName: 'Pione Chain',
        rpcUrls: ['https://rpc.pionescan.com'],
        nativeCurrency: {
          name: 'Pione Chain',
          symbol: 'PIO',
          decimals: 18,
        },
        blockExplorerUrls: ['https://scan.pionechain.com/'],
      }],
    });
  } catch (error) {
    console.error('Failed to add Pione Chain network:', error);
  }
};
```

## Network Switching

```javascript
const switchToNetwork = async (networkName) => {
  const network = BLOCKCHAIN_NETWORKS[networkName];
  if (!network) {
    throw new Error(`Network ${networkName} not supported`);
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${network.chainId.toString(16)}` }],
    });
  } catch (switchError) {
    // Network chưa được thêm vào MetaMask
    if (switchError.code === 4902) {
      const networkConfig = getNetworkConfig(networkName);
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkConfig],
      });
    }
  }
};
```

## Contract Interaction

```javascript
import { ethers } from 'ethers';
import { getContractAddresses } from './blockchainConfig';

const connectToContracts = async (networkName = 'pioneZero') => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  const addresses = getContractAddresses(networkName);
  
  // Initialize contracts
  const factory = new ethers.Contract(
    addresses.FACTORY,
    FACTORY_ABI,
    signer
  );
  
  const eduToken = new ethers.Contract(
    addresses.EDU_TOKEN,
    EDU_TOKEN_ABI,
    signer
  );
  
  return { factory, eduToken, provider, signer };
};
```

## Error Handling

```javascript
const handleNetworkError = (error) => {
  switch (error.code) {
    case 4902:
      return 'Network not added to MetaMask. Please add the network first.';
    case -32002:
      return 'Request already pending. Please check MetaMask.';
    case 4001:
      return 'User rejected the request.';
    default:
      return `Network error: ${error.message}`;
  }
};
```

## Best Practices

1. **Always check network**: Verify user is on correct network before transactions
2. **Handle network switching**: Provide clear instructions for network changes
3. **Cache network info**: Store network configuration for better UX
4. **Error handling**: Provide meaningful error messages for network issues
5. **Fallback options**: Always have backup networks available

## Troubleshooting

### Common Issues

1. **"Network not supported"**
   - Check if network is in BLOCKCHAIN_NETWORKS
   - Verify chain ID is correct

2. **"Contract not found"**
   - Check contract addresses in environment variables
   - Verify network is correct

3. **"Transaction failed"**
   - Check if user has enough PZO/PIO for gas
   - Verify contract permissions

4. **"MetaMask not found"**
   - Check if MetaMask is installed
   - Provide installation instructions

### Debug Commands

```javascript
// Check current network
const currentNetwork = await provider.getNetwork();
console.log('Current network:', currentNetwork);

// Check contract addresses
const addresses = getContractAddresses('pioneZero');
console.log('Contract addresses:', addresses);

// Check network support
const isSupported = NetworkUtils.isSupportedNetwork(currentNetwork.chainId);
console.log('Network supported:', isSupported);
```

## Migration từ Polygon

Nếu bạn đang migrate từ Polygon Mumbai, cần thay đổi:

1. **Chain ID**: 80001 → 5080 (Pione Zero)
2. **RPC URL**: Mumbai RPC → Pione Zero RPC
3. **Currency**: MATIC → PZO
4. **Explorer**: Polygonscan → Zeroscan
5. **Contract addresses**: Deploy lại trên Pione Zero

## Support

- **Documentation**: Xem INTEGRATION_GUIDE.md
- **Issues**: GitHub Issues
- **Network Info**: https://zeroscan.org và https://scan.pionechain.com
