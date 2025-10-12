// EduWallet Blockchain Configuration
// Updated to use Pione Zero and Pione Chain networks

export const BLOCKCHAIN_NETWORKS = {
  // Pione Zero Chain (Testnet)
  pioneZero: {
    chainId: 5080,
    name: 'Pione Zero',
    currency: 'PZO',
    explorerUrl: 'https://zeroscan.org',
    rpcUrl: 'https://rpc.zeroscan.org',
    blockExplorerUrls: ['https://zeroscan.org/'],
    nativeCurrency: {
      name: 'Pione Zero',
      symbol: 'PZO',
      decimals: 18,
    },
  },
  
  // Pione Chain (Mainnet)
  pioneChain: {
    chainId: 5090,
    name: 'Pione Chain',
    currency: 'PIO',
    explorerUrl: 'https://scan.pionechain.com',
    rpcUrl: 'https://rpc.pionescan.com',
    blockExplorerUrls: ['https://scan.pionechain.com/'],
    nativeCurrency: {
      name: 'Pione Chain',
      symbol: 'PIO',
      decimals: 18,
    },
  },
  
  // Polygon (Backup option)
  polygon: {
    chainId: 137,
    name: 'Polygon',
    currency: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorerUrls: ['https://polygonscan.com/'],
    nativeCurrency: {
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
};

// Default network configuration
export const DEFAULT_NETWORK = BLOCKCHAIN_NETWORKS.pioneZero;

// Contract addresses (will be updated after deployment)
export const CONTRACT_ADDRESSES = {
  // Pione Zero addresses
  pioneZero: {
    EDU_TOKEN: process.env.REACT_APP_EDU_TOKEN_ADDRESS || '',
    LEARNPASS_NFT: process.env.REACT_APP_LEARNPASS_NFT_ADDRESS || '',
    CERTIFICATE_NFT: process.env.REACT_APP_CERTIFICATE_NFT_ADDRESS || '',
    FACTORY: process.env.REACT_APP_FACTORY_ADDRESS || '',
    MARKETPLACE: process.env.REACT_APP_MARKETPLACE_ADDRESS || '',
  },
  
  // Pione Chain addresses
  pioneChain: {
    EDU_TOKEN: process.env.REACT_APP_PIONE_CHAIN_EDU_TOKEN_ADDRESS || '',
    LEARNPASS_NFT: process.env.REACT_APP_PIONE_CHAIN_LEARNPASS_NFT_ADDRESS || '',
    CERTIFICATE_NFT: process.env.REACT_APP_PIONE_CHAIN_CERTIFICATE_NFT_ADDRESS || '',
    FACTORY: process.env.REACT_APP_PIONE_CHAIN_FACTORY_ADDRESS || '',
    MARKETPLACE: process.env.REACT_APP_PIONE_CHAIN_MARKETPLACE_ADDRESS || '',
  },
};

// Get contract addresses for current network
export const getContractAddresses = (networkName = 'pioneZero') => {
  return CONTRACT_ADDRESSES[networkName] || CONTRACT_ADDRESSES.pioneZero;
};

// Network configuration for MetaMask
export const getNetworkConfig = (networkName = 'pioneZero') => {
  const network = BLOCKCHAIN_NETWORKS[networkName];
  if (!network) {
    throw new Error(`Network ${networkName} not supported`);
  }
  
  return {
    chainId: `0x${network.chainId.toString(16)}`,
    chainName: network.name,
    rpcUrls: [network.rpcUrl],
    nativeCurrency: network.nativeCurrency,
    blockExplorerUrls: network.blockExplorerUrls,
  };
};

// Network utilities
export const NetworkUtils = {
  // Check if current network is supported
  isSupportedNetwork: (chainId) => {
    const supportedChainIds = Object.values(BLOCKCHAIN_NETWORKS).map(n => n.chainId);
    return supportedChainIds.includes(Number(chainId));
  },
  
  // Get network name by chain ID
  getNetworkName: (chainId) => {
    const network = Object.values(BLOCKCHAIN_NETWORKS).find(n => n.chainId === Number(chainId));
    return network ? network.name : 'Unknown Network';
  },
  
  // Get network config by chain ID
  getNetworkByChainId: (chainId) => {
    return Object.values(BLOCKCHAIN_NETWORKS).find(n => n.chainId === Number(chainId));
  },
  
  // Format chain ID for MetaMask
  formatChainId: (chainId) => {
    return `0x${Number(chainId).toString(16)}`;
  },
  
  // Parse chain ID from MetaMask format
  parseChainId: (hexChainId) => {
    return parseInt(hexChainId, 16);
  },
};

// Environment configuration
export const ENV_CONFIG = {
  // Default network from environment
  DEFAULT_NETWORK: process.env.REACT_APP_DEFAULT_NETWORK || 'pioneZero',
  
  // Base URI for NFT metadata
  BASE_TOKEN_URI: process.env.REACT_APP_BASE_TOKEN_URI || 'https://api.eduwallet.com/metadata/',
  
  // API endpoints
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  
  // Feature flags
  ENABLE_MARKETPLACE: process.env.REACT_APP_ENABLE_MARKETPLACE === 'true',
  ENABLE_REWARDS: process.env.REACT_APP_ENABLE_REWARDS === 'true',
  ENABLE_VERIFICATION: process.env.REACT_APP_ENABLE_VERIFICATION === 'true',
};

export default {
  BLOCKCHAIN_NETWORKS,
  DEFAULT_NETWORK,
  CONTRACT_ADDRESSES,
  getNetworkConfig,
  getContractAddresses,
  NetworkUtils,
  ENV_CONFIG,
};
