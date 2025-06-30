import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaMedal, FaWallet, FaExchangeAlt, FaCheckCircle } from 'react-icons/fa';

const Hero = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 4rem 0 2rem 0;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #fff;
  letter-spacing: -2px;
`;

const SubTitle = styled.p`
  font-size: 1.3rem;
  color: #c3bfff;
  margin-bottom: 2rem;
`;

const Features = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
`;

const FeatureCard = styled.div`
  background: rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 2rem 1.5rem;
  min-width: 220px;
  max-width: 300px;
  text-align: center;
  color: #fff;
  box-shadow: 0 4px 24px rgba(102,126,234,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #667eea;
`;

const CTA = styled.div`
  margin-top: 2rem;
  display: flex;
  gap: 1.5rem;
  justify-content: center;
`;

const Home = () => (
  <>
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
          Lưu trữ & quản lý danh tính học tập NFT
        </FeatureCard>
        <FeatureCard>
          <FeatureIcon><FaCheckCircle /></FeatureIcon>
          Xác minh chứng chỉ phi tập trung
        </FeatureCard>
        <FeatureCard>
          <FeatureIcon><FaExchangeAlt /></FeatureIcon>
          Marketplace đổi thưởng bằng token
        </FeatureCard>
        <FeatureCard>
          <FeatureIcon><FaMedal /></FeatureIcon>
          Gamification: Badge, phần thưởng, ưu đãi
        </FeatureCard>
      </Features>
      <CTA>
        <Link to="/dashboard" className="btn btn-primary">Vào Dashboard</Link>
        <Link to="/learnpass" className="btn btn-secondary">Xem LearnPass</Link>
      </CTA>
    </Hero>
  </>
);

export default Home; 