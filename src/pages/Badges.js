import React from 'react';
import styled from 'styled-components';
import demoData from '../data/demoData.json';
import { FaTrophy } from 'react-icons/fa';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 0;
`;

const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
`;

const BadgeCard = styled.div`
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  border-radius: 16px;
  padding: 2rem 1.5rem;
  min-width: 220px;
  max-width: 260px;
  text-align: center;
  color: #fff;
  box-shadow: 0 4px 24px rgba(102,126,234,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(255,215,0,0.15);
  }
`;

const BadgeIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #333;
  box-shadow: 0 2px 8px rgba(255,215,0,0.15);
`;

const Badges = () => {
  const { badges } = demoData;
  return (
    <Container>
      <h2 style={{ color: '#667eea', marginBottom: 24 }}>Danh hiệu & phần thưởng</h2>
      <Grid>
        {badges.map(badge => (
          <BadgeCard key={badge.id}>
            <BadgeIcon>
              <FaTrophy />
            </BadgeIcon>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>{badge.title}</div>
            <div style={{ color: '#ffd700', fontWeight: 500 }}>{badge.reward}</div>
          </BadgeCard>
        ))}
      </Grid>
    </Container>
  );
};

export default Badges; 