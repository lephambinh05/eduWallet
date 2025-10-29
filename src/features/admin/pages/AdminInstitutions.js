import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUniversity, 
  FaSearch, 
  FaFilter,
  FaEye,
  FaCheckCircle,
  FaTimes,
  FaCalendar,
  FaGlobe,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaExclamationTriangle,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaUserShield,
  FaCertificate
} from 'react-icons/fa';
import AdminService from '../services/adminService';
import InstitutionDetailModal from '../components/InstitutionDetailModal';
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
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }
`;

const FiltersPanel = styled(motion.div)`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FilterGroup = styled.div`
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
  }

  select {
    width: 100%;
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

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: linear-gradient(135deg, ${props => props.gradient});
  border-radius: 12px;
  padding: 1.5rem;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
`;

const InstitutionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const InstitutionCard = styled(motion.div)`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid ${props => {
    if (props.status === 'verified') return '#10b981';
    if (props.status === 'pending') return '#f59e0b';
    if (props.status === 'rejected') return '#ef4444';
    return '#6b7280';
  }};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const InstitutionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
`;

const InstitutionLogo = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: ${props => props.logo ? `url(${props.logo})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const InstitutionInfo = styled.div`
  flex: 1;
  margin-left: 1rem;
`;

const InstitutionName = styled.h3`
  margin: 0 0 0.25rem 0;
  color: #1f2937;
  font-size: 1.1rem;
`;

const InstitutionId = styled.div`
  color: #6b7280;
  font-size: 0.85rem;
  font-family: monospace;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    if (props.status === 'verified') return '#d1fae5';
    if (props.status === 'pending') return '#fef3c7';
    if (props.status === 'rejected') return '#fee2e2';
    return '#f3f4f6';
  }};
  color: ${props => {
    if (props.status === 'verified') return '#065f46';
    if (props.status === 'pending') return '#92400e';
    if (props.status === 'rejected') return '#991b1b';
    return '#374151';
  }};
`;

const InstitutionDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;

  svg {
    color: #9ca3af;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;

  ${props => props.variant === 'approve' && `
    background: #10b981;
    color: white;
    &:hover {
      background: #059669;
    }
  `}

  ${props => props.variant === 'reject' && `
    background: #ef4444;
    color: white;
    &:hover {
      background: #dc2626;
    }
  `}

  ${props => props.variant === 'view' && `
    background: #667eea;
    color: white;
    &:hover {
      background: #5568d3;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#fff'};
  color: ${props => props.active ? '#fff' : '#333'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const LoadingOverlay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #667eea;

  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;

  svg {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    color: #374151;
  }
`;

const AdminInstitutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    verificationStatus: '',
    type: '',
    country: ''
  });
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const response = await AdminService.getInstitutions();
      
      if (response.success && response.data) {
        const institutionsData = response.data.institutions || [];
        setInstitutions(institutionsData);
        
        // Calculate stats
        const total = institutionsData.length;
        const verified = institutionsData.filter(i => i.isVerified === true).length;
        const pending = institutionsData.filter(i => i.isVerified === false && !i.rejectedAt).length;
        const rejected = institutionsData.filter(i => i.rejectedAt).length;
        
        setStats({ total, verified, pending, rejected });
      }
    } catch (error) {
      console.error('Error fetching institutions:', error);
      toast.error('Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (institutionId, e) => {
    e.stopPropagation();
    
    try {
      const response = await AdminService.approveInstitution(institutionId);
      
      if (response.success) {
        toast.success('Institution approved successfully');
        fetchInstitutions();
      }
    } catch (error) {
      console.error('Error approving institution:', error);
      toast.error(error.response?.data?.message || 'Failed to approve institution');
    }
  };

  const handleReject = async (institutionId, e) => {
    e.stopPropagation();
    
    const confirmed = window.confirm('Are you sure you want to reject this institution?');
    if (!confirmed) return;

    try {
      const response = await AdminService.rejectInstitution(institutionId);
      
      if (response.success) {
        toast.success('Institution rejected');
        fetchInstitutions();
      }
    } catch (error) {
      console.error('Error rejecting institution:', error);
      toast.error(error.response?.data?.message || 'Failed to reject institution');
    }
  };

  const handleViewDetails = (institution, e) => {
    e.stopPropagation();
    setSelectedInstitution(institution);
    setShowDetailModal(true);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Filter institutions
  const filteredInstitutions = institutions.filter(institution => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        institution.name?.toLowerCase().includes(search) ||
        institution.institutionId?.toLowerCase().includes(search) ||
        institution.email?.toLowerCase().includes(search);
      
      if (!matchesSearch) return false;
    }

    // Verification status filter
    if (filters.verificationStatus) {
      if (filters.verificationStatus === 'verified' && !institution.isVerified) return false;
      if (filters.verificationStatus === 'pending' && (institution.isVerified || institution.rejectedAt)) return false;
      if (filters.verificationStatus === 'rejected' && !institution.rejectedAt) return false;
    }

    // Type filter
    if (filters.type && institution.type !== filters.type) return false;

    // Country filter
    if (filters.country && institution.address?.country !== filters.country) return false;

    return true;
  });

  const getInstitutionStatus = (institution) => {
    if (institution.rejectedAt) return 'rejected';
    if (institution.isVerified) return 'verified';
    return 'pending';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container>
        <LoadingOverlay>
          <FaSpinner />
          <p>Loading institutions...</p>
        </LoadingOverlay>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FaUniversity />
          Institution Management
        </Title>
        <Controls>
          <SearchBox>
            <FaSearch />
            <input
              type="text"
              placeholder="Search institutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <FilterButton
            active={showFilters}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            Filters
          </FilterButton>
        </Controls>
      </Header>

      <AnimatePresence>
        {showFilters && (
          <FiltersPanel
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <FilterRow>
              <FilterGroup>
                <label>Verification Status</label>
                <select
                  value={filters.verificationStatus}
                  onChange={(e) => handleFilterChange('verificationStatus', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </FilterGroup>

              <FilterGroup>
                <label>Institution Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="university">University</option>
                  <option value="college">College</option>
                  <option value="school">School</option>
                  <option value="training_center">Training Center</option>
                  <option value="online_platform">Online Platform</option>
                  <option value="certification_body">Certification Body</option>
                  <option value="government_agency">Government Agency</option>
                  <option value="private_organization">Private Organization</option>
                  <option value="other">Other</option>
                </select>
              </FilterGroup>

              <FilterGroup>
                <label>Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                >
                  <option value="">All Countries</option>
                  <option value="Vietnam">Vietnam</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Thailand">Thailand</option>
                </select>
              </FilterGroup>
            </FilterRow>
          </FiltersPanel>
        )}
      </AnimatePresence>

      <StatsRow>
        <StatCard gradient="#667eea 0%, #764ba2 100%">
          <StatLabel>Total Institutions</StatLabel>
          <StatValue>{stats.total}</StatValue>
        </StatCard>
        <StatCard gradient="#10b981 0%, #059669 100%">
          <StatLabel>Verified</StatLabel>
          <StatValue>{stats.verified}</StatValue>
        </StatCard>
        <StatCard gradient="#f59e0b 0%, #d97706 100%">
          <StatLabel>Pending Approval</StatLabel>
          <StatValue>{stats.pending}</StatValue>
        </StatCard>
        <StatCard gradient="#ef4444 0%, #dc2626 100%">
          <StatLabel>Rejected</StatLabel>
          <StatValue>{stats.rejected}</StatValue>
        </StatCard>
      </StatsRow>

      {filteredInstitutions.length === 0 ? (
        <EmptyState>
          <FaUniversity />
          <h3>No institutions found</h3>
          <p>Try adjusting your search or filters</p>
        </EmptyState>
      ) : (
        <InstitutionsGrid>
          {filteredInstitutions.map((institution) => {
            const status = getInstitutionStatus(institution);
            return (
              <InstitutionCard
                key={institution._id}
                status={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={(e) => handleViewDetails(institution, e)}
              >
                <InstitutionHeader>
                  <InstitutionLogo logo={institution.logo}>
                    {!institution.logo && institution.name?.charAt(0)}
                  </InstitutionLogo>
                  <InstitutionInfo>
                    <InstitutionName>{institution.name}</InstitutionName>
                    <InstitutionId>{institution.institutionId}</InstitutionId>
                  </InstitutionInfo>
                  <StatusBadge status={status}>{status}</StatusBadge>
                </InstitutionHeader>

                <InstitutionDetails>
                  <DetailRow>
                    <FaEnvelope />
                    <span>{institution.email}</span>
                  </DetailRow>
                  {institution.phone && (
                    <DetailRow>
                      <FaPhone />
                      <span>{institution.phone}</span>
                    </DetailRow>
                  )}
                  {institution.website && (
                    <DetailRow>
                      <FaGlobe />
                      <span>{institution.website}</span>
                    </DetailRow>
                  )}
                  {institution.address?.country && (
                    <DetailRow>
                      <FaMapMarkerAlt />
                      <span>
                        {institution.address.city && `${institution.address.city}, `}
                        {institution.address.country}
                      </span>
                    </DetailRow>
                  )}
                  <DetailRow>
                    <FaClock />
                    <span>Created: {formatDate(institution.createdAt)}</span>
                  </DetailRow>
                </InstitutionDetails>

                <ActionButtons>
                  {status === 'pending' && (
                    <>
                      <ActionButton
                        variant="approve"
                        onClick={(e) => handleApprove(institution._id, e)}
                      >
                        <FaCheckCircle />
                        Approve
                      </ActionButton>
                      <ActionButton
                        variant="reject"
                        onClick={(e) => handleReject(institution._id, e)}
                      >
                        <FaTimes />
                        Reject
                      </ActionButton>
                    </>
                  )}
                  <ActionButton
                    variant="view"
                    onClick={(e) => handleViewDetails(institution, e)}
                  >
                    <FaEye />
                    Details
                  </ActionButton>
                </ActionButtons>
              </InstitutionCard>
            );
          })}
        </InstitutionsGrid>
      )}

      <InstitutionDetailModal
        institution={selectedInstitution}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedInstitution(null);
        }}
        onInstitutionUpdated={fetchInstitutions}
      />
    </Container>
  );
};

export default AdminInstitutions;
