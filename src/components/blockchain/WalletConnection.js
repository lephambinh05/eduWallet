import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaWallet, FaCheck, FaExclamationTriangle, FaCopy, FaExternalLinkAlt } from 'react-icons/fa';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import { BLOCKCHAIN_NETWORKS } from '../../config/blockchain';
import toast from 'react-hot-toast';

const WalletContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1.5rem;
`;

const WalletHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const WalletIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
`;

const WalletInfo = styled.div`
  flex: 1;
`;

const WalletTitle = styled.h3`
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const WalletStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.connected ? '#4CAF50' : '#ff6b6b'};
`;

const ConnectButton = styled(motion.button)`
  background: linear-gradient(90deg, #a259ff, #3772ff);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(162, 89, 255, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DisconnectButton = styled(motion.button)`
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: rgba(255, 107, 107, 0.3);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const WalletDetails = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const DetailValue = styled.span`
  color: #fff;
  font-weight: 500;
  font-family: monospace;
  font-size: 0.9rem;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  margin-left: 0.5rem;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ExplorerLink = styled.a`
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.3s ease;

  &:hover {
    color: #764ba2;
  }
`;

const NetworkInfo = styled.div`
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
`;

const NetworkTitle = styled.h4`
  color: #667eea;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NetworkDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
`;

const WalletConnection = ({ showDetails = true, compact = false }) => {
  const { 
    isConnected, 
    account, 
    chainId, 
    currentNetwork, 
    connectWallet, 
    disconnectWallet, 
    isLoading
  } = useWallet();
  const { isAuthenticated } = useAuth();

  const [copied, setCopied] = useState(false);

  const handleConnect = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập trước khi kết nối ví!');
      return;
    }
    
    try {
      await connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleSelectAccount = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập trước!');
      return;
    }
    
    try {
      console.log('🔄 Starting account selection process...');
      
      // Gọi connectWallet trực tiếp - MetaMask sẽ hiện popup chọn account nếu cần
      await connectWallet();
      
      console.log('✅ Account selection completed successfully');
      toast.success('Đã chọn ví mới thành công!');
    } catch (error) {
      console.error('❌ Error selecting account:', error);
      if (error.code === 4001) {
        toast.error('Người dùng đã từ chối kết nối ví');
      } else {
        toast.error('Lỗi chọn ví: ' + error.message);
      }
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const handleCopyAddress = async () => {
    if (account) {
      try {
        await navigator.clipboard.writeText(account);
        setCopied(true);
        toast.success('Đã sao chép địa chỉ ví!');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Error copying address:', error);
        toast.error('Không thể sao chép địa chỉ ví');
      }
    }
  };

  const getExplorerUrl = () => {
    if (!account || !chainId) return null;
    const network = BLOCKCHAIN_NETWORKS[currentNetwork];
    return network ? `${network.explorerUrl}/address/${account}` : null;
  };

  const getNetworkName = () => {
    if (!chainId) return 'Unknown';
    const network = BLOCKCHAIN_NETWORKS[currentNetwork];
    return network ? network.name : 'Unknown Network';
  };

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {!isAuthenticated ? (
          <span style={{ color: '#ffc107', fontSize: '0.9rem' }}>
            Vui lòng đăng nhập để kết nối ví
          </span>
        ) : isConnected ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <StatusIndicator connected={true} />
              <span style={{ color: '#fff', fontSize: '0.9rem' }}>
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </span>
            </div>
            <DisconnectButton
              onClick={handleDisconnect}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ngắt kết nối
            </DisconnectButton>
          </>
        ) : (
          <ConnectButton
            onClick={handleConnect}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaWallet />
            Kết nối ví
          </ConnectButton>
        )}
      </div>
    );
  }

  return (
    <WalletContainer>
      <WalletHeader>
        <WalletIcon>
          <FaWallet />
        </WalletIcon>
        <WalletInfo>
          <WalletTitle>Kết nối ví MetaMask</WalletTitle>
          <WalletStatus>
            <StatusIndicator connected={isConnected} />
            <span style={{ color: isConnected ? '#4CAF50' : '#ff6b6b' }}>
              {isConnected ? 'Đã kết nối' : 'Chưa kết nối'}
            </span>
          </WalletStatus>
        </WalletInfo>
        {!isAuthenticated ? (
          <div style={{ 
            background: 'rgba(255, 193, 7, 0.1)', 
            border: '1px solid rgba(255, 193, 7, 0.3)', 
            borderRadius: '8px', 
            padding: '0.8rem 1rem',
            color: '#ffc107',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            Vui lòng đăng nhập để kết nối ví
          </div>
        ) : isConnected ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <ConnectButton
              onClick={handleSelectAccount}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ background: 'linear-gradient(90deg, #28a745, #20c997)' }}
            >
              <FaWallet />
              Chọn ví khác
            </ConnectButton>
            <DisconnectButton
              onClick={handleDisconnect}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ngắt kết nối
            </DisconnectButton>
          </div>
        ) : (
          <ConnectButton
            onClick={handleConnect}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaWallet />
            Kết nối ví
          </ConnectButton>
        )}
      </WalletHeader>

      {isConnected && showDetails && (
        <>
          <WalletDetails>
            <DetailRow>
              <DetailLabel>Địa chỉ ví:</DetailLabel>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <DetailValue>{account}</DetailValue>
                <CopyButton onClick={handleCopyAddress}>
                  <FaCopy />
                </CopyButton>
              </div>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Network:</DetailLabel>
              <DetailValue>{getNetworkName()}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Chain ID:</DetailLabel>
              <DetailValue>{chainId}</DetailValue>
            </DetailRow>
            {getExplorerUrl() && (
              <DetailRow>
                <DetailLabel>Explorer:</DetailLabel>
                <ExplorerLink href={getExplorerUrl()} target="_blank" rel="noopener noreferrer">
                  Xem trên explorer
                  <FaExternalLinkAlt />
                </ExplorerLink>
              </DetailRow>
            )}
          </WalletDetails>

          <NetworkInfo>
            <NetworkTitle>
              <FaCheck />
              Thông tin mạng
            </NetworkTitle>
            <NetworkDetails>
              <div>
                <DetailLabel>Mạng hiện tại:</DetailLabel>
                <DetailValue>{getNetworkName()}</DetailValue>
              </div>
              <div>
                <DetailLabel>Chain ID:</DetailLabel>
                <DetailValue>{chainId}</DetailValue>
              </div>
              <div>
                <DetailLabel>Trạng thái:</DetailLabel>
                <DetailValue style={{ color: '#4CAF50' }}>Đã kết nối</DetailValue>
              </div>
            </NetworkDetails>
          </NetworkInfo>
        </>
      )}

      {!isConnected && (
        <div style={{ 
          background: 'rgba(255, 193, 7, 0.1)', 
          border: '1px solid rgba(255, 193, 7, 0.3)', 
          borderRadius: '8px', 
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <FaExclamationTriangle style={{ color: '#ffc107' }} />
          <span style={{ color: '#ffc107', fontSize: '0.9rem' }}>
            Kết nối ví để sử dụng các tính năng blockchain
          </span>
        </div>
      )}
    </WalletContainer>
  );
};

export default WalletConnection;
