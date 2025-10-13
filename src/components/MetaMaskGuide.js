import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaDownload, FaExternalLinkAlt, FaCheckCircle } from 'react-icons/fa';

const GuideContainer = styled(motion.div)`
  background: rgba(20, 20, 40, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(120, 80, 220, 0.2);
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  margin: 2rem auto;
  text-align: center;
`;

const Title = styled.h2`
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const StepsList = styled.div`
  text-align: left;
  margin-bottom: 2rem;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.8);
`;

const StepNumber = styled.div`
  background: linear-gradient(135deg, #a259ff 0%, #3772ff 100%);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  flex-shrink: 0;
`;

const DownloadButton = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #a259ff 0%, #3772ff 100%);
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(162, 89, 255, 0.3);
  }
`;

const MetaMaskGuide = () => {
  return (
    <GuideContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Title>
        <FaCheckCircle />
        Cài đặt MetaMask
      </Title>
      
      <Description>
        Để sử dụng các tính năng blockchain của EduWallet, bạn cần cài đặt MetaMask extension.
      </Description>
      
      <StepsList>
        <Step>
          <StepNumber>1</StepNumber>
          <span>Truy cập trang web MetaMask</span>
        </Step>
        <Step>
          <StepNumber>2</StepNumber>
          <span>Nhấn "Download" và chọn trình duyệt của bạn</span>
        </Step>
        <Step>
          <StepNumber>3</StepNumber>
          <span>Cài đặt extension và tạo ví mới</span>
        </Step>
        <Step>
          <StepNumber>4</StepNumber>
          <span>Quay lại trang này và thử kết nối lại</span>
        </Step>
      </StepsList>
      
      <DownloadButton
        href="https://metamask.io/download/"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaDownload />
        Tải MetaMask
        <FaExternalLinkAlt size={12} />
      </DownloadButton>
    </GuideContainer>
  );
};

export default MetaMaskGuide;
