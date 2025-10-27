import React, { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import styled from "styled-components";
import {
  FaHome,
  FaUsers,
  FaHistory,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserShield,
  FaCertificate,
  FaGraduationCap,
  FaGem,
} from "react-icons/fa";
import { useAdmin } from "../context/AdminContext";
import toast from "react-hot-toast";

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #0f0f1e;
`;

const Sidebar = styled.aside`
  width: ${(props) => (props.$isOpen ? "250px" : "70px")};
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-right: 1px solid rgba(162, 89, 255, 0.1);
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  z-index: 1000;
  overflow: hidden;

  @media (max-width: 768px) {
    width: ${(props) => (props.$isOpen ? "250px" : "0")};
    left: ${(props) => (props.$isOpen ? "0" : "-250px")};
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(162, 89, 255, 0.1);

  .icon {
    font-size: 1.8rem;
    color: #a259ff;
    min-width: 28px;
  }

  .title {
    color: white;
    font-size: 1.3rem;
    font-weight: 700;
    white-space: nowrap;
    opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  }
`;

const SidebarNav = styled.nav`
  padding: 1rem 0;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;

  .icon {
    font-size: 1.2rem;
    min-width: 24px;
  }

  .label {
    white-space: nowrap;
    opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  }

  &:hover {
    background: rgba(162, 89, 255, 0.1);
    color: #a259ff;
  }

  &.active {
    background: rgba(162, 89, 255, 0.15);
    color: #a259ff;
    border-left: 3px solid #a259ff;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: rgba(255, 100, 100, 0.8);
  background: none;
  border: none;
  width: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;

  .icon {
    font-size: 1.2rem;
    min-width: 24px;
  }

  .label {
    white-space: nowrap;
    opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  }

  &:hover {
    background: rgba(255, 100, 100, 0.1);
    color: #ff6464;
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: ${(props) => (props.$sidebarOpen ? "250px" : "70px")};
  transition: margin-left 0.3s ease;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const TopBar = styled.header`
  background: rgba(20, 20, 40, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(162, 89, 255, 0.1);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const MenuToggle = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.3s ease;

  &:hover {
    color: #a259ff;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #a259ff, #3772ff);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
  }

  .info {
    @media (max-width: 576px) {
      display: none;
    }

    .name {
      color: white;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .role {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.85rem;
    }
  }
`;

const ContentArea = styled.div`
  padding: 2rem;
  min-height: calc(100vh - 73px);
`;

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { adminUser, logout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const getInitials = () => {
    if (!adminUser) return "A";
    return `${adminUser.firstName?.[0] || ""}${
      adminUser.lastName?.[0] || ""
    }`.toUpperCase();
  };

  return (
    <LayoutContainer>
      <Sidebar $isOpen={sidebarOpen}>
        <SidebarHeader $isOpen={sidebarOpen}>
          <FaUserShield className="icon" />
          <span className="title">Admin Panel</span>
        </SidebarHeader>

        <SidebarNav>
          <NavItem to="/admin/dashboard" $isOpen={sidebarOpen}>
            <FaHome className="icon" />
            <span className="label">Dashboard</span>
          </NavItem>

          <NavItem to="/admin/users" $isOpen={sidebarOpen}>
            <FaUsers className="icon" />
            <span className="label">Users</span>
          </NavItem>

          <NavItem to="/admin/activities" $isOpen={sidebarOpen}>
            <FaChartLine className="icon" />
            <span className="label">Activities</span>
          </NavItem>

          <NavItem to="/admin/certificates" $isOpen={sidebarOpen}>
            <FaCertificate className="icon" />
            <span className="label">Certificates</span>
          </NavItem>

          <NavItem to="/admin/learnpasses" $isOpen={sidebarOpen}>
            <FaGraduationCap className="icon" />
            <span className="label">LearnPasses</span>
          </NavItem>

          <NavItem to="/admin/nft-portfolio" $isOpen={sidebarOpen}>
            <FaGem className="icon" />
            <span className="label">NFT Portfolio</span>
          </NavItem>

          <NavItem to="/admin/portfolio-changes" $isOpen={sidebarOpen}>
            <FaHistory className="icon" />
            <span className="label">Portfolio Changes</span>
          </NavItem>

          <NavItem to="/admin/settings" $isOpen={sidebarOpen}>
            <FaCog className="icon" />
            <span className="label">Settings</span>
          </NavItem>
        </SidebarNav>

        <LogoutButton onClick={handleLogout} $isOpen={sidebarOpen}>
          <FaSignOutAlt className="icon" />
          <span className="label">Logout</span>
        </LogoutButton>
      </Sidebar>

      <MainContent $sidebarOpen={sidebarOpen}>
        <TopBar>
          <MenuToggle onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </MenuToggle>

          <UserInfo>
            <div className="avatar">{getInitials()}</div>
            <div className="info">
              <div className="name">
                {adminUser?.firstName} {adminUser?.lastName}
              </div>
              <div className="role">{adminUser?.role}</div>
            </div>
          </UserInfo>
        </TopBar>

        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default AdminLayout;
