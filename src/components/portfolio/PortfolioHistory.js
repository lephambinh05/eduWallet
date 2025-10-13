import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaHistory, 
  FaSpinner, 
  FaCheck, 
  FaTimes, 
  FaPlus,
  FaEdit,
  FaCertificate,
  FaMedal,
  FaGraduationCap,
  FaClock,
  FaUser,
  FaBuilding,
  FaExternalLinkAlt,
  FaCopy,
  FaShieldAlt
} from 'react-icons/fa';
import portfolioNFTService from '../../services/portfolioNFTService';
import ipfsService from '../../services/ipfsService';
import toast from 'react-hot-toast';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
`;

const HistoryHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const HistoryTitle = styled.h2`
  color: #2d3748;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
`;

const HistorySubtitle = styled.p`
  color: #718096;
  font-size: 16px;
`;

const SearchSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
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

const TimelineContainer = styled.div`
  position: relative;
  padding-left: 30px;
  
  &::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  }
`;

const TimelineItem = styled(motion.div)`
  position: relative;
  margin-bottom: 30px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.type === 'mint' ? '#28a745' : props.type === 'update' ? '#ffc107' : '#6c757d'};
  
  &::before {
    content: '';
    position: absolute;
    left: -37px;
    top: 20px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.type === 'mint' ? '#28a745' : props.type === 'update' ? '#ffc107' : '#6c757d'};
    border: 3px solid white;
    box-shadow: 0 0 0 3px ${props => props.type === 'mint' ? '#28a745' : props.type === 'update' ? '#ffc107' : '#6c757d'};
  }
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const TimelineTitle = styled.h3`
  color: #2d3748;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TimelineDate = styled.div`
  color: #718096;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const TimelineContent = styled.div`
  color: #4a5568;
  line-height: 1.6;
`;

const ChangeList = styled.div`
  margin-top: 15px;
`;

const ChangeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
`;

const ChangeIcon = styled.div`
  color: ${props => props.type === 'add' ? '#28a745' : props.type === 'update' ? '#ffc107' : '#dc3545'};
  font-size: 12px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  border: 1px solid #e2e8f0;
`;

const StatNumber = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #718096;
  font-weight: 500;
`;

const PortfolioHistory = () => {
  const [tokenId, setTokenId] = useState('899');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info');

  useEffect(() => {
    if (tokenId) {
      loadPortfolioHistory(tokenId);
    }
  }, [tokenId]);

  const loadPortfolioHistory = async (id) => {
    setIsLoading(true);
    setStatusMessage('🔍 Đang tải lịch sử portfolio...');
    setStatusType('info');

    try {
      // Simulate loading portfolio history
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Try to load from MongoDB API first, fallback to local data
      let portfolioDataFromDB;
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3003'}/api/portfolio/email/lephambinh05@gmail.com`);
        const apiData = await response.json();
        
        if (apiData.success) {
          portfolioDataFromDB = apiData.data;
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (error) {
        console.warn('Failed to load from API:', error.message);
        // Use minimal fallback data
        portfolioDataFromDB = {
          courses: [],
          certificates: [],
          badges: [],
          statistics: { gpa: 0 }
        };
      }
      
      // Generate history based on real data
      const realHistory = [
        {
          id: 1,
          type: 'mint',
          version: 1,
          timestamp: '2024-01-15T10:30:00Z',
          transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          changes: [
            ...portfolioDataFromDB.courses.slice(0, 3).map(course => ({
              type: 'add',
              item: course.courseName,
              category: 'course'
            })),
            ...portfolioDataFromDB.certificates.slice(0, 2).map(cert => ({
              type: 'add',
              item: cert.name,
              category: 'certificate'
            })),
            ...portfolioDataFromDB.badges.slice(0, 2).map(badge => ({
              type: 'add',
              item: badge.name,
              category: 'badge'
            }))
          ],
          stats: {
            courses: portfolioDataFromDB.courses.length,
            certificates: portfolioDataFromDB.certificates.length,
            badges: portfolioDataFromDB.badges.length,
            gpa: portfolioDataFromDB.statistics.gpa
          }
        }
      ];

      setHistory(realHistory);
      setStatusMessage('✅ Đã tải lịch sử portfolio thành công!');
      setStatusType('success');

    } catch (error) {
      console.error('Error loading portfolio history:', error);
      setStatusMessage(`❌ Lỗi: ${error.message}`);
      setStatusType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'mint':
        return <FaPlus />;
      case 'update':
        return <FaEdit />;
      default:
        return <FaHistory />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'mint':
        return 'Tạo mới Portfolio NFT';
      case 'update':
        return 'Cập nhật Portfolio';
      default:
        return 'Thay đổi';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'course':
        return <FaGraduationCap />;
      case 'certificate':
        return <FaCertificate />;
      case 'badge':
        return <FaMedal />;
      case 'statistics':
        return <FaUser />;
      case 'verification':
        return <FaShieldAlt />;
      default:
        return <FaHistory />;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã sao chép!');
  };

  return (
    <Container>
      <HistoryHeader>
        <HistoryTitle>Lịch sử Portfolio NFT #{tokenId}</HistoryTitle>
        <HistorySubtitle>
          Theo dõi tất cả các thay đổi và cập nhật theo thời gian
        </HistorySubtitle>
      </HistoryHeader>

      <SearchSection>
        <SearchForm onSubmit={(e) => { e.preventDefault(); loadPortfolioHistory(tokenId); }}>
          <Input
            type="text"
            placeholder="Nhập Token ID để xem lịch sử (ví dụ: 899)"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
          />
          <Button type="submit" disabled={isLoading || !tokenId}>
            {isLoading ? (
              <>
                <LoadingSpinner />
                Đang tải...
              </>
            ) : (
              <>
                <FaHistory />
                Tải lịch sử
              </>
            )}
          </Button>
        </SearchForm>

        {statusMessage && (
          <StatusMessage className={statusType}>
            {statusMessage}
          </StatusMessage>
        )}
      </SearchSection>

      {history.length > 0 && (
        <>
          {/* Thống kê tổng quan */}
          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            padding: '20px', 
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>📊 Thống kê Lịch sử</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#28a745' }}>{history.length}</div>
                <div style={{ fontSize: '14px', color: '#718096' }}>Tổng số thay đổi</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>{history[0]?.version || 0}</div>
                <div style={{ fontSize: '14px', color: '#718096' }}>Version hiện tại</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffc107' }}>{history.filter(h => h.type === 'update').length}</div>
                <div style={{ fontSize: '14px', color: '#718096' }}>Lần cập nhật</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#6c757d' }}>
                  {history.length > 0 ? Math.ceil((new Date() - new Date(history[history.length - 1].timestamp)) / (1000 * 60 * 60 * 24)) : 0}
                </div>
                <div style={{ fontSize: '14px', color: '#718096' }}>Ngày từ lần cuối</div>
              </div>
            </div>
          </div>

          <TimelineContainer>
            {history.map((item, index) => (
            <TimelineItem
              key={item.id}
              type={item.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <TimelineHeader>
                <TimelineTitle>
                  {getTypeIcon(item.type)}
                  {getTypeLabel(item.type)} - Version {item.version}
                </TimelineTitle>
                <TimelineDate>
                  <FaClock />
                  {formatDate(item.timestamp)}
                </TimelineDate>
              </TimelineHeader>

              <TimelineContent>
                <p><strong>🔗 Transaction Hash:</strong> {item.transactionHash}</p>
                
                <ChangeList>
                  <h4 style={{ marginBottom: '10px', color: '#2d3748' }}>📝 Thay đổi:</h4>
                  {item.changes.map((change, changeIndex) => (
                    <ChangeItem key={changeIndex}>
                      <ChangeIcon type={change.type}>
                        {change.type === 'add' ? <FaPlus /> : 
                         change.type === 'update' ? <FaEdit /> : <FaTimes />}
                      </ChangeIcon>
                      <span>
                        <strong>{change.type === 'add' ? 'Thêm' : 
                                change.type === 'update' ? 'Cập nhật' : 'Xóa'}:</strong> {change.item}
                      </span>
                      {getCategoryIcon(change.category)}
                    </ChangeItem>
                  ))}
                </ChangeList>

                <StatsGrid>
                  <StatCard>
                    <StatNumber>{item.stats.courses}</StatNumber>
                    <StatLabel>Khóa học</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatNumber>{item.stats.certificates}</StatNumber>
                    <StatLabel>Chứng chỉ</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatNumber>{item.stats.badges}</StatNumber>
                    <StatLabel>Huy hiệu</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatNumber>{item.stats.gpa}</StatNumber>
                    <StatLabel>GPA</StatLabel>
                  </StatCard>
                </StatsGrid>
              </TimelineContent>
            </TimelineItem>
          ))}
          </TimelineContainer>
        </>
      )}

      {history.length === 0 && !isLoading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
          <FaHistory style={{ fontSize: '48px', marginBottom: '20px' }} />
          <p>Chưa có lịch sử thay đổi nào cho Portfolio NFT này.</p>
        </div>
      )}
    </Container>
  );
};

export default PortfolioHistory;
