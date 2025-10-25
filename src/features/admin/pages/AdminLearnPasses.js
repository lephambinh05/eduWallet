import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaGraduationCap, 
  FaSearch, 
  FaFilter,
  FaEye,
  FaCheckCircle,
  FaTimes,
  FaCalendar,
  FaUniversity,
  FaUser,
  FaBook,
  FaClock,
  FaExclamationTriangle,
  FaBan,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaPause,
  FaStar,
  FaAward
} from 'react-icons/fa';
import AdminService from '../services/adminService';
import LearnPassDetailModal from '../components/LearnPassDetailModal';
import toast from 'react-hot-toast';

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  position: relative;
  width: 300px;

  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#fff'};
  color: ${props => props.active ? '#fff' : '#333'};
  border: 2px solid ${props => props.active ? 'transparent' : '#e0e0e0'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const FilterPanel = styled(motion.div)`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
  }

  select {
    padding: 0.75rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: linear-gradient(135deg, ${props => props.gradient});
  padding: 1.5rem;
  border-radius: 12px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  h3 {
    font-size: 0.9rem;
    opacity: 0.9;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
  }
`;

const LearnPassGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const LearnPassCard = styled(motion.div)`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => {
    switch(props.status) {
      case 'active': return '#4CAF50';
      case 'suspended': return '#FFC107';
      case 'revoked': return '#F44336';
      case 'expired': return '#9E9E9E';
      default: return '#667eea';
    }
  }};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const LPHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
`;

const LPIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.8rem;
`;

const LPStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch(props.status) {
      case 'active': return '#4CAF50';
      case 'suspended': return '#FFC107';
      case 'revoked': return '#F44336';
      case 'expired': return '#9E9E9E';
      default: return '#667eea';
    }
  }};
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const VerifiedBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #4CAF50;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
`;

const LPInfo = styled.div`
  h3 {
    font-size: 1.1rem;
    color: #333;
    margin: 0 0 0.5rem 0;
    font-weight: 700;
  }

  p {
    color: #666;
    font-size: 0.9rem;
    margin: 0.25rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      color: #667eea;
    }
  }
`;

const ProgressBar = styled.div`
  margin-top: 1rem;
  
  label {
    display: block;
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.percent}%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  transition: width 0.5s ease;
`;

const ProgressText = styled.span`
  display: block;
  text-align: right;
  font-size: 0.85rem;
  color: #667eea;
  font-weight: 700;
  margin-top: 0.25rem;
`;

const LPMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;

  span {
    font-size: 0.85rem;
    color: #666;
    text-align: center;

    strong {
      color: #333;
      display: block;
      font-size: 1.1rem;
      margin-bottom: 0.25rem;
    }

    svg {
      color: #667eea;
      margin-right: 0.25rem;
    }
  }
`;

const LPActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.85rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &.view {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  border: 2px solid #667eea;
  background: ${props => props.active ? '#667eea' : '#fff'};
  color: ${props => props.active ? '#fff' : '#667eea'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: #667eea;
    color: #fff;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  color: #666;
  font-weight: 600;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #667eea;

  svg {
    font-size: 3rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  p {
    margin-top: 1rem;
    font-size: 1.1rem;
    color: #666;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: #999;

  svg {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.5rem;
    color: #666;
    margin-bottom: 0.5rem;
  }

  p {
    color: #999;
  }
`;

const AdminLearnPasses = () => {
  const [learnPasses, setLearnPasses] = useState([]);
  const [filteredLearnPasses, setFilteredLearnPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLearnPass, setSelectedLearnPass] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [institutionFilter, setInstitutionFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    verified: 0,
    suspended: 0
  });

  useEffect(() => {
    fetchLearnPasses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [learnPasses, searchTerm, statusFilter, verificationFilter, institutionFilter]);

  const fetchLearnPasses = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getLearnPasses();
      console.log('📊 LearnPass API Response:', response);
      
      // API returns { success: true, data: { learnPasses: [...] } }
      const lps = (response.data?.learnPasses || response.learnPasses || []).map(lp => ({
        ...lp,
        // Transform institutionId object to institutionName for display
        institutionName: lp.institutionId?.name || 'N/A'
      }));
      
      console.log('🎓 Transformed learnpasses:', lps.length);
      setLearnPasses(lps);
      
      // Calculate stats
      setStats({
        total: lps.length,
        active: lps.filter(lp => lp.status === 'active').length,
        verified: lps.filter(lp => lp.isVerified).length,
        suspended: lps.filter(lp => lp.status === 'suspended').length
      });
    } catch (error) {
      console.error('Error fetching learnpasses:', error);
      toast.error('Không thể tải danh sách LearnPass');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...learnPasses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lp =>
        lp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lp.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lp.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lp => lp.status === statusFilter);
    }

    // Verification filter
    if (verificationFilter !== 'all') {
      const isVerified = verificationFilter === 'verified';
      filtered = filtered.filter(lp => lp.isVerified === isVerified);
    }

    // Institution filter
    if (institutionFilter !== 'all') {
      filtered = filtered.filter(lp => lp.institutionId === institutionFilter);
    }

    setFilteredLearnPasses(filtered);
    setCurrentPage(1);
  };

  const handleViewLearnPass = (learnPass) => {
    setSelectedLearnPass(learnPass);
    setShowDetailModal(true);
  };

  const handleLearnPassUpdated = () => {
    fetchLearnPasses();
  };

  // Pagination
  const totalPages = Math.ceil(filteredLearnPasses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLearnPasses = filteredLearnPasses.slice(startIndex, endIndex);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <FaCheckCircle />;
      case 'suspended': return <FaPause />;
      case 'revoked': return <FaBan />;
      case 'expired': return <FaExclamationTriangle />;
      default: return <FaGraduationCap />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'Hoạt động';
      case 'suspended': return 'Tạm dừng';
      case 'revoked': return 'Đã thu hồi';
      case 'expired': return 'Hết hạn';
      default: return 'Không xác định';
    }
  };

  const calculateProgress = (lp) => {
    if (!lp.academicProgress) return 0;
    const { totalCourses, completedCourses } = lp.academicProgress;
    if (!totalCourses) return 0;
    return Math.round((completedCourses / totalCourses) * 100);
  };

  return (
    <Container>
      <Header>
        <Title>
          <FaGraduationCap />
          Quản lý LearnPass
        </Title>
        <Controls>
          <SearchBox>
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm LearnPass..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <FilterButton 
            active={showFilters}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            Bộ lọc
          </FilterButton>
        </Controls>
      </Header>

      <AnimatePresence>
        {showFilters && (
          <FilterPanel
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <FilterGrid>
              <FilterGroup>
                <label>Trạng thái</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="active">Hoạt động</option>
                  <option value="suspended">Tạm dừng</option>
                  <option value="revoked">Đã thu hồi</option>
                  <option value="expired">Hết hạn</option>
                </select>
              </FilterGroup>

              <FilterGroup>
                <label>Xác thực</label>
                <select 
                  value={verificationFilter} 
                  onChange={(e) => setVerificationFilter(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="verified">Đã xác thực</option>
                  <option value="unverified">Chưa xác thực</option>
                </select>
              </FilterGroup>

              <FilterGroup>
                <label>Cơ sở đào tạo</label>
                <select 
                  value={institutionFilter} 
                  onChange={(e) => setInstitutionFilter(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  {/* Dynamic list of institutions would go here */}
                </select>
              </FilterGroup>
            </FilterGrid>
          </FilterPanel>
        )}
      </AnimatePresence>

      <StatsBar>
        <StatCard
          gradient="#667eea 0%, #764ba2 100%"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>
            <FaGraduationCap />
            Tổng LearnPass
          </h3>
          <p>{stats.total}</p>
        </StatCard>

        <StatCard
          gradient="#4CAF50 0%, #45a049 100%"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3>
            <FaCheckCircle />
            Hoạt động
          </h3>
          <p>{stats.active}</p>
        </StatCard>

        <StatCard
          gradient="#2196F3 0%, #1976D2 100%"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>
            <FaCheckCircle />
            Đã xác thực
          </h3>
          <p>{stats.verified}</p>
        </StatCard>

        <StatCard
          gradient="#FFC107 0%, #FFB300 100%"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3>
            <FaPause />
            Tạm dừng
          </h3>
          <p>{stats.suspended}</p>
        </StatCard>
      </StatsBar>

      {loading ? (
        <LoadingContainer>
          <FaSpinner />
          <p>Đang tải danh sách LearnPass...</p>
        </LoadingContainer>
      ) : currentLearnPasses.length === 0 ? (
        <EmptyState>
          <FaGraduationCap />
          <h3>Không tìm thấy LearnPass</h3>
          <p>Không có LearnPass nào phù hợp với bộ lọc hiện tại</p>
        </EmptyState>
      ) : (
        <>
          <LearnPassGrid>
            {currentLearnPasses.map((lp, index) => {
              const progress = calculateProgress(lp);
              return (
                <LearnPassCard
                  key={lp._id || index}
                  status={lp.status}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleViewLearnPass(lp)}
                >
                  <LPHeader>
                    <LPIcon>
                      <FaGraduationCap />
                    </LPIcon>
                    <div>
                      <LPStatus status={lp.status}>
                        {getStatusIcon(lp.status)}
                        {getStatusText(lp.status)}
                      </LPStatus>
                      {lp.isVerified && (
                        <VerifiedBadge>
                          <FaCheckCircle />
                          Đã xác thực
                        </VerifiedBadge>
                      )}
                    </div>
                  </LPHeader>

                  <LPInfo>
                    <h3>{lp.name || 'N/A'}</h3>
                    <p>
                      <FaUser />
                      <strong>Mã SV:</strong> {lp.studentId || 'N/A'}
                    </p>
                    <p>
                      <FaUniversity />
                      <strong>Cơ sở:</strong> {lp.institutionName || 'N/A'}
                    </p>
                  </LPInfo>

                  <ProgressBar>
                    <label>Tiến độ học tập</label>
                    <ProgressTrack>
                      <ProgressFill percent={progress} />
                    </ProgressTrack>
                    <ProgressText>{progress}%</ProgressText>
                  </ProgressBar>

                  <LPMeta>
                    <span>
                      <strong>
                        <FaBook />
                        {lp.academicProgress?.completedCourses || 0}
                      </strong>
                      Khóa học
                    </span>
                    <span>
                      <strong>
                        <FaAward />
                        {lp.academicProgress?.acquiredSkills || 0}
                      </strong>
                      Kỹ năng
                    </span>
                    <span>
                      <strong>
                        <FaStar />
                        {lp.academicProgress?.gpa || '0.0'}
                      </strong>
                      GPA
                    </span>
                  </LPMeta>

                  <LPActions onClick={(e) => e.stopPropagation()}>
                    <ActionButton 
                      className="view"
                      onClick={() => handleViewLearnPass(lp)}
                    >
                      <FaEye />
                      Chi tiết
                    </ActionButton>
                  </LPActions>
                </LearnPassCard>
              );
            })}
          </LearnPassGrid>

          {totalPages > 1 && (
            <Pagination>
              <PageButton
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <FaChevronLeft />
                Trước
              </PageButton>

              <PageInfo>
                Trang {currentPage} / {totalPages}
              </PageInfo>

              <PageButton
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
                <FaChevronRight />
              </PageButton>
            </Pagination>
          )}
        </>
      )}

      {showDetailModal && selectedLearnPass && (
        <LearnPassDetailModal
          learnPass={selectedLearnPass}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedLearnPass(null);
          }}
          onUpdate={handleLearnPassUpdated}
        />
      )}
    </Container>
  );
};

export default AdminLearnPasses;
