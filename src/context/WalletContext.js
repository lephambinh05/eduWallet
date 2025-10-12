import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { getCurrentUser, saveUserToLocalStorage } from '../utils/userUtils';
import { BLOCKCHAIN_NETWORKS, getNetworkConfig, NetworkUtils } from '../config/blockchain';
import { userAPI } from '../config/api';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(() => {
    return localStorage.getItem('walletAccount') || null;
  });
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(() => {
    return localStorage.getItem('walletConnected') === 'true';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [chainId, setChainId] = useState(() => {
    return localStorage.getItem('walletChainId') ? parseInt(localStorage.getItem('walletChainId')) : null;
  });

  // Current network configuration
  const [currentNetwork, setCurrentNetwork] = useState(() => {
    return localStorage.getItem('currentNetwork') || 'pioneZero';
  });

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      if (!window.ethereum) {
        toast.error('MetaMask không được cài đặt!');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);
      setChainId(network.chainId);
      setIsConnected(true);

      // Check if we're on a supported network
      if (!NetworkUtils.isSupportedNetwork(network.chainId)) {
        await switchToSupportedNetwork();
      } else {
        // Update current network based on chain ID
        const networkName = NetworkUtils.getNetworkName(network.chainId);
        setCurrentNetwork(networkName.toLowerCase().replace(' ', ''));
      }

      toast.success('Kết nối ví thành công!');

      // Save wallet information to backend database
      try {
        const walletData = {
          walletAddress: accounts[0],
          chainId: network.chainId,
          networkName: currentNetwork,
          isConnected: true,
          connectedAt: new Date().toISOString()
        };
        
        await userAPI.connectWallet(walletData);
        
        // Update local user data with wallet info
        const user = getCurrentUser();
        if (user) {
          const updatedUser = {
            ...user,
            walletAddress: accounts[0],
            chainId: network.chainId,
            networkName: currentNetwork,
            walletConnected: true
          };
          saveUserToLocalStorage(updatedUser);
        }
        
        toast.success('Ví đã được kết nối và lưu vào database thành công!');
      } catch (error) {
        console.error('Failed to save wallet to database:', error);
        toast.error('Kết nối ví thành công nhưng không thể lưu vào database');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Lỗi kết nối ví: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchToSupportedNetwork = async (networkName = 'pioneZero') => {
    try {
      const networkConfig = getNetworkConfig(networkName);
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      });
      
      setCurrentNetwork(networkName);
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          const networkConfig = getNetworkConfig(networkName);
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          });
          setCurrentNetwork(networkName);
        } catch (addError) {
          toast.error(`Không thể thêm mạng ${BLOCKCHAIN_NETWORKS[networkName]?.name}`);
        }
      }
    }
  };

  const disconnectWallet = async () => {
    try {
      // Update wallet status in backend database
      await userAPI.disconnectWallet(account);
      
      // Update local user data
      const user = getCurrentUser();
      if (user) {
        const updatedUser = {
          ...user,
          walletAddress: null,
          chainId: null,
          networkName: null,
          walletConnected: false
        };
        saveUserToLocalStorage(updatedUser);
      }
      
      toast.success('Đã ngắt kết nối ví và cập nhật database');
    } catch (error) {
      console.error('Failed to disconnect wallet from backend:', error);
      toast.error('Ngắt kết nối ví thành công nhưng không thể cập nhật database');
    } finally {
      setAccount(null);
      setProvider(null);
      setSigner(null);
      setIsConnected(false);
      setChainId(null);
      setCurrentNetwork('pioneZero');
    }
  };

  const getAccountBalance = async () => {
    if (!provider || !account) return '0';
    try {
      const balance = await provider.getBalance(account);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        const newChainId = parseInt(chainId, 16);
        setChainId(newChainId);
        
        if (!NetworkUtils.isSupportedNetwork(newChainId)) {
          toast.error('Vui lòng chuyển sang mạng được hỗ trợ (Pione Zero hoặc Pione Chain)');
        } else {
          const networkName = NetworkUtils.getNetworkName(newChainId);
          setCurrentNetwork(networkName.toLowerCase().replace(' ', ''));
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  // Khôi phục kết nối ví từ database khi component mount
  useEffect(() => {
    const restoreConnection = async () => {
      try {
        // Lấy thông tin user từ localStorage
        const user = getCurrentUser();
        if (user && user.walletAddress && user.walletConnected && window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0 && accounts[0].toLowerCase() === user.walletAddress.toLowerCase()) {
            const signer = provider.getSigner();
            const network = await provider.getNetwork();
            
            setProvider(provider);
            setSigner(signer);
            setAccount(user.walletAddress);
            setChainId(user.chainId || network.chainId);
            setIsConnected(true);
            setCurrentNetwork(user.networkName || 'pioneZero');
            
            // Kiểm tra network hiện tại
            if (!NetworkUtils.isSupportedNetwork(network.chainId)) {
              await switchToSupportedNetwork(user.networkName || 'pioneZero');
            }
            
            console.log('Wallet connection restored from database');
          } else {
            // Account không khớp, cập nhật database
            console.log('Account mismatch, updating database');
            await userAPI.disconnectWallet(user.walletAddress);
            setAccount(null);
            setProvider(null);
            setSigner(null);
            setIsConnected(false);
            setChainId(null);
          }
        }
      } catch (error) {
        console.error('Failed to restore wallet connection:', error);
        // Nếu có lỗi, reset trạng thái
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setIsConnected(false);
        setChainId(null);
      }
    };

    restoreConnection();
  }, []);

  // Lưu trạng thái vào localStorage khi có thay đổi
  useEffect(() => {
    localStorage.setItem('walletAccount', account || '');
    localStorage.setItem('walletConnected', isConnected.toString());
    localStorage.setItem('walletChainId', chainId?.toString() || '');
    localStorage.setItem('currentNetwork', currentNetwork);
  }, [account, isConnected, chainId, currentNetwork]);

  // eslint-disable-next-line react-hooks/exhaustive-deps

  const value = {
    account,
    provider,
    signer,
    isConnected,
    isLoading,
    chainId,
    currentNetwork,
    connectWallet,
    disconnectWallet,
    getAccountBalance,
    switchToSupportedNetwork,
    BLOCKCHAIN_NETWORKS,
    NetworkUtils,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}; 