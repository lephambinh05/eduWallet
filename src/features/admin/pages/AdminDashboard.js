import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaUsers, FaUserCheck, FaUserPlus, FaUserTimes, FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import StatsCard from '../components/StatsCard';
import AdminService from '../services/adminService';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AdminDashboard - Component mounted');
    console.log('AdminDashboard - Token exists:', !!localStorage.getItem('adminToken'));
    console.log('AdminDashboard - User exists:', !!localStorage.getItem('adminUser'));
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      console.log('AdminDashboard - Fetching dashboard data...');
      console.log('AdminDashboard - Token before request:', localStorage.getItem('adminToken')?.substring(0, 20) + '...');
      
      // Fetch dashboard stats
      const statsResponse = await AdminService.getDashboardStats();
      console.log('AdminDashboard - Stats response:', statsResponse);
      console.log('AdminDashboard - Stats response.data:', statsResponse.data);
      console.log('AdminDashboard - Stats response.data.stats:', statsResponse.data.stats);
      
      if (statsResponse.success && statsResponse.data && statsResponse.data.stats) {
        setStats(statsResponse.data.stats);
        console.log('AdminDashboard - Stats set successfully');
      } else {
        console.error('AdminDashboard - Invalid stats response structure:', statsResponse);
        throw new Error('Invalid response structure from dashboard API');
      }

      // Fetch recent activities (optional, skip if fails)
      try {
        const activitiesResponse = await AdminService.getActivities({
          page: 1,
          limit: 5
        });
        console.log('AdminDashboard - Activities response:', activitiesResponse);
        setRecentActivities(activitiesResponse.data.activities || []);
      } catch (actError) {
        console.warn('AdminDashboard - Failed to fetch activities (non-critical):', actError);
        // Don't fail the whole dashboard if activities fail
        setRecentActivities([]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      toast.error('Failed to load dashboard data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (actionType) => {
    const icons = {
      'create_user': '👤',
      'update_user': '✏️',
      'delete_user': '🗑️',
      'block_user': '🚫',
      'unblock_user': '✅',
      'update_role': '👑',
      'update_status': '🔄'
    };
    return icons[actionType] || '📝';
  };

  const getStatusColor = (status) => {
    return status === 'success' ? '#66bb6a' : '#ff6b6b';
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
    return date.toLocaleDateString();
  };

  return (
    <Container>
      <Header>
        <Title>Dashboard</Title>
        <Subtitle>Welcome back! Here's what's happening today.</Subtitle>
      </Header>

      {/* Stats Grid */}
      <StatsGrid>
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers}
          icon={<FaUsers />}
          color="#a259ff"
          loading={loading}
        />
        <StatsCard
          title="Active Users"
          value={stats?.activeUsers}
          icon={<FaUserCheck />}
          color="#3772ff"
          loading={loading}
        />
        <StatsCard
          title="New This Month"
          value={stats?.newUsersThisMonth}
          icon={<FaUserPlus />}
          color="#66bb6a"
          trend={stats?.newUsersThisMonth > 0 ? `+${stats?.newUsersThisMonth}` : '0'}
          loading={loading}
        />
        <StatsCard
          title="Inactive Users"
          value={stats?.inactiveUsers}
          icon={<FaUserTimes />}
          color="#ff6b6b"
          loading={loading}
        />
      </StatsGrid>

      {/* Additional Stats */}
      <SecondaryStatsGrid>
        <StatsCard
          title="New This Week"
          value={stats?.newUsersThisWeek}
          icon={<FaCalendarAlt />}
          color="#ffa726"
          trend={stats?.newUsersThisWeek > 0 ? `+${stats?.newUsersThisWeek}` : '0'}
          loading={loading}
        />
        <StatsCard
          title="Growth Rate"
          value={stats?.totalUsers > 0 ? `${((stats?.newUsersThisMonth / stats?.totalUsers) * 100).toFixed(1)}%` : '0%'}
          icon={<FaChartLine />}
          color="#ab47bc"
          loading={loading}
        />
      </SecondaryStatsGrid>

      {/* Recent Activities */}
      <Section>
        <SectionHeader>
          <SectionTitle>Recent Activities</SectionTitle>
          <ViewAllLink href="#/admin/activities">View All</ViewAllLink>
        </SectionHeader>
        
        {loading ? (
          <LoadingState>
            <Spinner />
            <LoadingText>Loading activities...</LoadingText>
          </LoadingState>
        ) : recentActivities.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📭</EmptyIcon>
            <EmptyText>No recent activities</EmptyText>
          </EmptyState>
        ) : (
          <ActivitiesList>
            {recentActivities.map((activity, index) => (
              <ActivityItem
                key={activity._id}
                as={motion.div}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ActivityIcon>{getActivityIcon(activity.actionType)}</ActivityIcon>
                <ActivityContent>
                  <ActivityDescription>{activity.description}</ActivityDescription>
                  <ActivityMeta>
                    <ActivityUser>{activity.userId?.username || 'System'}</ActivityUser>
                    <ActivityTime>{formatDate(activity.createdAt)}</ActivityTime>
                  </ActivityMeta>
                </ActivityContent>
                <ActivityStatus color={getStatusColor(activity.status)}>
                  {activity.status}
                </ActivityStatus>
              </ActivityItem>
            ))}
          </ActivitiesList>
        )}
      </Section>

      {/* User Stats Summary */}
      <Section>
        <SectionHeader>
          <SectionTitle>User Statistics</SectionTitle>
        </SectionHeader>
        
        {loading ? (
          <LoadingState>
            <Spinner />
          </LoadingState>
        ) : (
          <UserStatsGrid>
            <UserStatItem>
              <StatLabel>Students</StatLabel>
              <StatValue>{stats?.usersByRole?.student || 0}</StatValue>
              <StatBar>
                <StatBarFill 
                  width={stats?.totalUsers > 0 ? (stats?.usersByRole?.student / stats?.totalUsers * 100) : 0}
                  color="#a259ff"
                />
              </StatBar>
            </UserStatItem>
            
            <UserStatItem>
              <StatLabel>Institutions</StatLabel>
              <StatValue>{stats?.usersByRole?.institution || 0}</StatValue>
              <StatBar>
                <StatBarFill 
                  width={stats?.totalUsers > 0 ? (stats?.usersByRole?.institution / stats?.totalUsers * 100) : 0}
                  color="#3772ff"
                />
              </StatBar>
            </UserStatItem>
            
            <UserStatItem>
              <StatLabel>Admins</StatLabel>
              <StatValue>{stats?.usersByRole?.admin || 0}</StatValue>
              <StatBar>
                <StatBarFill 
                  width={stats?.totalUsers > 0 ? (stats?.usersByRole?.admin / stats?.totalUsers * 100) : 0}
                  color="#66bb6a"
                />
              </StatBar>
            </UserStatItem>
          </UserStatsGrid>
        )}
      </Section>
    </Container>
  );
};

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const SecondaryStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const Section = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
`;

const ViewAllLink = styled.a`
  color: #a259ff;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: #8847cc;
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #a259ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: rgba(255, 255, 255, 0.6);
  margin-top: 1rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
`;

const ActivitiesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(162, 89, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityDescription = styled.div`
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ActivityMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
`;

const ActivityUser = styled.span``;

const ActivityTime = styled.span`
  &::before {
    content: '•';
    margin-right: 0.5rem;
  }
`;

const ActivityStatus = styled.div`
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  flex-shrink: 0;
`;

const UserStatsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const UserStatItem = styled.div`
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.75rem;
`;

const StatBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
`;

const StatBarFill = styled.div`
  width: ${props => props.width}%;
  height: 100%;
  background: ${props => props.color};
  border-radius: 4px;
  transition: width 0.5s ease;
`;

export default AdminDashboard;
