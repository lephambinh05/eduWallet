import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHistory, FaSearch, FaFilter, FaDownload, FaCalendarAlt,
  FaUser, FaEdit, FaTrash, FaPlus, FaBan, FaCheck, FaUserShield,
  FaChartLine, FaClock, FaExclamationTriangle, FaCheckCircle,
  FaTimes, FaEye, FaChevronDown, FaChevronUp, FaFileExport,
  FaUserClock, FaUserEdit, FaUserMinus, FaUserPlus, FaShieldAlt,
  FaServer, FaDatabase, FaLock, FaUnlock, FaSyncAlt
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
    endDate: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list or cards
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    byType: {}
  });

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    // Reset to page 1 when filters change
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchActivities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 20
      };

      if (filters.actionType) params.actionType = filters.actionType;
      if (filters.userId) params.userId = filters.userId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await AdminService.getActivities(params);
      
      if (response.success && response.data) {
        const fetchedActivities = response.data.activities || [];
        setActivities(fetchedActivities);
        setPagination(response.data.pagination || {});
        
        // Calculate stats
        calculateStats(fetchedActivities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (activitiesData) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayCount = activitiesData.filter(a => new Date(a.timestamp || a.createdAt) >= startOfToday).length;
    const weekCount = activitiesData.filter(a => new Date(a.timestamp || a.createdAt) >= startOfWeek).length;

    const byType = {};
    activitiesData.forEach(a => {
      const type = a.action || a.actionType || 'unknown';
      byType[type] = (byType[type] || 0) + 1;
    });

    setStats({
      total: pagination.total || activitiesData.length,
      today: todayCount,
      thisWeek: weekCount,
      byType
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      actionType: '',
      userId: '',
      startDate: '',
      endDate: '',
      search: ''
    });
  };

  const exportActivities = async () => {
    try {
      // Create CSV content
      const headers = ['Timestamp', 'Action', 'User', 'Target', 'Status', 'IP Address'];
      const rows = activities.map(a => [
        formatFullDate(a.timestamp || a.createdAt),
        getActionLabel(a.action || a.actionType),
        a.performedBy?.username || 'System',
        a.targetUser?.username || a.details?.targetUserEmail || '-',
        a.status || 'success',
        a.ipAddress || '-'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `activities_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast.success('Activities exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export activities');
    }
  };

  const filteredActivities = useMemo(() => {
    if (!filters.search) return activities;
    
    const searchLower = filters.search.toLowerCase();
    return activities.filter(a => {
      const action = getActionLabel(a.action || a.actionType).toLowerCase();
      const user = (a.performedBy?.username || '').toLowerCase();
      const target = (a.targetUser?.username || a.details?.targetUserEmail || '').toLowerCase();
      
      return action.includes(searchLower) || user.includes(searchLower) || target.includes(searchLower);
    });
  }, [activities, filters.search]);

  const getActivityIcon = (actionType) => {
    const icons = {
      user_created: { icon: <FaUserPlus />, color: '#2ecc71', bg: '#d4edda' },
      user_updated: { icon: <FaUserEdit />, color: '#3498db', bg: '#d1ecf1' },
      user_deleted: { icon: <FaUserMinus />, color: '#e74c3c', bg: '#f8d7da' },
      user_blocked: { icon: <FaBan />, color: '#e67e22', bg: '#fff3cd' },
      user_unblocked: { icon: <FaUnlock />, color: '#2ecc71', bg: '#d4edda' },
      user_role_updated: { icon: <FaUserShield />, color: '#9b59b6', bg: '#e8daef' },
      user_status_updated: { icon: <FaSyncAlt />, color: '#3498db', bg: '#d1ecf1' },
      users_bulk_deleted: { icon: <FaTrash />, color: '#e74c3c', bg: '#f8d7da' },
      users_bulk_role_updated: { icon: <FaShieldAlt />, color: '#9b59b6', bg: '#e8daef' },
      login: { icon: <FaLock />, color: '#2ecc71', bg: '#d4edda' },
      logout: { icon: <FaUnlock />, color: '#95a5a6', bg: '#ecf0f1' },
      institution_approved: { icon: <FaCheckCircle />, color: '#2ecc71', bg: '#d4edda' },
      institution_rejected: { icon: <FaTimes />, color: '#e74c3c', bg: '#f8d7da' },
    };
    return icons[actionType] || { icon: <FaHistory />, color: '#95a5a6', bg: '#ecf0f1' };
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
      login: 'Login',
      logout: 'Logout',
      institution_approved: 'Institution Approved',
      institution_rejected: 'Institution Rejected',
    };
    return labels[actionType] || actionType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Container>
      {/* Header */}
      <Header>
        <HeaderLeft>
          <Title>
            <IconWrapper color="#667eea">
              <FaHistory />
            </IconWrapper>
            Activity Logs
          </Title>
          <Subtitle>Track all system activities and user actions</Subtitle>
        </HeaderLeft>
        <HeaderRight>
          <ViewModeToggle>
            <ViewModeButton 
              $active={viewMode === 'list'}
              onClick={() => setViewMode('list')}
            >
              List View
            </ViewModeButton>
            <ViewModeButton 
              $active={viewMode === 'cards'}
              onClick={() => setViewMode('cards')}
            >
              Card View
            </ViewModeButton>
          </ViewModeToggle>
          <Button color="#3498db" onClick={() => setShowFilters(!showFilters)}>
            <FaFilter /> {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
          <Button color="#2ecc71" onClick={exportActivities}>
            <FaFileExport /> Export CSV
          </Button>
        </HeaderRight>
      </Header>

      {/* Stats Cards */}
      <StatsGrid>
        <StatCard>
          <StatIcon color="#667eea">
            <FaHistory />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.total.toLocaleString()}</StatValue>
            <StatLabel>Total Activities</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon color="#2ecc71">
            <FaClock />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.today}</StatValue>
            <StatLabel>Today</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon color="#3498db">
            <FaCalendarAlt />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.thisWeek}</StatValue>
            <StatLabel>This Week</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon color="#9b59b6">
            <FaChartLine />
          </StatIcon>
          <StatContent>
            <StatValue>{Object.keys(stats.byType).length}</StatValue>
            <StatLabel>Action Types</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <FilterPanel
            as={motion.div}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <FilterTitle>
              <FaFilter /> Advanced Filters
            </FilterTitle>
            <FilterGrid>
              <FilterGroup>
                <FilterLabel>
                  <FaSearch /> Search
                </FilterLabel>
                <Input
                  type="text"
                  placeholder="Search by action, user, or target..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </FilterGroup>

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
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
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
              <ClearButton onClick={clearFilters}>
                <FaTimes /> Clear All Filters
              </ClearButton>
              <ApplyButton onClick={fetchActivities}>
                <FaCheck /> Apply Filters
              </ApplyButton>
            </FilterActions>
          </FilterPanel>
        )}
      </AnimatePresence>

      {/* Activities List */}
      {loading ? (
        <LoadingContainer>
          <Spinner />
          <LoadingText>Loading activities...</LoadingText>
        </LoadingContainer>
      ) : filteredActivities.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <FaHistory />
          </EmptyIcon>
          <EmptyTitle>No Activities Found</EmptyTitle>
          <EmptyText>
            {filters.search || filters.actionType || filters.startDate || filters.endDate
              ? 'Try adjusting your filters to see more results.'
              : 'There are no activity logs to display yet.'}
          </EmptyText>
          {(filters.search || filters.actionType || filters.startDate || filters.endDate) && (
            <ClearFiltersButton onClick={clearFilters}>
              <FaTimes /> Clear Filters
            </ClearFiltersButton>
          )}
        </EmptyState>
      ) : (
        <>
          {viewMode === 'list' ? (
            <ActivityTable>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell width="50px">Type</TableHeaderCell>
                  <TableHeaderCell width="200px">Action</TableHeaderCell>
                  <TableHeaderCell width="150px">Performed By</TableHeaderCell>
                  <TableHeaderCell width="150px">Target</TableHeaderCell>
                  <TableHeaderCell width="180px">Timestamp</TableHeaderCell>
                  <TableHeaderCell width="100px">Status</TableHeaderCell>
                  <TableHeaderCell width="80px">Details</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity, index) => {
                  const iconData = getActivityIcon(activity.action || activity.actionType);
                  return (
                    <TableRow
                      key={activity._id || index}
                      as={motion.tr}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ backgroundColor: '#f8f9fa' }}
                    >
                      <TableCell>
                        <TableIconWrapper $color={iconData.color} $bg={iconData.bg}>
                          {iconData.icon}
                        </TableIconWrapper>
                      </TableCell>
                      <TableCell>
                        <ActionText>{getActionLabel(activity.action || activity.actionType)}</ActionText>
                      </TableCell>
                      <TableCell>
                        <UserInfo>
                          <UserAvatar>
                            <FaUser />
                          </UserAvatar>
                          <UserDetails>
                            <UserName>{activity.performedBy?.username || 'System'}</UserName>
                            <UserEmail>{activity.performedBy?.email || '-'}</UserEmail>
                          </UserDetails>
                        </UserInfo>
                      </TableCell>
                      <TableCell>
                        {activity.targetUser ? (
                          <UserInfo>
                            <UserAvatar>
                              <FaUser />
                            </UserAvatar>
                            <UserDetails>
                              <UserName>{activity.targetUser.username}</UserName>
                              <UserEmail>{activity.targetUser.email || '-'}</UserEmail>
                            </UserDetails>
                          </UserInfo>
                        ) : (
                          <span style={{ color: '#95a5a6' }}>-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <TimeWrapper>
                          <FaClock style={{ marginRight: '6px', fontSize: '12px' }} />
                          {formatDate(activity.timestamp || activity.createdAt)}
                        </TimeWrapper>
                      </TableCell>
                      <TableCell>
                        <StatusBadge $status={activity.status || 'success'}>
                          {activity.status === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                          {activity.status || 'success'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <ViewButton onClick={() => setSelectedActivity(activity)}>
                          <FaEye /> View
                        </ViewButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </ActivityTable>
          ) : (
            <CardsGrid>
              {filteredActivities.map((activity, index) => {
                const iconData = getActivityIcon(activity.action || activity.actionType);
                return (
                  <ActivityCard
                    key={activity._id || index}
                    as={motion.div}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
                  >
                    <CardHeader>
                      <CardIcon $color={iconData.color} $bg={iconData.bg}>
                        {iconData.icon}
                      </CardIcon>
                      <CardTitle>{getActionLabel(activity.action || activity.actionType)}</CardTitle>
                      <StatusBadge $status={activity.status || 'success'}>
                        {activity.status === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                      </StatusBadge>
                    </CardHeader>

                    <CardBody>
                      <CardRow>
                        <CardLabel>Performed by:</CardLabel>
                        <CardValue>
                          {activity.performedBy?.username || 'System'}
                          {activity.performedBy?.email && (
                            <span style={{ color: '#95a5a6', fontSize: '12px', display: 'block' }}>
                              {activity.performedBy.email}
                            </span>
                          )}
                        </CardValue>
                      </CardRow>

                      {activity.targetUser && (
                        <CardRow>
                          <CardLabel>Target user:</CardLabel>
                          <CardValue>
                            {activity.targetUser.username || activity.details?.targetUserEmail}
                          </CardValue>
                        </CardRow>
                      )}

                      <CardRow>
                        <CardLabel>
                          <FaClock /> Timestamp:
                        </CardLabel>
                        <CardValue>{formatDate(activity.timestamp || activity.createdAt)}</CardValue>
                      </CardRow>

                      {activity.ipAddress && (
                        <CardRow>
                          <CardLabel>IP Address:</CardLabel>
                          <CardValue style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                            {activity.ipAddress}
                          </CardValue>
                        </CardRow>
                      )}
                    </CardBody>

                    <CardFooter>
                      <ViewDetailsButton onClick={() => setSelectedActivity(activity)}>
                        <FaEye /> View Full Details
                      </ViewDetailsButton>
                    </CardFooter>
                  </ActivityCard>
                );
              })}
            </CardsGrid>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Pagination>
              <PaginationInfo>
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, pagination.total)} of {pagination.total} activities
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

      {/* Activity Details Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <Modal
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedActivity(null)}
          >
            <ModalContent
              as={motion.div}
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <ModalTitle>
                  <FaEye /> Activity Details
                </ModalTitle>
                <CloseButton onClick={() => setSelectedActivity(null)}>
                  <FaTimes />
                </CloseButton>
              </ModalHeader>

              <ModalBody>
                <DetailSection>
                  <DetailLabel>Action Type:</DetailLabel>
                  <DetailValue>{getActionLabel(selectedActivity.action || selectedActivity.actionType)}</DetailValue>
                </DetailSection>

                <DetailSection>
                  <DetailLabel>Performed By:</DetailLabel>
                  <DetailValue>
                    {selectedActivity.performedBy?.username || 'System'}
                    {selectedActivity.performedBy?.email && ` (${selectedActivity.performedBy.email})`}
                  </DetailValue>
                </DetailSection>

                {selectedActivity.targetUser && (
                  <DetailSection>
                    <DetailLabel>Target User:</DetailLabel>
                    <DetailValue>
                      {selectedActivity.targetUser.username || selectedActivity.details?.targetUserEmail}
                    </DetailValue>
                  </DetailSection>
                )}

                <DetailSection>
                  <DetailLabel>Timestamp:</DetailLabel>
                  <DetailValue>{formatFullDate(selectedActivity.timestamp || selectedActivity.createdAt)}</DetailValue>
                </DetailSection>

                <DetailSection>
                  <DetailLabel>Status:</DetailLabel>
                  <DetailValue>
                    <StatusBadge $status={selectedActivity.status || 'success'}>
                      {selectedActivity.status || 'success'}
                    </StatusBadge>
                  </DetailValue>
                </DetailSection>

                {selectedActivity.ipAddress && (
                  <DetailSection>
                    <DetailLabel>IP Address:</DetailLabel>
                    <DetailValue style={{ fontFamily: 'monospace' }}>{selectedActivity.ipAddress}</DetailValue>
                  </DetailSection>
                )}

                {selectedActivity.userAgent && (
                  <DetailSection>
                    <DetailLabel>User Agent:</DetailLabel>
                    <DetailValue style={{ fontSize: '13px', color: '#666' }}>{selectedActivity.userAgent}</DetailValue>
                  </DetailSection>
                )}

                {selectedActivity.details && Object.keys(selectedActivity.details).length > 0 && (
                  <DetailSection>
                    <DetailLabel>Additional Details:</DetailLabel>
                    <CodeBlock>
                      {JSON.stringify(selectedActivity.details, null, 2)}
                    </CodeBlock>
                  </DetailSection>
                )}

                {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
                  <DetailSection>
                    <DetailLabel>Metadata:</DetailLabel>
                    <CodeBlock>
                      {JSON.stringify(selectedActivity.metadata, null, 2)}
                    </CodeBlock>
                  </DetailSection>
                )}
              </ModalBody>

              <ModalFooter>
                <Button color="#95a5a6" onClick={() => setSelectedActivity(null)}>
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </Container>
  );
};

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f5f7fa;

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
  gap: 1.5rem;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const IconWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.color}15;
  color: ${props => props.color};
  font-size: 24px;
  margin-right: 12px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2.5rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 0;
  color: #7f8c8d;
  font-size: 1rem;
  margin-left: 60px;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
`;

const ViewModeToggle = styled.div`
  display: flex;
  background: white;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const ViewModeButton = styled.button`
  padding: 8px 16px;
  border: none;
  background: ${props => props.$active ? '#667eea' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#666'};
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: ${props => props.$active ? '#667eea' : '#f0f0f0'};
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: ${props => props.color || '#667eea'};
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Stats Cards
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
`;

const StatIcon = styled.div`
  width: 56px;
  height: 56px;
  min-width: 56px;
  border-radius: 12px;
  background: ${props => props.color}15;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
`;

// Filter Panel
const FilterPanel = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
`;

const FilterTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
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
  padding: 12px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Input = styled.input`
  padding: 12px 14px;
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
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
`;

const ClearButton = styled.button`
  padding: 10px 20px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;

  &:hover {
    border-color: #e74c3c;
    color: #e74c3c;
    background: #fff5f5;
  }
`;

const ApplyButton = styled.button`
  padding: 10px 20px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #5568d3;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

// Table View
const ActivityTable = styled.table`
  width: 100%;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
`;

const TableHeader = styled.thead`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: ${props => props.width || 'auto'};
`;

const TableBody = styled.tbody``;

const TableCell = styled.td`
  padding: 1rem;
  vertical-align: middle;
  font-size: 14px;
  color: #2c3e50;
`;

const TableIconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.$bg};
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

const ActionText = styled.div`
  font-weight: 600;
  color: #2c3e50;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: #95a5a6;
`;

const TimeWrapper = styled.div`
  display: flex;
  align-items: center;
  color: #666;
  font-size: 13px;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => props.$status === 'success' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.$status === 'success' ? '#2ecc71' : '#e74c3c'};
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: #5568d3;
    transform: translateY(-1px);
  }
`;

// Card View
const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const ActivityCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
`;

const CardIcon = styled.div`
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 12px;
  background: ${props => props.$bg};
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
  flex: 1;
  font-weight: 600;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
`;

const CardLabel = styled.span`
  font-weight: 600;
  color: #666;
  font-size: 14px;
  min-width: 120px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CardValue = styled.span`
  color: #2c3e50;
  font-size: 14px;
  text-align: right;
  flex: 1;
`;

const CardFooter = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #f0f0f0;
`;

const ViewDetailsButton = styled.button`
  width: 100%;
  padding: 10px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

// Loading & Empty States
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
`;

const Spinner = styled.div`
  width: 56px;
  height: 56px;
  border: 5px solid #f0f0f0;
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
  font-weight: 500;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
`;

const EmptyIcon = styled.div`
  font-size: 72px;
  color: #ddd;
  margin-bottom: 24px;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 24px;
  color: #666;
  font-weight: 600;
`;

const EmptyText = styled.p`
  margin: 0 0 24px 0;
  font-size: 16px;
  color: #999;
  text-align: center;
  max-width: 400px;
`;

const ClearFiltersButton = styled.button`
  padding: 12px 24px;
  border: 2px solid #e74c3c;
  background: white;
  color: #e74c3c;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;

  &:hover {
    background: #e74c3c;
    color: white;
  }
`;

// Pagination
const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
`;

const PaginationInfo = styled.span`
  color: #666;
  font-size: 14px;
  font-weight: 500;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const PaginationButton = styled.button`
  padding: 10px 16px;
  border: 2px solid ${props => props.$active ? '#667eea' : '#e0e0e0'};
  background: ${props => props.$active ? '#667eea' : 'white'};
  color: ${props => props.$active ? 'white' : '#666'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  font-size: 14px;

  &:hover:not(:disabled) {
    border-color: #667eea;
    background: ${props => props.$active ? '#5568d3' : '#f8f9ff'};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PaginationEllipsis = styled.span`
  padding: 10px 16px;
  color: #999;
  font-weight: 600;
`;

// Modal
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px 20px 0 0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }
`;

const ModalBody = styled.div`
  padding: 2rem;
`;

const DetailSection = styled.div`
  margin-bottom: 1.5rem;
`;

const DetailLabel = styled.div`
  font-weight: 700;
  color: #555;
  margin-bottom: 8px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.div`
  color: #2c3e50;
  font-size: 15px;
  line-height: 1.6;
`;

const CodeBlock = styled.pre`
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #2c3e50;
  line-height: 1.5;
`;

const ModalFooter = styled.div`
  padding: 1.5rem 2rem;
  border-top: 2px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

export default AdminActivities;
