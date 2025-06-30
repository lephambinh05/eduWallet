import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { getCurrentUser, saveUserToLocalStorage } from '../utils/userUtils';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chainId, setChainId] = useState(null);

  // Polygon Mumbai Testnet configuration
  const POLYGON_MUMBAI = {
    chainId: '0x13881',
    chainName: 'Polygon Mumbai Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
  };

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

      // Check if we're on the correct network
      if (network.chainId !== 80001) { // Mumbai testnet
        await switchToMumbai();
      }

      toast.success('Kết nối ví thành công!');

      // Sau khi lấy được account:
      // 1. Cập nhật user hiện tại trong localStorage
      const user = getCurrentUser();
      if (user) {
        user.wallet = accounts[0];
        saveUserToLocalStorage(user);
        // Cập nhật mảng users trong localStorage nếu có
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const idx = users.findIndex(u => u.username === user.username);
        if (idx !== -1) {
          users[idx].wallet = accounts[0];
          localStorage.setItem('users', JSON.stringify(users));
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Lỗi kết nối ví: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchToMumbai = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_MUMBAI.chainId }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [POLYGON_MUMBAI],
          });
        } catch (addError) {
          toast.error('Không thể thêm mạng Polygon Mumbai');
        }
      }
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    setChainId(null);
    toast.success('Đã ngắt kết nối ví');
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
        setChainId(parseInt(chainId, 16));
        if (parseInt(chainId, 16) !== 80001) {
          toast.error('Vui lòng chuyển sang mạng Polygon Mumbai');
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  const value = {
    account,
    provider,
    signer,
    isConnected,
    isLoading,
    chainId,
    connectWallet,
    disconnectWallet,
    getAccountBalance,
    switchToMumbai,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}; 