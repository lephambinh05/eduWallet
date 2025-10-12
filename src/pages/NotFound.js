import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaHome, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

const NotFoundContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
`;

const NotFoundCard = styled(motion.div)`
  background: rgba(20, 20, 40, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(120, 80, 220, 0.2);
  border-radius: 20px;
  padding: 4rem 3rem;
  text-align: center;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 1;
`;

const ErrorIcon = styled.div`
  font-size: 6rem;
  color: #ff6b6b;
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
`;

const ErrorCode = styled.h1`
  font-size: 8rem;
  font-weight: 900;
  background: linear-gradient(45deg, #ff6b6b, #ffa726);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  line-height: 1;
`;

const ErrorTitle = styled.h2`
  color: white;
  font-size: 2rem;
  font-weight: 600;
  margin: 1rem 0;
`;

const ErrorMessage = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin-bottom: 3rem;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled(motion(Link))`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: ${props => props.primary ? 
    'linear-gradient(135deg, #a259ff 0%, #3772ff 100%)' : 
    'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.primary ? 'transparent' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 12px;
  color: white;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.primary ? 
      '0 10px 25px rgba(162, 89, 255, 0.3)' : 
      '0 10px 25px rgba(255, 255, 255, 0.1)'};
  }
`;

const FloatingElements = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
`;

const FloatingElement = styled(motion.div)`
  position: absolute;
  width: 20px;
  height: 20px;
  background: linear-gradient(45deg, #a259ff, #3772ff);
  border-radius: 50%;
  opacity: 0.3;
`;

const NotFound = () => {
  return (
    <NotFoundContainer>
      <FloatingElements>
        <FloatingElement
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '20%', left: '10%' }}
        />
        <FloatingElement
          animate={{
            y: [0, 20, 0],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          style={{ top: '60%', right: '15%' }}
        />
        <FloatingElement
          animate={{
            y: [0, -15, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          style={{ bottom: '30%', left: '20%' }}
        />
      </FloatingElements>

      <NotFoundCard
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <ErrorIcon>
          <FaExclamationTriangle />
        </ErrorIcon>
        
        <ErrorCode>404</ErrorCode>
        
        <ErrorTitle>Trang không tìm thấy</ErrorTitle>
        
        <ErrorMessage>
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          <br />
          Vui lòng kiểm tra lại URL hoặc quay về trang chủ.
        </ErrorMessage>
        
        <ButtonGroup>
          <Button
            to="/"
            primary
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaHome />
            Về trang chủ
          </Button>
          
          <Button
            to="javascript:history.back()"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaArrowLeft />
            Quay lại
          </Button>
        </ButtonGroup>
      </NotFoundCard>
    </NotFoundContainer>
  );
};

export default NotFound;
