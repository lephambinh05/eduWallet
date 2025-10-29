import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, FaSave, FaUser, FaEnvelope, FaPhone, FaCalendar, 
  FaUserShield, FaBan, FaCheck, FaHistory, FaEdit, FaCoins,
  FaWallet, FaPlus, FaMinus, FaExchangeAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import AdminService from '../services/adminService';

const UserDetailModal = ({ user, isOpen, onClose, onUserUpdated }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [eduTokenBalance, setEduTokenBalance] = useState('0');
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenAction, setTokenAction] = useState('add'); // 'add' or 'subtract'
  const [tokenAmount, setTokenAmount] = useState('');
  const [tokenReason, setTokenReason] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    role: 'student',
    isActive: true
  });

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        role: user.role || 'student',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
      setIsEditing(false);
      setActiveTab('details');
      
      // Fetch EDU token balance for all users
      fetchEduTokenBalance();
      
      // Fetch activities if on activities tab
      if (activeTab === 'activities') {
        fetchUserActivities();
      }
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (activeTab === 'activities' && user) {
      fetchUserActivities();
    }
  }, [activeTab]);

  const fetchUserActivities = async () => {
    if (!user?._id) return;
    
    try {
      const response = await AdminService.getUserActivities(user._id, { page: 1, limit: 20 });
      setActivities(response.data?.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load user activities');
    }
  };

  const fetchEduTokenBalance = async () => {
    if (!user?._id) {
      setEduTokenBalance('No user found');
      return;
    }

    setLoadingBalance(true);
    try {
      // Call admin service to get EDU token balance from database
      const response = await AdminService.getUserById(user._id);
      
      if (response.success) {
        setEduTokenBalance(response.data.user.eduTokenBalance || '0');
      } else {
        setEduTokenBalance('Error loading');
      }
    } catch (error) {
      console.error('Error fetching EDU token balance:', error);
      setEduTokenBalance('0');
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleTokenManagement = async () => {
    if (!tokenAmount || parseFloat(tokenAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!tokenReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    setLoading(true);
    try {
      const response = await AdminService.updateUserEduTokens(user._id, {
        action: tokenAction, // 'add' or 'subtract'
        amount: parseFloat(tokenAmount),
        reason: tokenReason
      });

      if (response.success) {
        toast.success(`Successfully ${tokenAction === 'add' ? 'added' : 'deducted'} ${tokenAmount} EDU tokens`);
        setShowTokenModal(false);
        setTokenAmount('');
        setTokenReason('');
        
        // Fetch updated user data
        const updatedUserResponse = await AdminService.getUserById(user._id);
        if (updatedUserResponse.success) {
          const updatedUser = updatedUserResponse.data.user;
          setEduTokenBalance(updatedUser.eduTokenBalance || '0');
          
          // Update parent component with full user data
          if (onUserUpdated) {
            onUserUpdated(updatedUser);
          }
        } else {
          // Fallback: just refresh balance
          fetchEduTokenBalance();
          if (onUserUpdated) {
            onUserUpdated();
          }
        }
      } else {
        toast.error(response.message || 'Failed to manage tokens');
      }
    } catch (error) {
      console.error('Error managing tokens:', error);
      toast.error(error.response?.data?.message || 'Failed to manage EDU tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await AdminService.updateUser(user._id, formData);
      toast.success('User updated successfully!');
      setIsEditing(false);
      if (onUserUpdated) {
        onUserUpdated(response.data.user);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole) => {
    if (!window.confirm(`Are you sure you want to change role to ${newRole}?`)) {
      return;
    }

    setLoading(true);
    try {
      await AdminService.updateUserRole(user._id, newRole);
      toast.success(`Role updated to ${newRole}`);
      if (onUserUpdated) {
        onUserUpdated({ ...user, role: newRole });
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error.response?.data?.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = !formData.isActive;
    const reason = newStatus ? null : window.prompt('Reason for deactivation:');
    
    if (!newStatus && !reason) return;

    setLoading(true);
    try {
      await AdminService.updateUserStatus(user._id, newStatus, reason);
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      setFormData(prev => ({ ...prev, isActive: newStatus }));
      if (onUserUpdated) {
        onUserUpdated({ ...user, isActive: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    const reason = window.prompt('Reason for blocking:');
    if (!reason) return;

    setLoading(true);
    try {
      await AdminService.blockUser(user._id, reason);
      toast.success('User blocked successfully');
      if (onUserUpdated) {
        onUserUpdated({ ...user, isBlocked: true, isActive: false });
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error(error.response?.data?.message || 'Failed to block user');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async () => {
    if (!window.confirm('Are you sure you want to unblock this user?')) return;

    setLoading(true);
    try {
      await AdminService.unblockUser(user._id);
      toast.success('User unblocked successfully');
      if (onUserUpdated) {
        onUserUpdated({ ...user, isBlocked: false, isActive: true });
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error(error.response?.data?.message || 'Failed to unblock user');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = () => {
    if (user?.isBlocked) {
      return <StatusBadge $status="blocked">Blocked</StatusBadge>;
    }
    return user?.isActive ? 
      <StatusBadge $status="active">Active</StatusBadge> : 
      <StatusBadge $status="inactive">Inactive</StatusBadge>;
  };

  const getRoleBadge = (role) => {
    const colors = {
      super_admin: '#e74c3c',
      admin: '#e67e22',
      institution: '#3498db',
      student: '#2ecc71'
    };
    return <RoleBadge $color={colors[role] || '#95a5a6'}>{role}</RoleBadge>;
  };

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContainer
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader>
            <HeaderLeft>
              <Avatar src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`} alt={user.username} />
              <HeaderInfo>
                <UserName>{user.firstName} {user.lastName}</UserName>
                <UserMeta>
                  @{user.username} • {getRoleBadge(user.role)}
                </UserMeta>
              </HeaderInfo>
            </HeaderLeft>
            <HeaderRight>
              {getStatusBadge()}
              <CloseButton onClick={onClose}>
                <FaTimes />
              </CloseButton>
            </HeaderRight>
          </ModalHeader>

          <TabContainer>
            <Tab $active={activeTab === 'details'} onClick={() => setActiveTab('details')}>
              <FaUser /> Details
            </Tab>
            <Tab $active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')}>
              <FaWallet /> EDU Wallet
            </Tab>
            <Tab $active={activeTab === 'activities'} onClick={() => setActiveTab('activities')}>
              <FaHistory /> Activities
            </Tab>
          </TabContainer>

          <ModalBody>
            {activeTab === 'details' && (
              <DetailsTab key="details-tab">
                <ActionButtons>
                  {!isEditing ? (
                    <>
                      <ActionButton $variant="primary" onClick={() => setIsEditing(true)}>
                        <FaEdit /> Edit
                      </ActionButton>
                      <ActionButton 
                        $variant={formData.isActive ? 'warning' : 'success'} 
                        onClick={handleStatusToggle}
                        disabled={loading}
                      >
                        {formData.isActive ? <><FaBan /> Deactivate</> : <><FaCheck /> Activate</>}
                      </ActionButton>
                      {user.isBlocked ? (
                        <ActionButton $variant="success" onClick={handleUnblock} disabled={loading}>
                          <FaCheck /> Unblock
                        </ActionButton>
                      ) : (
                        <ActionButton $variant="danger" onClick={handleBlock} disabled={loading}>
                          <FaBan /> Block
                        </ActionButton>
                      )}
                    </>
                  ) : (
                    <>
                      <ActionButton $variant="success" onClick={handleSave} disabled={loading}>
                        <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
                      </ActionButton>
                      <ActionButton $variant="secondary" onClick={() => setIsEditing(false)}>
                        <FaTimes /> Cancel
                      </ActionButton>
                    </>
                  )}
                </ActionButtons>

                <FormSection>
                  <SectionTitle>Personal Information</SectionTitle>
                  <FormGrid>
                    <FormGroup>
                      <Label>Username</Label>
                      {isEditing ? (
                        <Input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <InfoText>{user.username}</InfoText>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label>Email</Label>
                      {isEditing ? (
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <InfoText>
                          {user.email}
                          {user.isEmailVerified && <VerifiedBadge>✓ Verified</VerifiedBadge>}
                        </InfoText>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label>First Name</Label>
                      {isEditing ? (
                        <Input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <InfoText>{user.firstName}</InfoText>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label>Last Name</Label>
                      {isEditing ? (
                        <Input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <InfoText>{user.lastName}</InfoText>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label>Phone</Label>
                      {isEditing ? (
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <InfoText>{user.phone || 'N/A'}</InfoText>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label>Date of Birth</Label>
                      {isEditing ? (
                        <Input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <InfoText>{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}</InfoText>
                      )}
                    </FormGroup>
                  </FormGrid>
                </FormSection>

                <FormSection>
                  <SectionTitle>Role & Permissions</SectionTitle>
                  <RoleSelector>
                    {['student', 'institution', 'admin', 'super_admin'].map((role) => (
                      <RoleOption
                        key={role}
                        $selected={formData.role === role}
                        onClick={() => !isEditing && handleRoleChange(role)}
                        disabled={isEditing}
                      >
                        <FaUserShield />
                        {role.replace('_', ' ')}
                      </RoleOption>
                    ))}
                  </RoleSelector>
                </FormSection>

                <FormSection>
                  <SectionTitle>Account Status</SectionTitle>
                  <StatusGrid>
                    <StatusItem>
                      <StatusLabel>Active</StatusLabel>
                      <StatusValue>{user.isActive ? 'Yes' : 'No'}</StatusValue>
                    </StatusItem>
                    <StatusItem>
                      <StatusLabel>Blocked</StatusLabel>
                      <StatusValue>{user.isBlocked ? 'Yes' : 'No'}</StatusValue>
                    </StatusItem>
                    <StatusItem>
                      <StatusLabel>Email Verified</StatusLabel>
                      <StatusValue>{user.isEmailVerified ? 'Yes' : 'No'}</StatusValue>
                    </StatusItem>
                    <StatusItem>
                      <StatusLabel>Created At</StatusLabel>
                      <StatusValue>{formatDate(user.createdAt)}</StatusValue>
                    </StatusItem>
                    <StatusItem>
                      <StatusLabel>Last Updated</StatusLabel>
                      <StatusValue>{formatDate(user.updatedAt)}</StatusValue>
                    </StatusItem>
                    {user.lastLogin && (
                      <StatusItem>
                        <StatusLabel>Last Login</StatusLabel>
                        <StatusValue>{formatDate(user.lastLogin)}</StatusValue>
                      </StatusItem>
                    )}
                  </StatusGrid>
                </FormSection>
              </DetailsTab>
            )}

            {activeTab === 'wallet' && (
              <WalletTab key="wallet-tab">
                <WalletHeader>
                  <WalletTitle>
                    <FaCoins /> EDU Token Balance
                  </WalletTitle>
                  <RefreshButton onClick={fetchEduTokenBalance} disabled={loadingBalance}>
                    <FaExchangeAlt /> Refresh
                  </RefreshButton>
                </WalletHeader>

                <BalanceCard>
                  <BalanceLabel>Current Balance</BalanceLabel>
                  <BalanceAmount>
                    {loadingBalance ? (
                      <LoadingSpinner>Loading...</LoadingSpinner>
                    ) : (
                      <>
                        <FaCoins /> {eduTokenBalance} EDU
                      </>
                    )}
                  </BalanceAmount>
                  <WalletAddress>
                    <strong>User ID:</strong> {user._id}
                  </WalletAddress>
                  {user.walletAddress && (
                    <WalletAddress>
                      <strong>Blockchain Wallet:</strong> {user.walletAddress}
                    </WalletAddress>
                  )}
                </BalanceCard>

                <TokenActions>
                  <TokenActionButton 
                    $variant="success" 
                    onClick={() => {
                      setTokenAction('add');
                      setShowTokenModal(true);
                    }}
                  >
                    <FaPlus /> Add Tokens
                  </TokenActionButton>
                  <TokenActionButton 
                    $variant="danger" 
                    onClick={() => {
                      setTokenAction('subtract');
                      setShowTokenModal(true);
                    }}
                  >
                    <FaMinus /> Deduct Tokens
                  </TokenActionButton>
                </TokenActions>

                <TokenInfo>
                  <InfoTitle>Token Management</InfoTitle>
                  <InfoDescription>
                    • Add tokens to reward user achievements<br/>
                    • Deduct tokens for penalties or corrections<br/>
                    • All transactions are recorded in database<br/>
                    • Changes are reflected immediately
                  </InfoDescription>
                </TokenInfo>
              </WalletTab>
            )}

            {activeTab === 'activities' && (
              <ActivitiesTab key="activities-tab">
                {activities.length > 0 ? (
                  <ActivityList>
                    {activities.map((activity, index) => (
                      <ActivityItem key={index}>
                        <ActivityIcon>{getActivityIcon(activity.action)}</ActivityIcon>
                        <ActivityContent>
                          <ActivityAction>{activity.action}</ActivityAction>
                          <ActivityDetails>{activity.details || 'No details'}</ActivityDetails>
                          <ActivityTime>{formatDate(activity.timestamp)}</ActivityTime>
                        </ActivityContent>
                      </ActivityItem>
                    ))}
                  </ActivityList>
                ) : (
                  <EmptyState>
                    <FaHistory size={48} />
                    <p>No activities found</p>
                  </EmptyState>
                )}
              </ActivitiesTab>
            )}
          </ModalBody>
        </ModalContainer>
      </Overlay>

      {/* Token Management Modal */}
      <AnimatePresence>
        {showTokenModal && (
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTokenModal(false)}
          >
            <TokenModal
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <TokenModalHeader $variant={tokenAction}>
                <h2>
                  {tokenAction === 'add' ? <FaPlus /> : <FaMinus />}
                  {tokenAction === 'add' ? ' Add EDU Tokens' : ' Deduct EDU Tokens'}
                </h2>
                <CloseButton onClick={() => setShowTokenModal(false)}>
                  <FaTimes />
                </CloseButton>
              </TokenModalHeader>

              <TokenModalBody>
                <FormGroup>
                  <Label>Amount (EDU)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Reason</Label>
                  <TextArea
                    placeholder="Enter reason for this transaction..."
                    value={tokenReason}
                    onChange={(e) => setTokenReason(e.target.value)}
                    rows={4}
                  />
                </FormGroup>

                <TransactionSummary>
                  <SummaryRow>
                    <span>Current Balance:</span>
                    <strong>{eduTokenBalance} EDU</strong>
                  </SummaryRow>
                  <SummaryRow>
                    <span>{tokenAction === 'add' ? 'Adding:' : 'Deducting:'}</span>
                    <strong $variant={tokenAction}>
                      {tokenAction === 'add' ? '+' : '-'}{tokenAmount || '0'} EDU
                    </strong>
                  </SummaryRow>
                  <Divider />
                  <SummaryRow $total>
                    <span>New Balance:</span>
                    <strong>
                      {tokenAction === 'add' 
                        ? (parseFloat(eduTokenBalance || 0) + parseFloat(tokenAmount || 0)).toFixed(2)
                        : (parseFloat(eduTokenBalance || 0) - parseFloat(tokenAmount || 0)).toFixed(2)
                      } EDU
                    </strong>
                  </SummaryRow>
                </TransactionSummary>
              </TokenModalBody>

              <TokenModalFooter>
                <ActionButton $variant="secondary" onClick={() => setShowTokenModal(false)}>
                  Cancel
                </ActionButton>
                <ActionButton 
                  $variant={tokenAction === 'add' ? 'success' : 'danger'}
                  onClick={handleTokenManagement}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `${tokenAction === 'add' ? 'Add' : 'Deduct'} Tokens`}
                </ActionButton>
              </TokenModalFooter>
            </TokenModal>
          </Overlay>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

const getActivityIcon = (action) => {
  const icons = {
    login: '🔐',
    logout: '🚪',
    update: '✏️',
    create: '➕',
    delete: '🗑️',
    block: '🚫',
    unblock: '✅'
  };
  return icons[action] || '📝';
};

// Styled Components
const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled(motion.div)`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Avatar = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid white;
  object-fit: cover;
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserName = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
`;

const UserMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  opacity: 0.9;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 20px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'active': return '#2ecc71';
      case 'inactive': return '#95a5a6';
      case 'blocked': return '#e74c3c';
      default: return '#95a5a6';
    }
  }};
  color: white;
`;

const RoleBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: ${props => props.$color};
  color: white;
  text-transform: uppercase;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
`;

const Tab = styled.button`
  flex: 1;
  padding: 16px;
  border: none;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#667eea' : '#666'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-bottom: 3px solid ${props => props.$active ? '#667eea' : 'transparent'};

  &:hover {
    background: white;
    color: #667eea;
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const DetailsTab = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const WalletTab = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const WalletHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 2px solid #e0e0e0;
`;

const WalletTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    color: #f39c12;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: #2980b9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const BalanceCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  color: white;
  text-align: center;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
`;

const BalanceLabel = styled.div`
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const BalanceAmount = styled.div`
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  svg {
    color: #f39c12;
  }
`;

const WalletAddress = styled.div`
  font-size: 13px;
  opacity: 0.8;
  font-family: monospace;
  word-break: break-all;
`;

const LoadingSpinner = styled.div`
  font-size: 16px;
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const TokenActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const TokenActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => {
    switch (props.$variant) {
      case 'success': return '#2ecc71';
      case 'danger': return '#e74c3c';
      default: return '#3498db';
    }
  }};
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const TokenInfo = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #667eea;
`;

const InfoTitle = styled.h4`
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 16px;
`;

const InfoDescription = styled.div`
  color: #666;
  font-size: 14px;
  line-height: 1.8;
`;

const NoWalletMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
  text-align: center;

  svg {
    margin-bottom: 20px;
    opacity: 0.5;
  }

  h3 {
    margin: 0 0 8px 0;
    color: #666;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  background: ${props => {
    switch (props.$variant) {
      case 'primary': return '#667eea';
      case 'success': return '#2ecc71';
      case 'warning': return '#f39c12';
      case 'danger': return '#e74c3c';
      case 'secondary': return '#95a5a6';
      default: return '#667eea';
    }
  }};
  
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #667eea;
  padding-bottom: 8px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #555;
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

const InfoText = styled.div`
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const VerifiedBadge = styled.span`
  background: #2ecc71;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
`;

const RoleSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
`;

const RoleOption = styled.button`
  padding: 16px;
  border: 2px solid ${props => props.$selected ? '#667eea' : '#e0e0e0'};
  background: ${props => props.$selected ? 'rgba(102, 126, 234, 0.1)' : 'white'};
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$selected ? '#667eea' : '#666'};
  transition: all 0.3s ease;
  text-transform: capitalize;

  &:hover:not(:disabled) {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    font-size: 24px;
  }
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const StatusItem = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
`;

const StatusLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 600;
  text-transform: uppercase;
`;

const StatusValue = styled.div`
  font-size: 14px;
  color: #333;
  font-weight: 500;
`;

const ActivitiesTab = styled.div`
  min-height: 300px;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActivityItem = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
`;

const ActivityIcon = styled.div`
  font-size: 24px;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
`;

const ActivityContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ActivityAction = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 14px;
  text-transform: capitalize;
`;

const ActivityDetails = styled.div`
  font-size: 13px;
  color: #666;
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: #999;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
  
  svg {
    margin-bottom: 16px;
    opacity: 0.5;
  }

  p {
    font-size: 16px;
    margin: 0;
  }
`;

// Token Management Modal Styles
const TokenModal = styled(motion.div)`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const TokenModalHeader = styled.div`
  padding: 24px;
  background: ${props => props.$variant === 'add' 
    ? 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)'
    : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
  };
  color: white;

  h2 {
    margin: 0;
    font-size: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const TokenModalBody = styled.div`
  padding: 24px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const TransactionSummary = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  font-size: ${props => props.$total ? '18px' : '14px'};
  font-weight: ${props => props.$total ? '700' : '500'};
  color: ${props => props.$total ? '#2c3e50' : '#666'};

  strong {
    color: ${props => {
      if (props.$variant === 'add') return '#2ecc71';
      if (props.$variant === 'subtract') return '#e74c3c';
      return '#2c3e50';
    }};
  }
`;

const Divider = styled.div`
  height: 2px;
  background: #e0e0e0;
  margin: 8px 0;
`;

const TokenModalFooter = styled.div`
  padding: 20px 24px;
  background: #f8f9fa;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #e0e0e0;
`;

export default UserDetailModal;
