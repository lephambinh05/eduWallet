import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useWallet } from "../context/WalletContext";
import {
  FaGraduationCap,
  FaWallet,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
  FaCopy,
  FaCheck,
  FaIdCard,
  FaHome,
  FaStore,
  FaChartLine,
  FaUsers,
  FaAngleLeft,
  FaAngleRight,
  FaGem,
  FaCoins,
} from "react-icons/fa";
import { getCurrentUser } from "../utils/userUtils";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useEffect } from "react";

const SidebarContainer = styled(motion.div).attrs((props) => ({
  "data-is-open": props.$isOpen,
}))`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 280px;
  background: rgba(20, 20, 40, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1.5px solid rgba(120, 80, 220, 0.2);
  z-index: 1000;
  transform: translateX(${(props) => (props.$isOpen ? "0" : "-100%")});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${(props) =>
    props.$isOpen ? "4px 0 32px rgba(83, 52, 131, 0.18)" : "none"};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div.attrs((props) => ({
  "data-is-open": props.$isOpen,
}))`
  padding: 2rem 1.5rem 1.5rem;
  border-bottom: 1px solid rgba(120, 80, 220, 0.1);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
`;

const Logo = styled(Link).attrs((props) => ({
  "data-is-open": props.$isOpen,
}))`
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
    margin-right: ${(props) => (props.$isOpen ? "0.8rem" : "0")};
    transition: margin 0.3s;
  }

  .logo-text {
    opacity: ${(props) => (props.$isOpen ? "1" : "0")};
    transition: opacity 0.3s;
    white-space: nowrap;
    width: ${(props) => (props.$isOpen ? "auto" : "0")};
    overflow: hidden;
    display: inline-block;
  }
`;

const ToggleButton = styled.button.attrs((props) => ({
  "data-is-open": props.$isOpen,
}))`
  position: ${(props) => (props.$isOpen ? "absolute" : "fixed")};
  top: ${(props) => (props.$isOpen ? "18px" : "20px")};
  left: ${(props) => (props.$isOpen ? "auto" : "20px")};
  right: ${(props) => (props.$isOpen ? "12px" : "auto")};
  background: linear-gradient(135deg, #a259ff 0%, #3772ff 100%);
  border: none;
  outline: none;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 4px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 1100;
  box-shadow: 0 4px 16px rgba(162, 89, 255, 0.4);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(162, 89, 255, 0.5);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const HamburgerLine = styled.span`
  width: 20px;
  height: 2.5px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s;
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

const SectionTitle = styled.h3.attrs((props) => ({
  "data-is-open": props.$isOpen,
}))`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 1.5rem 1rem;
  opacity: ${(props) => (props.$isOpen ? "1" : "0")};
  transition: opacity 0.3s;
  white-space: nowrap;
`;

const NavItem = styled(motion.div)`
  margin: 0.3rem 1rem;
`;

const NavLink = styled(Link).attrs((props) => ({
  "data-active": props.$active,
}))`
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  color: ${(props) => (props.$active ? "white" : "rgba(255, 255, 255, 0.7)")};
  background: ${(props) =>
    props.$active
      ? "linear-gradient(90deg, rgba(162, 89, 255, 0.2), rgba(55, 114, 255, 0.2))"
      : "transparent"};
  border-radius: 12px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s;
  border: 1px solid
    ${(props) => (props.$active ? "rgba(162, 89, 255, 0.3)" : "transparent")};

  &:hover {
    background: ${(props) =>
      props.$active
        ? "linear-gradient(90deg, rgba(162, 89, 255, 0.25), rgba(55, 114, 255, 0.25))"
        : "rgba(162, 89, 255, 0.1)"};
    color: white;
    transform: translateX(4px);
  }

  .nav-icon {
    font-size: 1.2rem;
    margin-right: ${(props) => (props.$isOpen ? "0.8rem" : "0")};
    min-width: 1.2rem;
    text-align: center;
  }

  .nav-text {
    display: inline-block;
    opacity: ${(props) => (props.$isOpen ? "1" : "0")};
    transition: opacity 0.18s ease;
    white-space: nowrap;
    min-width: 2px; /* prevent collapse to zero width */
  }
`;

// Non-clickable group header used for items that only serve as a container
const NavGroupHeader = styled.div.attrs((props) => ({
  "data-active": props.$active,
}))`
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  color: ${(props) => (props.$active ? "white" : "rgba(255, 255, 255, 0.7)")};
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s;
  border: 1px solid
    ${(props) => (props.$active ? "rgba(162, 89, 255, 0.3)" : "transparent")};

  .nav-icon {
    font-size: 1.2rem;
    margin-right: ${(props) => (props.$isOpen ? "0.8rem" : "0")};
    min-width: 1.2rem;
    text-align: center;
  }

  .nav-text {
    opacity: ${(props) => (props.$isOpen ? "1" : "0")};
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

const UserInfo = styled.div.attrs((props) => ({
  "data-is-open": props.$isOpen,
}))`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  opacity: ${(props) => (props.$isOpen ? "1" : "0")};
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

const WalletInfo = styled.div.attrs((props) => ({
  "data-is-open": props.$isOpen,
}))`
  background: rgba(162, 89, 255, 0.1);
  border-radius: 10px;
  padding: 0.8rem;
  margin-bottom: 1rem;
  opacity: ${(props) => (props.$isOpen ? "1" : "0")};
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

const ActionButtons = styled.div.attrs((props) => ({
  "data-is-open": props.$isOpen,
}))`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  opacity: ${(props) => (props.$isOpen ? "1" : "0")};
  transition: opacity 0.3s;
`;

const ActionButton = styled.button.attrs((props) => ({
  "data-variant": props.variant,
}))`
  background: ${(props) =>
    props.variant === "primary"
      ? "linear-gradient(90deg, #a259ff, #3772ff)"
      : "rgba(255, 255, 255, 0.1)"};
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

const MobileOverlay = styled(motion.div).attrs((props) => ({
  "data-is-open": props.$isOpen,
}))`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
  opacity: ${(props) => (props.$isOpen ? "1" : "0")};
  visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
  transition: all 0.3s;
`;

const MobileToggle = styled.button`
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1101;
  background: linear-gradient(135deg, #a259ff 0%, #3772ff 100%);
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 4px;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(162, 89, 255, 0.4);
  transition: all 0.3s;
  opacity: ${(props) => (props.$isOpen ? "0" : "1")};
  visibility: ${(props) => (props.$isOpen ? "hidden" : "visible")};
  pointer-events: ${(props) => (props.$isOpen ? "none" : "auto")};

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(162, 89, 255, 0.5);
  }

  &:active {
    transform: scale(0.95);
  }
`;

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [copied, setCopied] = useState(false);
  // track which nav groups (items with children) are expanded
  const [openGroups, setOpenGroups] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const { account, isConnected, connectWallet, disconnectWallet } = useWallet();
  const { logout } = useAuth();
  const user = getCurrentUser();

  // Không tự động đóng sidebar trên mobile nữa - để người dùng tự điều khiển
  // useEffect(() => {
  //   if (window.innerWidth <= 768) {
  //     setIsOpen(false);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [location.pathname]);

  // close on ESC key for accessibility
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setIsOpen]);

  const handleWalletAction = () => {
    if (isConnected && account) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Đăng xuất thành công!");
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopy = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      toast.success("Đã sao chép địa chỉ ví!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navItems = [
    // default entries for non-partner users (students/institutions)
    { path: "/", icon: FaHome, text: "Trang chủ", section: "main" },
    {
      path: "/dashboard",
      icon: FaChartLine,
      text: "Dashboard",
      section: "main",
      protected: true,
    },
    {
      path: "/portfolio",
      icon: FaGraduationCap,
      text: "Portfolio",
      section: "main",
      protected: true,
    },
    {
      path: "/portfolio-nft",
      icon: FaGem,
      text: "Portfolio NFT",
      section: "main",
      protected: true,
    },
    {
      path: "/marketplace",
      icon: FaStore,
      text: "Marketplace",
      section: "main",
      protected: true,
    },
    {
      path: "/courses",
      icon: FaGraduationCap,
      text: "Khóa học",
      section: "main",
      protected: true,
      // dropdown children: buy courses and manage my courses
      children: [
        { path: "/courses", text: "Mua khóa học" },
        { path: "/my-courses", text: "Quản lý khóa học" },
      ],
    },
    {
      path: "/deposit-points",
      icon: FaCoins,
      text: "Nạp Point",
      section: "main",
      protected: true,
    },
  ];

  // If current user is partner, replace navItems with partner-specific menu
  const partnerNavItems = [
    // Use Dashboard as primary entry for partners
    {
      path: "/partner/dashboard",
      icon: FaChartLine,
      text: "Dashboard",
      section: "partner",
      protected: true,
    },
    {
      path: "/partner/courses",
      icon: FaGraduationCap,
      text: "Quản lý khóa học",
      section: "partner",
      protected: true,
    },
    {
      path: "/partner/learners",
      icon: FaUsers,
      text: "Quản lý người học",
      section: "partner",
      protected: true,
    },
    // Partner documentation (internal link)
    {
      path: "/partner/docs",
      icon: FaIdCard,
      text: "Tài liệu tích hợp",
      section: "partner",
      protected: true,
    },
  ];

  const effectiveNavItems =
    user && user.role === "partner" ? partnerNavItems : navItems;

  const renderNavItems = (items) => {
    return items.map((item) => {
      if (item.protected && !user) return null;
      // If item has children render a collapsible submenu
      if (item.children && item.children.length > 0) {
        const isActive =
          location.pathname === item.path ||
          item.children.some((c) => location.pathname === c.path);

        const isOpenGroup = openGroups[item.path] ?? isActive;

        return (
          <NavItem key={item.path}>
            {/* parent shown as a clickable group header to toggle children */}
            <NavGroupHeader
              $active={isActive}
              $isOpen={isOpen}
              title={item.text}
              onClick={() => {
                setOpenGroups((s) => ({ ...s, [item.path]: !isOpenGroup }));
              }}
              style={{ cursor: "pointer" }}
            >
              <item.icon className="nav-icon" />
              <span className="nav-text">{item.text}</span>
            </NavGroupHeader>

            {/* render children as simple links (conditionally) */}
            <div
              style={{
                marginLeft: isOpen ? 36 : 0,
                marginTop: 6,
                display: isOpenGroup ? "block" : "none",
              }}
            >
              {item.children.map((c) => (
                <NavItem key={c.path}>
                  <NavLink
                    to={c.path}
                    $active={location.pathname === c.path}
                    $isOpen={isOpen}
                    title={c.text}
                    style={{ paddingLeft: isOpen ? 18 : 0, fontSize: "0.9rem" }}
                  >
                    <span className="nav-text">{c.text}</span>
                  </NavLink>
                </NavItem>
              ))}
            </div>
          </NavItem>
        );
      }

      return (
        <NavItem key={item.path}>
          <NavLink
            to={item.path}
            $active={location.pathname === item.path}
            $isOpen={isOpen}
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
      <MobileToggle
        $isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open sidebar"
      >
        <HamburgerLine />
        <HamburgerLine />
        <HamburgerLine />
      </MobileToggle>

      <MobileOverlay $isOpen={isOpen} onClick={() => setIsOpen(false)} />

      <SidebarContainer
        role="navigation"
        aria-label="Main navigation"
        $isOpen={isOpen}
      >
        <ToggleButton
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          $isOpen={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaAngleLeft /> : <FaAngleRight />}
        </ToggleButton>
        <SidebarHeader $isOpen={isOpen}>
          <Logo to="/" $isOpen={isOpen}>
            <FaGraduationCap className="logo-icon" />
            <span className="logo-text">EduWallet</span>
          </Logo>
        </SidebarHeader>

        <SidebarContent>
          <NavSection>
            <SectionTitle $isOpen={isOpen}>Điều hướng</SectionTitle>
            {renderNavItems(effectiveNavItems)}
          </NavSection>
        </SidebarContent>

        <UserSection>
          {user && (
            <>
              <UserInfo $isOpen={isOpen}>
                <Avatar>
                  {getInitials(user.name || user.username || "User")}
                </Avatar>
                <UserDetails>
                  <UserName>{user.name || user.username || "User"}</UserName>
                  <UserEmail>{user.email || "user@example.com"}</UserEmail>
                </UserDetails>
              </UserInfo>

              {isConnected && account && (
                <WalletInfo $isOpen={isOpen}>
                  <WalletLabel>Ví của bạn</WalletLabel>
                  <WalletAddress onClick={handleCopy}>
                    {formatAddress(account)}
                    {copied ? <FaCheck size={12} /> : <FaCopy size={12} />}
                  </WalletAddress>
                </WalletInfo>
              )}

              <ActionButtons $isOpen={isOpen}>
                <ActionButton variant="primary" onClick={handleWalletAction}>
                  <FaWallet />
                  {isConnected && account ? "Ngắt kết nối ví" : "Kết nối ví"}
                </ActionButton>
                <ActionButton onClick={handleLogout}>
                  <FaSignOutAlt />
                  Đăng xuất
                </ActionButton>
              </ActionButtons>
            </>
          )}

          {!user && (
            <ActionButtons $isOpen={isOpen}>
              <ActionButton
                variant="primary"
                onClick={() => navigate("/login")}
              >
                <FaSignInAlt />
                Đăng nhập
              </ActionButton>
              <ActionButton onClick={() => navigate("/register")}>
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
