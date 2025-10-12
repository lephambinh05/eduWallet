import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaSearch, 
  FaSpinner, 
  FaCheck, 
  FaTimes, 
  FaGraduationCap,
  FaCertificate,
  FaMedal,
  FaExternalLinkAlt,
  FaCopy,
  FaShieldAlt,
  FaClock,
  FaUser,
  FaBuilding,
  FaLink
} from 'react-icons/fa';
import portfolioNFTService from '../../services/portfolioNFTService';
import ipfsService from '../../services/ipfsService';
import toast from 'react-hot-toast';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  color: #2d3748;
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #718096;
  font-size: 18px;
`;

const SearchSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const SearchTitle = styled.h2`
  color: #2d3748;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
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
  padding: 15px 20px;
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
  padding: 15px 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 150px;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
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

const PortfolioCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const PortfolioHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h2`
  color: #2d3748;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 10px;
`;

const UserEmail = styled.p`
  color: #718096;
  font-size: 16px;
  margin-bottom: 5px;
`;

const StudentId = styled.p`
  color: #4a5568;
  font-size: 14px;
  font-weight: 500;
`;

const VerificationBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  background: ${props => props.verified ? '#d4edda' : '#fff3cd'};
  color: ${props => props.verified ? '#155724' : '#856404'};
  border: 1px solid ${props => props.verified ? '#c3e6cb' : '#ffeaa7'};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  border: 1px solid #e2e8f0;
`;

const StatIcon = styled.div`
  font-size: 32px;
  color: #667eea;
  margin-bottom: 10px;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #718096;
  font-weight: 500;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  color: #2d3748;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const ItemCard = styled.div`
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const ItemTitle = styled.h4`
  color: #2d3748;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
`;

const ItemIssuer = styled.p`
  color: #718096;
  font-size: 14px;
`;

const ItemScore = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
`;

const ItemDetails = styled.div`
  color: #4a5568;
  font-size: 14px;
  line-height: 1.5;
`;

const MetadataSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-top: 30px;
`;

const MetadataTitle = styled.h4`
  color: #2d3748;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const MetadataItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`;

const MetadataLabel = styled.span`
  color: #4a5568;
  font-weight: 500;
`;

const MetadataValue = styled.span`
  color: #2d3748;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #f7fafc;
  }
`;

const PortfolioViewer = () => {
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info');
  const [searchType, setSearchType] = useState('tokenId'); // tokenId, owner, ipfsHash

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchInput.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setIsLoading(true);
    setStatusMessage('🔍 Searching for portfolio...');
    setStatusType('info');
    setPortfolioData(null);

    try {
      let result;

      switch (searchType) {
        case 'tokenId':
          result = await portfolioNFTService.getCompletePortfolio(parseInt(searchInput));
          break;
        case 'owner':
          const tokenId = await portfolioNFTService.getPortfolioByOwner(searchInput);
          if (tokenId) {
            result = await portfolioNFTService.getCompletePortfolio(parseInt(tokenId));
          } else {
            throw new Error('No portfolio found for this address');
          }
          break;
        case 'ipfsHash':
          // Direct IPFS lookup
          const detailedData = await ipfsService.getPortfolioData(searchInput);
          result = {
            detailedData,
            isValid: true,
            tokenId: 'IPFS Direct'
          };
          break;
        default:
          throw new Error('Invalid search type');
      }

      setPortfolioData(result);
      setStatusMessage('✅ Portfolio found successfully!');
      setStatusType('success');

    } catch (error) {
      console.error('Search error:', error);
      setStatusMessage(`❌ Error: ${error.message}`);
      setStatusType('error');
      toast.error(`Search failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderPortfolio = () => {
    if (!portfolioData) return null;

    const { detailedData, isValid, tokenId } = portfolioData;
    const { user, courses, certificates, badges, statistics } = detailedData;

    return (
      <PortfolioCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PortfolioHeader>
          <UserInfo>
            <UserName>{user.firstName} {user.lastName}</UserName>
            <UserEmail>{user.email}</UserEmail>
            {user.studentId && <StudentId>Student ID: {user.studentId}</StudentId>}
          </UserInfo>
          <VerificationBadge verified={isValid}>
            <FaShieldAlt />
            {isValid ? 'Verified' : 'Unverified'}
          </VerificationBadge>
        </PortfolioHeader>

        <StatsGrid>
          <StatCard>
            <StatIcon><FaGraduationCap /></StatIcon>
            <StatNumber>{courses.length}</StatNumber>
            <StatLabel>Khóa học</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon><FaCertificate /></StatIcon>
            <StatNumber>{certificates.length}</StatNumber>
            <StatLabel>Chứng chỉ</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon><FaMedal /></StatIcon>
            <StatNumber>{badges.length}</StatNumber>
            <StatLabel>Huy hiệu</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon><FaUser /></StatIcon>
            <StatNumber>{statistics.gpa}</StatNumber>
            <StatLabel>GPA</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Thông tin học tập chi tiết */}
        <Section>
          <SectionTitle>
            <FaUser />
            Thông tin Học tập Chi tiết
          </SectionTitle>
          <div style={{ 
            background: 'white', 
            border: '2px solid #e2e8f0', 
            borderRadius: '12px', 
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <p><strong>📊 Tổng tín chỉ:</strong> {statistics.totalCredits}</p>
                <p><strong>✅ Đã hoàn thành:</strong> {statistics.completedCredits}</p>
              </div>
              <div>
                <p><strong>📈 Tỷ lệ hoàn thành:</strong> {statistics.completionRate}%</p>
                <p><strong>🎯 Điểm trung bình:</strong> {statistics.averageScore}%</p>
              </div>
              <div>
                <p><strong>🔥 Chuỗi học tập:</strong> {statistics.learningStreak} ngày</p>
                <p><strong>⏰ Tổng giờ học:</strong> {statistics.totalStudyHours} giờ</p>
              </div>
            </div>
          </div>
        </Section>

        {courses.length > 0 && (
          <Section>
            <SectionTitle>
              <FaGraduationCap />
              Chi tiết Khóa học ({courses.length})
            </SectionTitle>
            <ItemsGrid>
              {courses.map((course, index) => (
                <ItemCard key={index}>
                  <ItemHeader>
                    <div>
                      <ItemTitle>{course.courseName}</ItemTitle>
                      <ItemIssuer>📚 {course.issuer}</ItemIssuer>
                    </div>
                    {course.score && (
                      <ItemScore>{course.score}%</ItemScore>
                    )}
                  </ItemHeader>
                  <ItemDetails>
                    <div style={{ marginBottom: '10px' }}>
                      <p><strong>📋 Mã khóa học:</strong> {course.courseCode}</p>
                      <p><strong>🎯 Tín chỉ:</strong> {course.credits} credits</p>
                      <p><strong>⭐ Điểm:</strong> {course.grade} ({course.score}%)</p>
                    </div>
                    {course.instructor && (
                      <p><strong>👨‍🏫 Giảng viên:</strong> {course.instructor}</p>
                    )}
                    {course.semester && (
                      <p><strong>📅 Học kỳ:</strong> {course.semester}</p>
                    )}
                    {course.gpa && (
                      <p><strong>📊 GPA:</strong> {course.gpa}</p>
                    )}
                  </ItemDetails>
                </ItemCard>
              ))}
            </ItemsGrid>
          </Section>
        )}

        {certificates.length > 0 && (
          <Section>
            <SectionTitle>
              <FaCertificate />
              Chi tiết Chứng chỉ ({certificates.length})
            </SectionTitle>
            <ItemsGrid>
              {certificates.map((cert, index) => (
                <ItemCard key={index}>
                  <ItemHeader>
                    <div>
                      <ItemTitle>{cert.name}</ItemTitle>
                      <ItemIssuer>🏆 {cert.issuer}</ItemIssuer>
                    </div>
                    {cert.score && (
                      <ItemScore>{cert.score}%</ItemScore>
                    )}
                  </ItemHeader>
                  <ItemDetails>
                    <div style={{ marginBottom: '10px' }}>
                      <p><strong>📊 Cấp độ:</strong> {cert.level}</p>
                      <p><strong>📂 Danh mục:</strong> {cert.category}</p>
                      <p><strong>📅 Ngày cấp:</strong> {formatDate(cert.issuedDate)}</p>
                    </div>
                    {cert.description && (
                      <p><strong>📝 Mô tả:</strong> {cert.description}</p>
                    )}
                    {cert.verificationUrl && (
                      <p>
                        <strong>🔗 Xác thực:</strong>{' '}
                        <a 
                          href={cert.verificationUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#667eea', textDecoration: 'none' }}
                        >
                          <FaExternalLinkAlt style={{ fontSize: '12px' }} /> Xem chứng chỉ
                        </a>
                      </p>
                    )}
                    {cert.expiryDate && (
                      <p><strong>⏰ Hết hạn:</strong> {formatDate(cert.expiryDate)}</p>
                    )}
                  </ItemDetails>
                </ItemCard>
              ))}
            </ItemsGrid>
          </Section>
        )}

        {badges.length > 0 && (
          <Section>
            <SectionTitle>
              <FaMedal />
              Chi tiết Huy hiệu ({badges.length})
            </SectionTitle>
            <ItemsGrid>
              {badges.map((badge, index) => (
                <ItemCard key={index}>
                  <ItemHeader>
                    <div>
                      <ItemTitle>{badge.name}</ItemTitle>
                      <ItemIssuer>🎖️ {badge.issuer}</ItemIssuer>
                    </div>
                    {badge.score && (
                      <ItemScore>{badge.score}%</ItemScore>
                    )}
                  </ItemHeader>
                  <ItemDetails>
                    <div style={{ marginBottom: '10px' }}>
                      <p><strong>📂 Danh mục:</strong> {badge.category}</p>
                      <p><strong>📊 Cấp độ:</strong> {badge.level}</p>
                      <p><strong>🏅 Đạt được:</strong> {formatDate(badge.earnedDate)}</p>
                    </div>
                    {badge.description && (
                      <p><strong>📝 Mô tả:</strong> {badge.description}</p>
                    )}
                    {badge.verificationUrl && (
                      <p>
                        <strong>🔗 Xác thực:</strong>{' '}
                        <a 
                          href={badge.verificationUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#667eea', textDecoration: 'none' }}
                        >
                          <FaExternalLinkAlt style={{ fontSize: '12px' }} /> Xem huy hiệu
                        </a>
                      </p>
                    )}
                    {badge.criteria && (
                      <p><strong>🎯 Tiêu chí:</strong> {badge.criteria}</p>
                    )}
                  </ItemDetails>
                </ItemCard>
              ))}
            </ItemsGrid>
          </Section>
        )}

        {/* Thông tin xác thực và bảo mật */}
        <Section>
          <SectionTitle>
            <FaShieldAlt />
            Thông tin Xác thực & Bảo mật
          </SectionTitle>
          <div style={{ 
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
            border: '2px solid #dee2e6', 
            borderRadius: '12px', 
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <h4 style={{ color: '#495057', marginBottom: '10px' }}>🔐 Bảo mật Dữ liệu</h4>
                <p><strong>✅ Tính toàn vẹn:</strong> {isValid ? 'Đã xác thực' : 'Chưa xác thực'}</p>
                <p><strong>🔗 Blockchain:</strong> Lưu trữ vĩnh viễn</p>
                <p><strong>🌐 IPFS:</strong> Phân tán và bảo mật</p>
              </div>
              <div>
                <h4 style={{ color: '#495057', marginBottom: '10px' }}>📊 Thông tin Kỹ thuật</h4>
                <p><strong>🆔 Token ID:</strong> {tokenId}</p>
                <p><strong>📝 Version:</strong> {detailedData.version}</p>
                <p><strong>⏰ Cập nhật:</strong> {formatDate(detailedData.timestamp)}</p>
              </div>
              <div>
                <h4 style={{ color: '#495057', marginBottom: '10px' }}>🏛️ Xác thực</h4>
                <p><strong>🏢 Institution:</strong> {detailedData.institution || 'Self-verified'}</p>
                <p><strong>🔍 Verification:</strong> {detailedData.isVerified ? 'Verified' : 'Pending'}</p>
                <p><strong>📋 Status:</strong> {isValid ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </div>
        </Section>

        <MetadataSection>
          <MetadataTitle>
            <FaLink />
            Portfolio Metadata
          </MetadataTitle>
          <MetadataGrid>
            <MetadataItem>
              <MetadataLabel>Token ID</MetadataLabel>
              <MetadataValue>
                {tokenId}
                <CopyButton onClick={() => copyToClipboard(tokenId.toString())}>
                  <FaCopy />
                </CopyButton>
              </MetadataValue>
            </MetadataItem>
            <MetadataItem>
              <MetadataLabel>Version</MetadataLabel>
              <MetadataValue>{detailedData.version}</MetadataValue>
            </MetadataItem>
            <MetadataItem>
              <MetadataLabel>Last Updated</MetadataLabel>
              <MetadataValue>
                <FaClock style={{ fontSize: '12px' }} />
                {formatDate(detailedData.timestamp)}
              </MetadataValue>
            </MetadataItem>
            <MetadataItem>
              <MetadataLabel>Data Integrity</MetadataLabel>
              <MetadataValue>
                {isValid ? (
                  <>
                    <FaCheck style={{ color: '#28a745' }} />
                    Verified
                  </>
                ) : (
                  <>
                    <FaTimes style={{ color: '#dc3545' }} />
                    Unverified
                  </>
                )}
              </MetadataValue>
            </MetadataItem>
            {detailedData.institution && (
              <MetadataItem>
                <MetadataLabel>Institution</MetadataLabel>
                <MetadataValue>
                  <FaBuilding style={{ fontSize: '12px' }} />
                  {detailedData.institution}
                </MetadataValue>
              </MetadataItem>
            )}
          </MetadataGrid>
        </MetadataSection>
      </PortfolioCard>
    );
  };

  return (
    <Container>
      <Header>
        <Title>Portfolio NFT Viewer</Title>
        <Subtitle>Xem và xác thực portfolio học tập chi tiết trên blockchain</Subtitle>
      </Header>

      <SearchSection>
        <SearchTitle>
          <FaSearch />
          Tìm kiếm Portfolio
        </SearchTitle>
        
        <SearchForm onSubmit={handleSearch}>
          <Input
            type="text"
            placeholder={
              searchType === 'tokenId' ? 'Nhập Token ID (ví dụ: 1)' :
              searchType === 'owner' ? 'Nhập địa chỉ ví (0x...)' :
              'Nhập IPFS Hash (Qm...)'
            }
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <select 
            value={searchType} 
            onChange={(e) => setSearchType(e.target.value)}
            style={{
              padding: '15px',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '16px',
              background: 'white'
            }}
          >
            <option value="tokenId">Token ID</option>
            <option value="owner">Địa chỉ chủ sở hữu</option>
            <option value="ipfsHash">IPFS Hash</option>
          </select>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner />
                Đang tìm kiếm...
              </>
            ) : (
              <>
                <FaSearch />
                Tìm kiếm
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

      {renderPortfolio()}
    </Container>
  );
};

export default PortfolioViewer;
