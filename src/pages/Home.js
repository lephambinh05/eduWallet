import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaMedal, FaWallet, FaExchangeAlt, FaCheckCircle } from 'react-icons/fa';
import PageWrapper from '../components/PageWrapper';

const Hero = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 4rem 2rem 2rem 2rem;
  
  @media (max-width: 768px) {
    padding: 2rem 1rem 1rem 1rem;
    min-height: 50vh;
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #fff;
  letter-spacing: -2px;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
    letter-spacing: -1px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const SubTitle = styled.p`
  font-size: 1.3rem;
  color: #c3bfff;
  margin-bottom: 2rem;
  max-width: 800px;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
  max-width: 1200px;
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin: 1.5rem 0;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const FeatureCard = styled.div`
  background: rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 2rem 1.5rem;
  text-align: center;
  color: #fff;
  box-shadow: 0 4px 24px rgba(102,126,234,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 32px rgba(102,126,234,0.15);
    background: rgba(255,255,255,0.1);
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #667eea;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const FeatureText = styled.p`
  font-size: 1rem;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const CTA = styled.div`
  margin-top: 2rem;
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 1rem;
    margin-top: 1.5rem;
  }
`;

const Home = () => (
  <PageWrapper>
    <Hero>
      <Title>
        EduWallet <FaGraduationCap style={{ color: '#667eea' }} />
      </Title>
      <SubTitle>
        NFT Hộ chiếu học tập - Quản lý chứng chỉ, danh tính số và phần thưởng học tập trên blockchain.<br/>
        Bảo mật, minh bạch, xác minh phi tập trung.
      </SubTitle>
      
      <Features>
        <FeatureCard>
          <FeatureIcon><FaWallet /></FeatureIcon>
          <FeatureText>Lưu trữ & quản lý danh tính học tập NFT</FeatureText>
        </FeatureCard>
        <FeatureCard>
          <FeatureIcon><FaCheckCircle /></FeatureIcon>
          <FeatureText>Xác minh chứng chỉ phi tập trung</FeatureText>
        </FeatureCard>
        <FeatureCard>
          <FeatureIcon><FaExchangeAlt /></FeatureIcon>
          <FeatureText>Marketplace đổi thưởng bằng token</FeatureText>
        </FeatureCard>
        <FeatureCard>
          <FeatureIcon><FaMedal /></FeatureIcon>
          <FeatureText>Gamification: Badge, phần thưởng, ưu đãi</FeatureText>
        </FeatureCard>
      </Features>
      <CTA>
        <Link to="/dashboard" className="btn btn-primary">Vào Dashboard</Link>
        <Link to="/learnpass" className="btn btn-secondary">Xem LearnPass</Link>
      </CTA>
    </Hero>
  </PageWrapper>
);

export default Home; 