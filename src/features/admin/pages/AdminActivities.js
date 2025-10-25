import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaHistory, FaSearch, FaFilter, FaDownload, FaCalendarAlt,
  FaUser, FaEdit, FaTrash, FaPlus, FaBan, FaCheck, FaUserShield
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import AdminService from '../services/adminService';

const AdminActivities = () => {
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    actionType: '',
    userId: '',
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 50
      };

      if (filters.actionType) params.actionType = filters.actionType;
      if (filters.userId) params.userId = filters.userId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await AdminService.getActivities(params);
      
      if (response.success && response.data) {
        setActivities(response.data.activities || []);
        setPagination(response.data.pagination || {});
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      actionType: '',
      userId: '',
      startDate: '',
      endDate: ''
    });
    setCurrentPage(1);
  };

  const exportActivities = async () => {
    try {
      toast.success('Export feature coming soon!');
      // TODO: Implement export functionality
    } catch (error) {
      toast.error('Failed to export activities');
    }
  };

  const getActivityIcon = (actionType) => {
    const icons = {
      user_created: <FaPlus color="#2ecc71" />,
      user_updated: <FaEdit color="#3498db" />,
      user_deleted: <FaTrash color="#e74c3c" />,
      user_blocked: <FaBan color="#e67e22" />,
      user_unblocked: <FaCheck color="#2ecc71" />,
      user_role_updated: <FaUserShield color="#9b59b6" />,
      user_status_updated: <FaUser color="#3498db" />,
      users_bulk_deleted: <FaTrash color="#e74c3c" />,
      users_bulk_role_updated: <FaUserShield color="#9b59b6" />,
      login: <FaUser color="#2ecc71" />,
      logout: <FaUser color="#95a5a6" />,
    };
    return icons[actionType] || <FaHistory color="#95a5a6" />;
  };

  const getActionLabel = (actionType) => {
    const labels = {
      user_created: 'User Created',
      user_updated: 'User Updated',
      user_deleted: 'User Deleted',
      user_blocked: 'User Blocked',
      user_unblocked: 'User Unblocked',
      user_role_updated: 'Role Changed',
      user_status_updated: 'Status Changed',
      users_bulk_deleted: 'Bulk Delete',
      users_bulk_role_updated: 'Bulk Role Update',
      login: 'User Login',
      logout: 'User Logout',
    };
    return labels[actionType] || actionType;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>
            <FaHistory /> Activity Logs
          </Title>
          <Subtitle>{pagination.total || 0} total activities</Subtitle>
        </HeaderLeft>
        <HeaderRight>
          <Button color="#3498db" onClick={() => setShowFilters(!showFilters)}>
            <FaFilter /> {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
          <Button color="#2ecc71" onClick={exportActivities}>
            <FaDownload /> Export
          </Button>
        </HeaderRight>
      </Header>

      {/* Filters */}
      {showFilters && (
        <FilterPanel
          as={motion.div}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          <FilterGrid>
            <FilterGroup>
              <FilterLabel>Action Type</FilterLabel>
              <Select
                value={filters.actionType}
                onChange={(e) => handleFilterChange('actionType', e.target.value)}
              >
                <option value="">All Actions</option>
                <option value="user_created">User Created</option>
                <option value="user_updated">User Updated</option>
                <option value="user_deleted">User Deleted</option>
                <option value="user_blocked">User Blocked</option>
                <option value="user_unblocked">User Unblocked</option>
                <option value="user_role_updated">Role Changed</option>
                <option value="user_status_updated">Status Changed</option>
                <option value="users_bulk_deleted">Bulk Delete</option>
                <option value="users_bulk_role_updated">Bulk Role Update</option>
              </Select>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>
                <FaCalendarAlt /> Start Date
              </FilterLabel>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>
                <FaCalendarAlt /> End Date
              </FilterLabel>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                min={filters.startDate}
              />
            </FilterGroup>
          </FilterGrid>

          <FilterActions>
            <ClearButton onClick={clearFilters}>Clear Filters</ClearButton>
          </FilterActions>
        </FilterPanel>
      )}

      {/* Activities List */}
      {loading ? (
        <LoadingContainer>
          <Spinner />
          <LoadingText>Loading activities...</LoadingText>
        </LoadingContainer>
      ) : activities.length === 0 ? (
        <EmptyState>
          <FaHistory size={64} />
          <EmptyTitle>No Activities Found</EmptyTitle>
          <EmptyText>There are no activity logs matching your filters.</EmptyText>
        </EmptyState>
      ) : (
        <>
          <Timeline>
            {activities.map((activity, index) => (
              <ActivityCard
                key={activity._id || index}
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ActivityIcon>{getActivityIcon(activity.action)}</ActivityIcon>
                
                <ActivityContent>
                  <ActivityHeader>
                    <ActivityAction>{getActionLabel(activity.action)}</ActivityAction>
                    <ActivityTime>{formatDate(activity.timestamp)}</ActivityTime>
                  </ActivityHeader>

                  <ActivityDetails>
                    <DetailRow>
                      <DetailLabel>Performed by:</DetailLabel>
                      <DetailValue>
                        {activity.performedBy?.username || 'System'} 
                        {activity.performedBy?.email && ` (${activity.performedBy.email})`}
                      </DetailValue>
                    </DetailRow>

                    {activity.targetUser && (
                      <DetailRow>
                        <DetailLabel>Target user:</DetailLabel>
                        <DetailValue>
                          {activity.targetUser.username || activity.details?.targetUserEmail || 'Unknown'}
                        </DetailValue>
                      </DetailRow>
                    )}

                    {activity.details && (
                      <DetailRow>
                        <DetailLabel>Details:</DetailLabel>
                        <DetailValue>
                          {JSON.stringify(activity.details, null, 2)}
                        </DetailValue>
                      </DetailRow>
                    )}

                    {activity.ipAddress && (
                      <DetailRow>
                        <DetailLabel>IP Address:</DetailLabel>
                        <DetailValue>{activity.ipAddress}</DetailValue>
                      </DetailRow>
                    )}
                  </ActivityDetails>

                  {activity.status && (
                    <ActivityStatus $status={activity.status}>
                      {activity.status}
                    </ActivityStatus>
                  )}
                </ActivityContent>
              </ActivityCard>
            ))}
          </Timeline>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Pagination>
              <PaginationInfo>
                Showing {((currentPage - 1) * 50) + 1} to {Math.min(currentPage * 50, pagination.total)} of {pagination.total} activities
              </PaginationInfo>
              <PaginationButtons>
                <PaginationButton
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </PaginationButton>
                
                {[...Array(pagination.pages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === pagination.pages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <PaginationButton
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        $active={currentPage === page}
                      >
                        {page}
                      </PaginationButton>
                    );
                  } else if (page === currentPage - 3 || page === currentPage + 3) {
                    return <PaginationEllipsis key={page}>...</PaginationEllipsis>;
                  }
                  return null;
                })}
                
                <PaginationButton
                  onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                  disabled={currentPage === pagination.pages}
                >
                  Next
                </PaginationButton>
              </PaginationButtons>
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    color: #667eea;
  }
`;

const Subtitle = styled.p`
  margin: 0;
  color: #7f8c8d;
  font-size: 0.95rem;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: ${props => props.color || '#3772ff'};
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const FilterPanel = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #555;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const FilterActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const ClearButton = styled.button`
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #999;
    color: #333;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: #666;
  font-size: 16px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #999;
  
  svg {
    margin-bottom: 24px;
    opacity: 0.5;
  }
`;

const EmptyTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #666;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 16px;
  color: #999;
`;

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ActivityCard = styled.div`
  display: flex;
  gap: 20px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border-left: 4px solid #667eea;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const ActivityIcon = styled.div`
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const ActivityContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

const ActivityAction = styled.h3`
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
  font-weight: 600;
`;

const ActivityTime = styled.span`
  font-size: 13px;
  color: #95a5a6;
`;

const ActivityDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
`;

const DetailRow = styled.div`
  display: flex;
  gap: 8px;
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: #555;
  min-width: 120px;
`;

const DetailValue = styled.span`
  color: #666;
  word-break: break-word;
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
  font-size: 12px;
`;

const ActivityStatus = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  align-self: flex-start;
  background: ${props => props.$status === 'success' ? '#2ecc71' : '#e74c3c'};
  color: white;
  text-transform: uppercase;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PaginationInfo = styled.span`
  color: #666;
  font-size: 14px;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const PaginationButton = styled.button`
  padding: 8px 16px;
  border: 2px solid ${props => props.$active ? '#667eea' : '#e0e0e0'};
  background: ${props => props.$active ? '#667eea' : 'white'};
  color: ${props => props.$active ? 'white' : '#666'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    border-color: #667eea;
    color: ${props => props.$active ? 'white' : '#667eea'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PaginationEllipsis = styled.span`
  padding: 8px 16px;
  color: #666;
`;

export default AdminActivities;
