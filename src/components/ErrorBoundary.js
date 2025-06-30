import React from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  color: #ff6b6b;
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h2`
  color: #fff;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  margin-bottom: 2rem;
  max-width: 500px;
  line-height: 1.6;
`;

const RetryButton = styled.button`
  background: linear-gradient(90deg, #a259ff, #3772ff);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(162, 89, 255, 0.3);
  }
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorIcon>
            <FaExclamationTriangle />
          </ErrorIcon>
          <ErrorTitle>Đã xảy ra lỗi</ErrorTitle>
          <ErrorMessage>
            Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.
          </ErrorMessage>
          <RetryButton onClick={this.handleRetry}>
            <FaRedo />
            Thử lại
          </RetryButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 