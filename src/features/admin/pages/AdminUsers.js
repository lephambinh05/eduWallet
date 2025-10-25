import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, FaPlus, FaEdit, FaTrash, FaBan, FaCheck, 
  FaEye, FaFilter, FaDownload, FaUserShield, FaUser 
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import AdminService from '../services/adminService';
import UserDetailModal from '../components/UserDetailModal';
import CreateUserModal from '../components/CreateUserModal';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Build params - only include non-empty values
      const params = {
        page: currentPage,
        limit: 20
      };

      // Only add search if it's not empty
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      // Only add filters if they're not empty
      if (filters.role && filters.role.trim()) {
        params.role = filters.role;
      }

      if (filters.status && filters.status.trim()) {
        params.status = filters.status;
      }

      console.log('AdminUsers - Fetching users with params:', params);
      console.log('AdminUsers - Token exists:', !!localStorage.getItem('adminToken'));
      console.log('AdminUsers - Token preview:', localStorage.getItem('adminToken')?.substring(0, 20) + '...');
      
      const response = await AdminService.getAllUsers(params);
      console.log('AdminUsers - API response:', response);
      console.log('AdminUsers - Response structure:', Object.keys(response));
      console.log('AdminUsers - Response.data:', response.data);
      console.log('AdminUsers - Users array:', response.data?.users);
      
      if (response.success && response.data) {
        setUsers(response.data.users || []);
        setPagination(response.data.pagination || {});
        console.log('AdminUsers - Users loaded successfully, count:', response.data.users?.length);
      } else {
        console.error('AdminUsers - Invalid response structure:', response);
        throw new Error('Invalid response structure from API');
      }
    } catch (error) {
      console.error('AdminUsers - Error fetching users:', error);
      console.error('AdminUsers - Error response:', error.response);
      console.error('AdminUsers - Error response data:', error.response?.data);
      console.error('AdminUsers - Error response status:', error.response?.status);
      
      // Show detailed error message
      const errorMessage = error.response?.data?.message || error.message;
      const validationErrors = error.response?.data?.errors;
      
      if (validationErrors && Array.isArray(validationErrors)) {
        console.error('AdminUsers - Validation errors:', validationErrors);
        toast.error(`Failed to load users: ${errorMessage}\n${validationErrors.map(e => e.message).join(', ')}`);
      } else {
        toast.error('Failed to load users: ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await AdminService.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u));
    setShowUserModal(false);
    fetchUsers(); // Refresh to get latest data
  };

  const handleUserCreated = (newUser) => {
    setShowCreateModal(false);
    fetchUsers(); // Refresh to show new user
    toast.success('User created successfully!');
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      toast.error('No users selected');
      return;
    }

    if (!window.confirm(`Delete ${selectedUsers.length} user(s)?`)) return;

    try {
      await AdminService.bulkDeleteUsers(selectedUsers);
      toast.success(`${selectedUsers.length} user(s) deleted`);
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete users');
    }
  };

  const handleExport = async () => {
    try {
      const response = await AdminService.exportUsers(filters);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Users exported successfully');
    } catch (error) {
      toast.error('Failed to export users');
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      student: '#3772ff',
      institution: '#66bb6a',
      admin: '#ffa726',
      super_admin: '#a259ff'
    };
    return colors[role] || '#999';
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      active: '#66bb6a',
      inactive: '#999',
      blocked: '#ff6b6b',
      deactivated: '#ffa726'
    };
    return colors[status] || '#999';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>User Management</Title>
          <Subtitle>{pagination.total || 0} total users</Subtitle>
        </HeaderLeft>
        <HeaderRight>
          <Button color="#66bb6a" onClick={() => setShowCreateModal(true)}>
            <FaPlus /> Create User
          </Button>
        </HeaderRight>
      </Header>

      {/* Search and Filters */}
      <ToolBar>
        <SearchBar>
          <SearchIcon><FaSearch /></SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </SearchBar>

        <ToolBarRight>
          <IconButton onClick={() => setShowFilters(!showFilters)}>
            <FaFilter /> Filters
          </IconButton>
          <IconButton onClick={handleExport}>
            <FaDownload /> Export
          </IconButton>
          {selectedUsers.length > 0 && (
            <Button color="#ff6b6b" onClick={handleBulkDelete}>
              <FaTrash /> Delete ({selectedUsers.length})
            </Button>
          )}
        </ToolBarRight>
      </ToolBar>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <FilterPanel
            as={motion.div}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <FilterGroup>
              <FilterLabel>Role</FilterLabel>
              <Select value={filters.role} onChange={(e) => handleFilterChange('role', e.target.value)}>
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="institution">Institution</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </Select>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Status</FilterLabel>
              <Select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
                <option value="deactivated">Deactivated</option>
              </Select>
            </FilterGroup>

            <FilterGroup>
              <Button 
                color="#999" 
                onClick={() => {
                  setFilters({ role: '', status: '' });
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            </FilterGroup>
          </FilterPanel>
        )}
      </AnimatePresence>

      {/* Users Table */}
      {loading ? (
        <LoadingState>
          <Spinner />
          <LoadingText>Loading users...</LoadingText>
        </LoadingState>
      ) : users.length === 0 ? (
        <EmptyState>
          <EmptyIcon>👥</EmptyIcon>
          <EmptyText>No users found</EmptyText>
        </EmptyState>
      ) : (
        <>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th width="40px">
                    <Checkbox
                      type="checkbox"
                      checked={selectedUsers.length === users.length}
                      onChange={handleSelectAll}
                    />
                  </Th>
                  <Th>User</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>Joined</Th>
                  <Th width="180px">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <Tr
                    key={user._id}
                    as={motion.tr}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Td>
                      <Checkbox
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                      />
                    </Td>
                    <Td>
                      <UserCell>
                        <UserAvatar>
                          {user.role === 'admin' || user.role === 'super_admin' 
                            ? <FaUserShield /> 
                            : <FaUser />
                          }
                        </UserAvatar>
                        <UserInfo>
                          <UserName>{user.username}</UserName>
                          <UserId>ID: {user._id.slice(-8)}</UserId>
                        </UserInfo>
                      </UserCell>
                    </Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <Badge color={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge color={getStatusBadgeColor(user.status)}>
                        {user.status}
                      </Badge>
                    </Td>
                    <Td>{formatDate(user.createdAt)}</Td>
                    <Td>
                      <ActionButtons>
                        <ActionButton 
                          color="#3772ff" 
                          title="View Details"
                          onClick={() => handleViewUser(user)}
                        >
                          <FaEye />
                        </ActionButton>
                        <ActionButton 
                          color="#ffa726" 
                          title="Edit User"
                          onClick={() => handleViewUser(user)}
                        >
                          <FaEdit />
                        </ActionButton>
                        {user.isBlocked ? (
                          <ActionButton 
                            color="#66bb6a" 
                            title="Unblock User"
                            onClick={() => handleViewUser(user)}
                          >
                            <FaCheck />
                          </ActionButton>
                        ) : (
                          <ActionButton 
                            color="#ff9800" 
                            title="Block User"
                            onClick={() => handleViewUser(user)}
                          >
                            <FaBan />
                          </ActionButton>
                        )}
                        <ActionButton 
                          color="#ff6b6b" 
                          title="Delete User"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <FaTrash />
                        </ActionButton>
                      </ActionButtons>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination>
              <PaginationInfo>
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, pagination.total)} of {pagination.total} users
              </PaginationInfo>
              <PaginationButtons>
                <PaginationButton
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </PaginationButton>
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <PaginationButton
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        active={currentPage === page}
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
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                >
                  Next
                </PaginationButton>
              </PaginationButtons>
            </Pagination>
          )}
        </>
      )}

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onUserUpdated={handleUserUpdated}
      />

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUserCreated={handleUserCreated}
      />
    </Container>
  );
};

const Container = styled.div`
  padding: 2rem;
  max-width: 1600px;
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

const HeaderLeft = styled.div``;

const HeaderRight = styled.div`
  display: flex;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.color || '#a259ff'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ToolBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SearchBar = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
  max-width: 400px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #a259ff;
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const ToolBarRight = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const FilterPanel = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  overflow: hidden;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  font-weight: 600;
`;

const Select = styled.select`
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #a259ff;
  }

  option {
    background: #1a1a2e;
  }
`;

const TableContainer = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  width: ${props => props.width || 'auto'};
`;

const Td = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const Tr = styled.tr`
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #a259ff;
`;

const UserCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #a259ff, #3772ff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.125rem;
  flex-shrink: 0;
`;

const UserInfo = styled.div``;

const UserName = styled.div`
  font-weight: 600;
  color: #ffffff;
`;

const UserId = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.125rem;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.color};
    color: white;
    transform: scale(1.1);
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
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
  padding: 4rem 0;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.125rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PaginationInfo = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const PaginationButton = styled.button`
  padding: 0.5rem 0.75rem;
  background: ${props => props.active ? '#a259ff' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.active ? '#a259ff' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 6px;
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.8)'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 36px;

  &:hover:not(:disabled) {
    background: ${props => props.active ? '#8847cc' : 'rgba(255, 255, 255, 0.1)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PaginationEllipsis = styled.span`
  padding: 0.5rem 0.75rem;
  color: rgba(255, 255, 255, 0.4);
`;

export default AdminUsers;
