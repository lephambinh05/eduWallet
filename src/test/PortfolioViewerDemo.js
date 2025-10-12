import React, { useState } from 'react';
import styled from 'styled-components';
import PortfolioViewer from '../components/portfolio/PortfolioViewer';

const DemoContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const DemoHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
`;

const DemoTitle = styled.h1`
  font-size: 28px;
  margin-bottom: 10px;
`;

const DemoSubtitle = styled.p`
  font-size: 16px;
  opacity: 0.9;
`;

const DemoSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const DemoButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin: 5px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }
`;

const PortfolioViewerDemo = () => {
  const [showDemo, setShowDemo] = useState(false);

  const handleDemoSearch = () => {
    // Simulate searching for a portfolio
    setShowDemo(true);
  };

  return (
    <DemoContainer>
      <DemoHeader>
        <DemoTitle>Portfolio NFT Viewer Demo</DemoTitle>
        <DemoSubtitle>
          Demo để test Portfolio Viewer với dữ liệu chi tiết
        </DemoSubtitle>
      </DemoHeader>

      <DemoSection>
        <h2>🎯 Demo Instructions</h2>
        <p>Để test Portfolio Viewer:</p>
        <ol>
          <li>Click "Start Demo" để bắt đầu</li>
          <li>Trong search box, nhập bất kỳ Token ID nào (ví dụ: 1, 2, 3...)</li>
          <li>Click "Tìm kiếm" để xem portfolio chi tiết</li>
          <li>Xem thông tin chi tiết về khóa học, chứng chỉ, huy hiệu</li>
        </ol>
        
        <DemoButton onClick={handleDemoSearch}>
          🚀 Start Demo
        </DemoButton>
      </DemoSection>

      {showDemo && (
        <DemoSection>
          <h2>📊 Portfolio Viewer</h2>
          <PortfolioViewer />
        </DemoSection>
      )}
    </DemoContainer>
  );
};

export default PortfolioViewerDemo;
