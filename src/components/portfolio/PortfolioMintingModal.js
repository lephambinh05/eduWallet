import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUpload, FaSpinner, FaCheck, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { useWallet } from '../../context/WalletContext';
import portfolioNFTService from '../../services/portfolioNFTService';
import ipfsService from '../../services/ipfsService';
import { getCurrentUser } from '../../utils/userUtils';
import portfolioDataFromDB from '../../data/portfolioData.json';
import toast from 'react-hot-toast';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 20px;
  font-size: 28px;
  font-weight: 700;
  text-align: center;
`;

const StepContainer = styled.div`
  margin-bottom: 30px;
`;

const StepTitle = styled.h3`
  color: #4a5568;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StepContent = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #667eea;
`;

const InfoBox = styled.div`
  background: ${props => props.type === 'warning' ? '#fff3cd' : '#d1ecf1'};
  border: 1px solid ${props => props.type === 'warning' ? '#ffeaa7' : '#bee5eb'};
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const InfoIcon = styled.div`
  color: ${props => props.type === 'warning' ? '#856404' : '#0c5460'};
  font-size: 18px;
  margin-top: 2px;
`;

const InfoText = styled.div`
  color: ${props => props.type === 'warning' ? '#856404' : '#0c5460'};
  font-size: 14px;
  line-height: 1.5;
`;

const PortfolioPreview = styled.div`
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const PreviewTitle = styled.h4`
  color: #2d3748;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
`;

const PreviewItem = styled.div`
  text-align: center;
  padding: 10px;
  background: #f7fafc;
  border-radius: 8px;
`;

const PreviewNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 5px;
`;

const PreviewLabel = styled.div`
  font-size: 12px;
  color: #718096;
  font-weight: 500;
`;

const UploadSection = styled.div`
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #667eea;
    background: #f7fafc;
  }

  &.dragover {
    border-color: #667eea;
    background: #edf2f7;
  }
`;

const UploadIcon = styled.div`
  font-size: 48px;
  color: #a0aec0;
  margin-bottom: 15px;
`;

const UploadText = styled.div`
  color: #4a5568;
  font-size: 16px;
  margin-bottom: 10px;
`;

const UploadSubtext = styled.div`
  color: #718096;
  font-size: 14px;
`;

const FileInput = styled.input`
  display: none;
`;

const Button = styled.button`
  background: ${props => props.variant === 'primary' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e2e8f0'};
  color: ${props => props.variant === 'primary' ? 'white' : '#4a5568'};
  border: none;
  border-radius: 12px;
  padding: 15px 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  margin-top: 20px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const StatusMessage = styled.div`
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;

  &.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  &.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }

  &.info {
    background: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const PortfolioMintingModal = ({ isOpen, onClose, onSuccess }) => {
  const { isConnected, provider, signer } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info');
  const [portfolioData, setPortfolioData] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [mintResult, setMintResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const initialize = async () => {
        await loadPortfolioData();
        await initializeService();
      };
      initialize();
    }
  }, [isOpen, isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPortfolioData = async () => {
    const user = getCurrentUser();
    if (user && user.email === 'lephambinh05@gmail.com') {
      try {
        // Try to load from MongoDB API first, fallback to local data
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3003'}/api/portfolio/lephambinh05@gmail.com`);
        const apiData = await response.json();
        
        if (apiData.success) {
          setPortfolioData(apiData.data);
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (error) {
        console.warn('Failed to load from API, using local data:', error.message);
        // Fallback to local data
        try {
          setPortfolioData(portfolioDataFromDB);
        } catch (requireError) {
          console.error('Failed to load local data:', requireError.message);
          // Use minimal fallback data
          setPortfolioData({
            user: { firstName: 'Lê Phạm', lastName: 'Bình', email: 'lephambinh05@gmail.com' },
            courses: [],
            certificates: [],
            badges: [],
            statistics: { gpa: 0, totalCredits: 0, completionRate: 0 }
          });
        }
      }
    } else {
      // For other users, try to load their data or show empty
      setPortfolioData({
        user: { 
          firstName: user?.firstName || 'User', 
          lastName: user?.lastName || 'Name', 
          email: user?.email || 'user@example.com' 
        },
        courses: [],
        certificates: [],
        badges: [],
        statistics: { gpa: 0, totalCredits: 0, completionRate: 0 }
      });
    }
  };

  const initializeService = async () => {
    if (provider && signer) {
      try {
        await portfolioNFTService.initialize(provider, signer);
        setStatusMessage('✅ Wallet connected and service initialized');
        setStatusType('success');
      } catch (error) {
        setStatusMessage('❌ Failed to initialize service');
        setStatusType('error');
      }
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload({ target: { files } });
    }
  };

  const mintPortfolioNFT = async () => {
    if (!isConnected || !portfolioData) {
      toast.error('Please connect wallet and ensure portfolio data is loaded');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setStatusMessage('🚀 Starting Portfolio NFT minting process...');
    setStatusType('info');

    try {
      // Step 1: Upload preview image
      setProgress(20);
      setStatusMessage('📤 Uploading preview image to IPFS...');
      
      let imageIpfsHash = null;
      if (imageFile) {
        imageIpfsHash = await ipfsService.uploadPortfolioImage(imageFile);
        setProgress(40);
      }

      // Step 2: Mint NFT
      setProgress(60);
      setStatusMessage('🚀 Minting Portfolio NFT on blockchain...');
      
      const result = await portfolioNFTService.mintPortfolio(portfolioData, {
        version: 1,
        imageIpfsHash,
        transactionOptions: {
          gasLimit: 500000 // Adjust based on network
        }
      });

      setProgress(100);
      setStatusMessage('✅ Portfolio NFT minted successfully!');
      setStatusType('success');
      setMintResult(result);

      toast.success('Portfolio NFT minted successfully!');
      
      if (onSuccess) {
        onSuccess(result);
      }

    } catch (error) {
      console.error('Minting error:', error);
      setStatusMessage(`❌ Error: ${error.message}`);
      setStatusType('error');
      toast.error(`Minting failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <StepContainer>
      <StepTitle>
        <FaInfoCircle />
        Portfolio Data Preview
      </StepTitle>
      <StepContent>
        {portfolioData ? (
          <PortfolioPreview>
            <PreviewTitle>Your Portfolio Summary</PreviewTitle>
            <PreviewGrid>
              <PreviewItem>
                <PreviewNumber>{portfolioData.courses?.length || 0}</PreviewNumber>
                <PreviewLabel>Courses</PreviewLabel>
              </PreviewItem>
              <PreviewItem>
                <PreviewNumber>{portfolioData.certificates?.length || 0}</PreviewNumber>
                <PreviewLabel>Certificates</PreviewLabel>
              </PreviewItem>
              <PreviewItem>
                <PreviewNumber>{portfolioData.badges?.length || 0}</PreviewNumber>
                <PreviewLabel>Badges</PreviewLabel>
              </PreviewItem>
              <PreviewItem>
                <PreviewNumber>{portfolioData.statistics?.gpa || 0}</PreviewNumber>
                <PreviewLabel>GPA</PreviewLabel>
              </PreviewItem>
            </PreviewGrid>
          </PortfolioPreview>
        ) : (
          <div>Loading portfolio data...</div>
        )}
      </StepContent>
    </StepContainer>
  );

  const renderStep2 = () => (
    <StepContainer>
      <StepTitle>
        <FaUpload />
        Upload Preview Image (Optional)
      </StepTitle>
      <StepContent>
        <UploadSection
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('image-upload').click()}
        >
          <UploadIcon>
            <FaUpload />
          </UploadIcon>
          <UploadText>
            {previewImage ? 'Click to change image' : 'Click to upload or drag & drop'}
          </UploadText>
          <UploadSubtext>
            PNG, JPG, GIF up to 5MB
          </UploadSubtext>
          <FileInput
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </UploadSection>
        
        {previewImage && (
          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <img 
              src={previewImage} 
              alt="Preview" 
              style={{ 
                maxWidth: '200px', 
                maxHeight: '200px', 
                borderRadius: '8px',
                border: '2px solid #e2e8f0'
              }} 
            />
          </div>
        )}
      </StepContent>
    </StepContainer>
  );

  const renderStep3 = () => (
    <StepContainer>
      <StepTitle>
        <FaCheck />
        Mint Portfolio NFT
      </StepTitle>
      <StepContent>
        <InfoBox type="warning">
          <InfoIcon>
            <FaExclamationTriangle />
          </InfoIcon>
          <InfoText>
            <strong>Important:</strong> This will create a permanent, immutable record of your portfolio on the blockchain. 
            Make sure all information is accurate before proceeding.
          </InfoText>
        </InfoBox>

        {statusMessage && (
          <StatusMessage className={statusType}>
            {statusMessage}
          </StatusMessage>
        )}

        {isLoading && (
          <ProgressBar>
            <ProgressFill progress={progress} />
          </ProgressBar>
        )}

        {mintResult && (
          <div style={{ marginTop: '20px' }}>
            <h4>✅ Minting Successful!</h4>
            <p><strong>Token ID:</strong> {mintResult.tokenId}</p>
            <p><strong>Transaction Hash:</strong> {mintResult.transactionHash}</p>
            <p><strong>IPFS Hash:</strong> {mintResult.ipfsHash}</p>
          </div>
        )}
      </StepContent>
    </StepContainer>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContent
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>

          <Title>Mint Portfolio NFT</Title>

          {renderStep1()}
          {renderStep2()}
          {renderStep3()}

          <Button
            variant="primary"
            onClick={mintPortfolioNFT}
            disabled={isLoading || !isConnected || !portfolioData}
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                Minting NFT...
              </>
            ) : (
              <>
                <FaCheck />
                Mint Portfolio NFT
              </>
            )}
          </Button>
        </ModalContent>
      </ModalOverlay>
    </AnimatePresence>
  );
};

export default PortfolioMintingModal;
