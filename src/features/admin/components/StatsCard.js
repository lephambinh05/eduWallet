import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon, color = '#a259ff', trend, loading = false }) => {
  return (
    <Card
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      color={color}
    >
      {loading ? (
        <LoadingState>
          <Spinner />
        </LoadingState>
      ) : (
        <>
          <CardHeader>
            <Title>{title}</Title>
            <IconWrapper color={color}>
              {icon}
            </IconWrapper>
          </CardHeader>
          <Value>{value?.toLocaleString() || 0}</Value>
          {trend && (
            <Trend positive={trend.startsWith('+')}>
              {trend}
            </Trend>
          )}
        </>
      )}
    </Card>
  );
};

const Card = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  min-height: 140px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: ${props => props.color};
    opacity: 0.8;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: ${props => props.color};
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color}20;
  color: ${props => props.color};
  font-size: 1.5rem;
`;

const Value = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
  line-height: 1;
`;

const Trend = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.positive ? '#66bb6a' : '#ff6b6b'};
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &::before {
    content: '${props => props.positive ? '↑' : '↓'}';
    font-size: 1rem;
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 100px;
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #a259ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default StatsCard;
