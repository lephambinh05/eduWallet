import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaDownload, FaExternalLinkAlt, FaCheckCircle, FaWallet, FaShieldAlt, FaCog } from 'react-icons/fa';

const GuideContainer = styled(motion.div)`
  min-height: 100vh;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
`;

const GuideCard = styled(motion.div)`
  background: rgba(20, 20, 40, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(120, 80, 220, 0.2);
  border-radius: 20px;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  text-align: center;
`;

const Title = styled.h1`
  color: white;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const StepsContainer = styled.div`
  text-align: left;
  margin: 2rem 0;
`;

const Step = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StepNumber = styled.div`
  background: linear-gradient(135deg, #a259ff 0%, #3772ff 100%);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 0.2rem;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h3`
  color: white;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StepDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  line-height: 1.5;
`;

const DownloadButton = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  background: linear-gradient(135deg, #a259ff 0%, #3772ff 100%);
  color: white;
  padding: 1.2rem 2.5rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 1rem 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(162, 89, 255, 0.3);
  }
`;

const BackButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const MetaMaskGuide = ({ onBack }) => {
  return (
    <GuideContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <GuideCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Title>
          <FaWallet />
          Cài đặt MetaMask
        </Title>
        
        <Subtitle>
          Để sử dụng các tính năng blockchain của EduWallet, bạn cần cài đặt MetaMask extension.
        </Subtitle>
        
        <StepsContainer>
          <Step>
            <StepNumber>1</StepNumber>
            <StepContent>
              <StepTitle>
                <FaDownload />
                Tải MetaMask
              </StepTitle>
              <StepDescription>
                Truy cập trang web chính thức của MetaMask và tải extension cho trình duyệt của bạn.
              </StepDescription>
            </StepContent>
          </Step>
          
          <Step>
            <StepNumber>2</StepNumber>
            <StepContent>
              <StepTitle>
                <FaShieldAlt />
                Tạo ví mới
              </StepTitle>
              <StepDescription>
                Cài đặt extension và tạo ví mới. Lưu ý: Hãy ghi nhớ seed phrase một cách an toàn!
              </StepDescription>
            </StepContent>
          </Step>
          
          <Step>
            <StepNumber>3</StepNumber>
            <StepContent>
              <StepTitle>
                <FaCog />
                Cấu hình mạng
              </StepTitle>
              <StepDescription>
                Thêm mạng Pioneer Zero (nếu cần) hoặc sử dụng mạng Ethereum chính.
              </StepDescription>
            </StepContent>
          </Step>
          
          <Step>
            <StepNumber>4</StepNumber>
            <StepContent>
              <StepTitle>
                <FaCheckCircle />
                Kết nối với EduWallet
              </StepTitle>
              <StepDescription>
                Quay lại trang này và nhấn nút "Kết nối ví" để bắt đầu sử dụng.
              </StepDescription>
            </StepContent>
          </Step>
        </StepsContainer>
        
        <DownloadButton
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaDownload />
          Tải MetaMask
          <FaExternalLinkAlt size={14} />
        </DownloadButton>
        
        {onBack && (
          <BackButton
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Quay lại
          </BackButton>
        )}
      </GuideCard>
    </GuideContainer>
  );
};

export default MetaMaskGuide;
