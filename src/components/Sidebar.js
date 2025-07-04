import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useWallet } from '../context/WalletContext';
import { 
  FaGraduationCap, 
  FaWallet, 
  FaBars, 
  FaTimes, 
  FaSignOutAlt, 
  FaSignInAlt, 
  FaUserPlus, 
  FaCopy, 
  FaCheck, 
  FaIdCard,
  FaHome,
  FaStore,
  FaTrophy,
  FaShieldAlt,
  FaChartLine,
  FaAngleLeft,
  FaAngleRight
} from 'react-icons/fa';
import { getCurrentUser, logoutUser } from '../utils/userUtils';
import toast from 'react-hot-toast';

const SidebarContainer = styled(motion.div)`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: ${props => props.isOpen ? '280px' : '80px'};
  background: rgba(20, 20, 40, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1.5px solid rgba(120, 80, 220, 0.2);
  z-index: 1000;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 4px 0 32px rgba(83, 52, 131, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: ${props => props.isOpen ? '280px' : '0px'};
    transform: translateX(${props => props.isOpen ? '0' : '-100%'});
  }
`;

const SidebarHeader = styled.div`
  padding: 2rem 1.5rem 1.5rem;
  border-bottom: 1px solid rgba(120, 80, 220, 0.1);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  
  .logo-icon {
    color: #a259ff;
    font-size: 1.8rem;
    margin-right: ${props => props.isOpen ? '0.8rem' : '0'};
    transition: margin 0.3s;
  }

  .logo-text {
    opacity: ${props => props.isOpen ? '1' : '0'};
    transition: opacity 0.3s;
    white-space: nowrap;
    width: ${props => props.isOpen ? 'auto' : '0'};
    overflow: hidden;
    display: inline-block;
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 18px;
  right: 12px;
  background: linear-gradient(135deg, #a259ff 0%, #3772ff 100%);
  border: none;
  outline: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 1100;
  
  &:hover {
    transform: scale(1.08);
    box-shadow: 0 4px 16px rgba(162, 89, 255, 0.3);
  }
  @media (max-width: 768px) {
    display: none;
  }
`;

const SidebarContent = styled.div`
  padding: 1.5rem 0;
  flex: 1 1 auto;
  overflow-y: auto;
  height: auto;
  min-height: 0;
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(162, 89, 255, 0.3);
    border-radius: 2px;
  }
`;

const NavSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 1.5rem 1rem;
  opacity: ${props => props.isOpen ? '1' : '0'};
  transition: opacity 0.3s;
  white-space: nowrap;
`;

const NavItem = styled(motion.div)`
  margin: 0.3rem 1rem;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  background: ${props => props.active ? 'linear-gradient(90deg, rgba(162, 89, 255, 0.2), rgba(55, 114, 255, 0.2))' : 'transparent'};
  border-radius: 12px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s;
  border: 1px solid ${props => props.active ? 'rgba(162, 89, 255, 0.3)' : 'transparent'};
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(90deg, rgba(162, 89, 255, 0.25), rgba(55, 114, 255, 0.25))' : 'rgba(162, 89, 255, 0.1)'};
    color: white;
    transform: translateX(4px);
  }

  .nav-icon {
    font-size: 1.2rem;
    margin-right: ${props => props.isOpen ? '0.8rem' : '0'};
    min-width: 1.2rem;
    text-align: center;
  }

  .nav-text {
    opacity: ${props => props.isOpen ? '1' : '0'};
    transition: opacity 0.3s;
    white-space: nowrap;
  }
`;

const UserSection = styled.div`
  padding: 1.5rem;
  border-top: 1px solid rgba(120, 80, 220, 0.1);
  margin-top: auto;
  background: transparent;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  opacity: ${props => props.isOpen ? '1' : '0'};
  transition: opacity 0.3s;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a259ff 0%, #3772ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  margin-right: 0.8rem;
`;

const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserEmail = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const WalletInfo = styled.div`
  background: rgba(162, 89, 255, 0.1);
  border-radius: 10px;
  padding: 0.8rem;
  margin-bottom: 1rem;
  opacity: ${props => props.isOpen ? '1' : '0'};
  transition: opacity 0.3s;
`;

const WalletLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  margin-bottom: 0.3rem;
`;

const WalletAddress = styled.div`
  color: #a259ff;
  font-family: monospace;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  
  &:hover {
    color: white;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  opacity: ${props => props.isOpen ? '1' : '0'};
  transition: opacity 0.3s;
`;

const ActionButton = styled.button`
  background: ${props => props.variant === 'primary' ? 'linear-gradient(90deg, #a259ff, #3772ff)' : 'rgba(255, 255, 255, 0.1)'};
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(162, 89, 255, 0.2);
  }
`;

const MobileOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'block' : 'none'};
  }
`;

const MobileToggle = styled.button`
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: linear-gradient(135deg, #a259ff 0%, #3772ff 100%);
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(162, 89, 255, 0.3);
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;

function getInitials(name) {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [copied, setCopied] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { wallet, connectWallet, disconnectWallet } = useWallet();
  const user = getCurrentUser();

  const handleWalletAction = () => {
    if (wallet) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
    toast.success('Đăng xuất thành công!');
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopy = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet);
      setCopied(true);
      toast.success('Đã sao chép địa chỉ ví!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navItems = [
    { path: '/', icon: FaHome, text: 'Trang chủ', section: 'main' },
    { path: '/dashboard', icon: FaChartLine, text: 'Dashboard', section: 'main', protected: true },
    { path: '/learnpass', icon: FaGraduationCap, text: 'LearnPass', section: 'main', protected: true },
    { path: '/marketplace', icon: FaStore, text: 'Marketplace', section: 'main', protected: true },
    { path: '/badges', icon: FaTrophy, text: 'Badges', section: 'main', protected: true },
    { path: '/transfer', icon: FaWallet, text: 'Chuyển tiền', section: 'main', protected: true },
    { path: '/verify', icon: FaShieldAlt, text: 'Xác thực', section: 'main' },
    { path: '/about', icon: FaIdCard, text: 'Giới thiệu', section: 'main' },
  ];

  const renderNavItems = (items) => {
    return items.map((item) => {
      if (item.protected && !user) return null;
      
      return (
        <NavItem key={item.path}>
          <NavLink 
            to={item.path} 
            active={location.pathname === item.path}
            isOpen={isOpen}
            onClick={() => {
              if (window.innerWidth <= 768) {
                setIsOpen(false);
              }
            }}
          >
            <item.icon className="nav-icon" />
            <span className="nav-text">{item.text}</span>
          </NavLink>
        </NavItem>
      );
    });
  };

  return (
    <>
      <MobileToggle onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaAngleLeft /> : <FaAngleRight />}
      </MobileToggle>
      
      <MobileOverlay 
        isOpen={isOpen}
        onClick={() => setIsOpen(false)}
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
      
      <SidebarContainer
        isOpen={isOpen}
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <ToggleButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaAngleLeft /> : <FaAngleRight />}
        </ToggleButton>
        <SidebarHeader isOpen={isOpen}>
          <Logo to="/" isOpen={isOpen}>
            <FaGraduationCap className="logo-icon" />
            <span className="logo-text">EduWallet</span>
          </Logo>
        </SidebarHeader>

        <SidebarContent>
          <NavSection>
            <SectionTitle isOpen={isOpen}>Điều hướng</SectionTitle>
            {renderNavItems(navItems)}
          </NavSection>
        </SidebarContent>

        <UserSection>
          {user && (
            <>
              <UserInfo isOpen={isOpen}>
                <Avatar>{getInitials(user.name || user.username || 'User')}</Avatar>
                <UserDetails>
                  <UserName>{user.name || user.username || 'User'}</UserName>
                  <UserEmail>{user.email || 'user@example.com'}</UserEmail>
                </UserDetails>
              </UserInfo>

              {wallet && (
                <WalletInfo isOpen={isOpen}>
                  <WalletLabel>Ví của bạn</WalletLabel>
                  <WalletAddress onClick={handleCopy}>
                    {formatAddress(wallet)}
                    {copied ? <FaCheck size={12} /> : <FaCopy size={12} />}
                  </WalletAddress>
                </WalletInfo>
              )}

              <ActionButtons isOpen={isOpen}>
                <ActionButton 
                  variant="primary"
                  onClick={handleWalletAction}
                >
                  <FaWallet />
                  {wallet ? 'Ngắt kết nối ví' : 'Kết nối ví'}
                </ActionButton>
                <ActionButton onClick={handleLogout}>
                  <FaSignOutAlt />
                  Đăng xuất
                </ActionButton>
              </ActionButtons>
            </>
          )}

          {!user && (
            <ActionButtons isOpen={isOpen}>
              <ActionButton 
                variant="primary"
                onClick={() => navigate('/login')}
              >
                <FaSignInAlt />
                Đăng nhập
              </ActionButton>
              <ActionButton onClick={() => navigate('/register')}>
                <FaUserPlus />
                Đăng ký
              </ActionButton>
            </ActionButtons>
          )}
        </UserSection>
      </SidebarContainer>
    </>
  );
};

export default Sidebar; 