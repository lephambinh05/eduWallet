import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCertificate, 
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
  FaChevronRight
} from 'react-icons/fa';
import AdminService from '../services/adminService';
import CertificateDetailModal from '../components/CertificateDetailModal';
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

  select, input {
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

const CertificateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const CertificateCard = styled(motion.div)`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => {
    switch(props.status) {
      case 'verified': return '#4CAF50';
      case 'pending': return '#FFC107';
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

const CertHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
`;

const CertIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.5rem;
`;

const CertStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch(props.status) {
      case 'verified': return '#4CAF50';
      case 'pending': return '#FFC107';
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

const CertInfo = styled.div`
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

const CertMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;

  span {
    font-size: 0.85rem;
    color: #666;

    strong {
      color: #333;
      display: block;
      font-size: 0.95rem;
    }
  }
`;

const CertActions = styled.div`
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

  &.verify {
    background: #4CAF50;
    color: #fff;
  }

  &.revoke {
    background: #F44336;
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

const AdminCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [institutionFilter, setInstitutionFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    revoked: 0
  });

  useEffect(() => {
    fetchCertificates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [certificates, searchTerm, statusFilter, institutionFilter, dateFromFilter, dateToFilter]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getCertificates();
      console.log('📊 API Response:', response);
      console.log('📊 Response.data:', response.data);
      
      // API returns { success: true, data: { certificates: [...] } }
      const certs = (response.data?.certificates || response.certificates || []).map(cert => ({
        ...cert,
        // Transform student object to studentName for display
        studentName: cert.student ? `${cert.student.firstName || ''} ${cert.student.lastName || ''}`.trim() : 'N/A',
        // Keep issuerName as is (already in Certificate model)
      }));
      
      console.log('📜 Transformed certificates:', certs.length);
      setCertificates(certs);
      
      // Calculate stats - use isVerified boolean not status
      setStats({
        total: certs.length,
        verified: certs.filter(c => c.isVerified === true).length,
        pending: certs.filter(c => c.isVerified === false).length,
        revoked: certs.filter(c => c.status === 'revoked').length
      });
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Không thể tải danh sách chứng chỉ');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...certificates];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificateId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.issuerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(cert => cert.status === statusFilter);
    }

    // Institution filter
    if (institutionFilter !== 'all') {
      filtered = filtered.filter(cert => cert.issuer === institutionFilter);
    }

    // Date range filter
    if (dateFromFilter) {
      filtered = filtered.filter(cert => 
        new Date(cert.issueDate) >= new Date(dateFromFilter)
      );
    }
    if (dateToFilter) {
      filtered = filtered.filter(cert => 
        new Date(cert.issueDate) <= new Date(dateToFilter)
      );
    }

    setFilteredCertificates(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setShowDetailModal(true);
  };

  const handleCertificateUpdated = () => {
    fetchCertificates();
  };

  // Pagination
  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCertificates = filteredCertificates.slice(startIndex, endIndex);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'verified': return <FaCheckCircle />;
      case 'pending': return <FaClock />;
      case 'revoked': return <FaBan />;
      case 'expired': return <FaExclamationTriangle />;
      default: return <FaCertificate />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'verified': return 'Đã xác thực';
      case 'pending': return 'Chờ xác thực';
      case 'revoked': return 'Đã thu hồi';
      case 'expired': return 'Hết hạn';
      default: return 'Không xác định';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <Container>
      <Header>
        <Title>
          <FaCertificate />
          Quản lý Chứng chỉ
        </Title>
        <Controls>
          <SearchBox>
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm chứng chỉ..."
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
                  <option value="verified">Đã xác thực</option>
                  <option value="pending">Chờ xác thực</option>
                  <option value="revoked">Đã thu hồi</option>
                  <option value="expired">Hết hạn</option>
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

              <FilterGroup>
                <label>Từ ngày</label>
                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                />
              </FilterGroup>

              <FilterGroup>
                <label>Đến ngày</label>
                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                />
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
            <FaCertificate />
            Tổng chứng chỉ
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
            Đã xác thực
          </h3>
          <p>{stats.verified}</p>
        </StatCard>

        <StatCard
          gradient="#FFC107 0%, #FFB300 100%"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>
            <FaClock />
            Chờ xác thực
          </h3>
          <p>{stats.pending}</p>
        </StatCard>

        <StatCard
          gradient="#F44336 0%, #E53935 100%"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3>
            <FaBan />
            Đã thu hồi
          </h3>
          <p>{stats.revoked}</p>
        </StatCard>
      </StatsBar>

      {loading ? (
        <LoadingContainer>
          <FaSpinner />
          <p>Đang tải danh sách chứng chỉ...</p>
        </LoadingContainer>
      ) : currentCertificates.length === 0 ? (
        <EmptyState>
          <FaCertificate />
          <h3>Không tìm thấy chứng chỉ</h3>
          <p>Không có chứng chỉ nào phù hợp với bộ lọc hiện tại</p>
        </EmptyState>
      ) : (
        <>
          <CertificateGrid>
            {currentCertificates.map((cert, index) => (
              <CertificateCard
                key={cert._id || index}
                status={cert.status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleViewCertificate(cert)}
              >
                <CertHeader>
                  <CertIcon>
                    <FaCertificate />
                  </CertIcon>
                  <CertStatus status={cert.status}>
                    {getStatusIcon(cert.status)}
                    {getStatusText(cert.status)}
                  </CertStatus>
                </CertHeader>

                <CertInfo>
                  <h3>{cert.courseName || 'N/A'}</h3>
                  <p>
                    <FaUser />
                    <strong>Sinh viên:</strong> {cert.studentName || 'N/A'}
                  </p>
                  <p>
                    <FaUniversity />
                    <strong>Cơ sở:</strong> {cert.issuerName || 'N/A'}
                  </p>
                  <p>
                    <FaBook />
                    <strong>Mã:</strong> {cert.certificateId || 'N/A'}
                  </p>
                </CertInfo>

                <CertMeta>
                  <span>
                    <strong>{cert.gradeOrScore || 'N/A'}</strong>
                    Điểm số
                  </span>
                  <span>
                    <strong>{formatDate(cert.issueDate)}</strong>
                    Ngày cấp
                  </span>
                </CertMeta>

                <CertActions onClick={(e) => e.stopPropagation()}>
                  <ActionButton 
                    className="view"
                    onClick={() => handleViewCertificate(cert)}
                  >
                    <FaEye />
                    Chi tiết
                  </ActionButton>
                </CertActions>
              </CertificateCard>
            ))}
          </CertificateGrid>

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

      {showDetailModal && selectedCertificate && (
        <CertificateDetailModal
          certificate={selectedCertificate}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCertificate(null);
          }}
          onUpdate={handleCertificateUpdated}
        />
      )}
    </Container>
  );
};

export default AdminCertificates;
