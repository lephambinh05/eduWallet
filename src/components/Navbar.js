import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useWallet } from "../context/WalletContext";
import {
  FaGraduationCap,
  FaWallet,
  FaBars,
  FaTimes,
  FaUser,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
  FaCopy,
  FaCheck,
  FaIdCard,
} from "react-icons/fa";
import { getCurrentUser, logoutUser } from "../utils/userUtils";
import toast from "react-hot-toast";

// Các styled-component phía dưới (giữ nguyên như file bạn gửi, không đổi tên)

const Nav = styled.nav`
  background: rgba(20, 20, 40, 0.85);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-bottom: 1.5px solid rgba(120, 80, 220, 0.18);
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 1rem 0;
  box-shadow: 0 4px 32px 0 rgba(83, 52, 131, 0.18);
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 1024px) {
    padding: 0 1.25rem;
  }
  @media (max-width: 480px) {
    padding: 0 0.75rem;
  }
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
    margin-right: 0.5rem;
    color: #a259ff;
    font-size: 1.8rem;
  }

  @media (max-width: 480px) {
    font-size: 1.1rem;
    .logo-icon {
      font-size: 1.4rem;
      margin-right: 0.4rem;
    }
  }
`;

const NavMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 2.2rem;
  @media (max-width: 900px) {
    gap: 1.2rem;
  }
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: ${(props) => (props.active ? "transparent" : "white")};
  background: ${(props) =>
    props.active ? "linear-gradient(90deg, #a259ff, #3772ff)" : "none"};
  -webkit-background-clip: ${(props) => (props.active ? "text" : "unset")};
  background-clip: ${(props) => (props.active ? "text" : "unset")};
  font-weight: 600;
  text-decoration: none;
  font-size: 1.08rem;
  position: relative;
  padding: 0.2rem 0.1rem;
  transition: color 0.2s;
  &:hover {
    color: #a259ff;
  }
  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -6px;
    width: ${(props) => (props.active ? "100%" : "0")};
    height: 3px;
    border-radius: 2px;
    background: linear-gradient(90deg, #a259ff, #3772ff);
    transition: width 0.3s;
  }
  &:hover::after {
    width: 100%;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
`;

const AvatarButton = styled.button`
  background: linear-gradient(135deg, #a259ff 0%, #3772ff 100%);
  border: none;
  outline: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(162, 89, 255, 0.12);
  position: relative;
  transition: box-shadow 0.2s, transform 0.2s;
  &:hover {
    box-shadow: 0 4px 24px rgba(162, 89, 255, 0.22);
    transform: scale(1.07);
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 56px;
  right: 0;
  min-width: 180px;
  background: rgba(30, 30, 50, 0.98);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(162, 89, 255, 0.18);
  padding: 1rem 0.7rem;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  animation: fadeIn 0.2s;
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const DropdownItem = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  padding: 0.5rem 0.7rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  cursor: pointer;
  transition: background 0.18s;
  &:hover {
    background: linear-gradient(90deg, #a259ff22, #3772ff22);
  }
`;

const WalletButton = styled(motion.button)`
  background: linear-gradient(90deg, #a259ff, #3772ff);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 1rem;
  box-shadow: 0 2px 12px rgba(162, 89, 255, 0.12);
  transition: all 0.2s;
  &:hover {
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 8px 25px rgba(55, 114, 255, 0.18);
    background: linear-gradient(90deg, #3772ff, #a259ff);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const WalletAddress = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 0.5rem 1.1rem;
  font-family: monospace;
  color: #a259ff;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.18s;
  &:hover {
    background: rgba(162, 89, 255, 0.18);
    color: #fff;
  }
`;

const AuthButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LoginButton = styled(Link)`
  background: linear-gradient(90deg, #a259ff, #3772ff);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  text-decoration: none;
  font-size: 1rem;
  &:hover {
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 8px 25px rgba(162, 89, 255, 0.18);
    color: white;
    background: linear-gradient(90deg, #3772ff, #a259ff);
  }
`;

const RegisterButton = styled(Link)`
  background: transparent;
  color: #a259ff;
  border: 2px solid #a259ff;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  text-decoration: none;
  font-size: 1rem;
  &:hover {
    background: #a259ff;
    color: white;
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 8px 25px rgba(162, 89, 255, 0.18);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.7rem;
  cursor: pointer;
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled(motion.div)`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(20, 20, 40, 0.98);
  backdrop-filter: blur(10px);
  z-index: 1001;
  padding: 2rem;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;
  }
`;

const MobileNavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 600;
  transition: all 0.2s;
  &:hover {
    color: #a259ff;
  }
`;

function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const { isConnected, account, connectWallet, disconnectWallet, isLoading } =
    useWallet();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef();

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, [location]);

  useEffect(() => {
    // Temporarily disabled auto-connect to prevent MetaMask errors
    // const user = getCurrentUser();
    // const wasWalletConnected = localStorage.getItem('isWalletConnected') === 'true';
    // if (user && wasWalletConnected && !isConnected && !isLoading && window.ethereum) {
    //   // Only auto-connect if MetaMask is available
    //   connectWallet();
    // }
    // eslint-disable-next-line
  }, [currentUser, isConnected, isLoading]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const navItems = [
    { path: "/", label: "Trang chủ" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/learnpass", label: "LearnPass" },
    { path: "/marketplace", label: "Marketplace" },
    { path: "/badges", label: "Badges" },
    { path: "/transfer", label: "Chuyển tiền" }, // Đã thêm chuyển tiền ở đây!
    { path: "/verify", label: "Xác minh" },
    { path: "/about", label: "Giới thiệu" },
  ];

  const handleWalletAction = () => {
    if (!currentUser) {
      toast.error("Vui lòng đăng nhập trước khi kết nối ví!");
      return;
    }

    if (isConnected) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setShowDropdown(false);
    toast.success("Đăng xuất thành công!");
    navigate("/");
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopy = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      toast.success("Đã copy địa chỉ ví!");
      setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <Nav>
      <NavContainer>
        <Logo to="/">
          <FaGraduationCap className="logo-icon" />
          EduWallet
        </Logo>

        <NavMenu>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              active={location.pathname === item.path}
            >
              {item.label}
            </NavLink>
          ))}
        </NavMenu>

        <UserSection>
          {currentUser ? (
            <>
              <div style={{ position: "relative" }}>
                <AvatarButton
                  onClick={() => setShowDropdown((v) => !v)}
                  title={currentUser.name}
                >
                  <FaIdCard />
                </AvatarButton>
                {showDropdown && (
                  <Dropdown ref={dropdownRef}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#a259ff",
                        marginBottom: 4,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <FaUser /> {currentUser.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.95rem",
                        color: "#bbb",
                        marginBottom: 8,
                      }}
                    >
                      {currentUser.email}
                    </div>
                    <DropdownItem onClick={handleLogout}>
                      <FaSignOutAlt /> Đăng xuất
                    </DropdownItem>
                  </Dropdown>
                )}
              </div>
              {isConnected ? (
                <WalletAddress onClick={handleCopy} title="Copy địa chỉ ví">
                  <FaWallet />
                  {formatAddress(account)}
                  {copied ? (
                    <FaCheck style={{ color: "#4CAF50" }} />
                  ) : (
                    <FaCopy />
                  )}
                </WalletAddress>
              ) : (
                <WalletButton
                  onClick={handleWalletAction}
                  disabled={isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaWallet />
                  {isLoading ? "Đang kết nối..." : "Kết nối ví"}
                </WalletButton>
              )}
            </>
          ) : (
            <AuthButtons>
              <LoginButton to="/login">
                <FaSignInAlt />
                Đăng nhập
              </LoginButton>
              <RegisterButton to="/register">
                <FaUserPlus />
                Đăng ký
              </RegisterButton>
            </AuthButtons>
          )}
          <MobileMenuButton
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </MobileMenuButton>
        </UserSection>
      </NavContainer>

      {isMobileMenuOpen && (
        <MobileMenu
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {navItems.map((item) => (
            <MobileNavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </MobileNavLink>
          ))}
          {currentUser ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.2rem",
                marginTop: "2rem",
                alignItems: "center",
              }}
            >
              <AvatarButton
                style={{ width: 54, height: 54, fontSize: 26, marginBottom: 8 }}
              >
                <FaIdCard />
              </AvatarButton>
              <div style={{ color: "#a259ff", fontWeight: 600 }}>
                {currentUser.name}
              </div>
              <div style={{ color: "#bbb", fontSize: 14, marginBottom: 8 }}>
                {currentUser.email}
              </div>
              <DropdownItem
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                <FaSignOutAlt /> Đăng xuất
              </DropdownItem>
              {isConnected ? (
                <WalletAddress onClick={handleCopy} style={{ marginTop: 8 }}>
                  <FaWallet />
                  {formatAddress(account)}
                  {copied ? (
                    <FaCheck style={{ color: "#4CAF50" }} />
                  ) : (
                    <FaCopy />
                  )}
                </WalletAddress>
              ) : (
                <WalletButton
                  onClick={() => {
                    handleWalletAction();
                    setIsMobileMenuOpen(false);
                  }}
                  style={{ marginTop: 8 }}
                >
                  <FaWallet />
                  {isLoading ? "Đang kết nối..." : "Kết nối ví"}
                </WalletButton>
              )}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.2rem",
                marginTop: "2rem",
                alignItems: "center",
              }}
            >
              <LoginButton
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaSignInAlt />
                Đăng nhập
              </LoginButton>
              <RegisterButton
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaUserPlus />
                Đăng ký
              </RegisterButton>
            </div>
          )}
        </MobileMenu>
      )}
    </Nav>
  );
};

export default Navbar;
