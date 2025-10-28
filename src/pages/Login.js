import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styled from "styled-components";
import { motion } from "framer-motion";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaLock,
  FaGraduationCap,
} from "react-icons/fa";
// import toast from 'react-hot-toast'; // Removed unused import

const LoginContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #0c0c0c 0%,
    #1a1a2e 25%,
    #16213e 50%,
    #0f3460 75%,
    #533483 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
`;

const LoginCard = styled(motion.div)`
  background: rgba(20, 20, 40, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(120, 80, 220, 0.2);
  border-radius: 20px;
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 2rem;
    margin: 1rem;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
    margin: 0.5rem;
    border-radius: 16px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;

  .logo-icon {
    font-size: 3rem;
    color: #a259ff;
    margin-right: 1rem;
  }

  .logo-text {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(45deg, #a259ff, #3772ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;

    .logo-icon {
      font-size: 2.5rem;
    }

    .logo-text {
      font-size: 1.75rem;
    }
  }

  @media (max-width: 480px) {
    margin-bottom: 1.25rem;

    .logo-icon {
      font-size: 2rem;
    }

    .logo-text {
      font-size: 1.5rem;
    }
  }
`;

const Title = styled.h1`
  text-align: center;
  color: white;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
  font-size: 1rem;

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
  }

  @media (max-width: 480px) {
    margin-bottom: 1.25rem;
    font-size: 0.875rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 768px) {
    gap: 1.25rem;
  }

  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  -webkit-appearance: none;
  appearance: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: #a259ff;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(162, 89, 255, 0.1);
  }

  @media (max-width: 768px) {
    padding: 0.9rem 0.9rem 0.9rem 2.75rem;
    font-size: 0.95rem;
  }

  @media (max-width: 480px) {
    padding: 0.8rem 0.8rem 0.8rem 2.5rem;
    font-size: 0.9rem;
    border-radius: 10px;
  }

  @media (hover: none) {
    font-size: 16px; /* Prevent auto-zoom on iOS */
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.1rem;
  z-index: 2;

  @media (max-width: 768px) {
    font-size: 1rem;
    left: 0.9rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    left: 0.8rem;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-size: 1.1rem;
  z-index: 2;
  transition: color 0.3s ease;
  padding: 0.5rem;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    color: #a259ff;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
    right: 0.75rem;
    padding: 0.4rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    right: 0.5rem;
    padding: 0.3rem;
  }

  @media (hover: none) {
    &:active {
      color: #a259ff;
      transform: translateY(-50%) scale(0.95);
    }
  }
`;

const ForgotPassword = styled(Link)`
  color: #a259ff;
  text-decoration: none;
  font-size: 0.9rem;
  text-align: right;
  transition: color 0.3s ease;
  -webkit-tap-highlight-color: transparent;
  padding: 0.2rem 0;
  display: inline-block;

  &:hover {
    color: #3772ff;
  }

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }

  @media (hover: none) {
    &:active {
      color: #3772ff;
      transform: scale(0.98);
    }
  }
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #a259ff 0%, #3772ff 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(162, 89, 255, 0.3);
  }

  &:not(:disabled):active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 0.9rem;
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    padding: 0.8rem;
    font-size: 0.95rem;
    border-radius: 10px;
  }

  @media (hover: none) {
    &:not(:disabled):hover {
      transform: none;
      box-shadow: none;
    }

    &:not(:disabled):active {
      transform: scale(0.98);
      opacity: 0.95;
    }
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }

  span {
    color: rgba(255, 255, 255, 0.5);
    padding: 0 1rem;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    margin: 1.25rem 0;

    span {
      padding: 0 0.75rem;
      font-size: 0.85rem;
    }
  }

  @media (max-width: 480px) {
    margin: 1rem 0;

    span {
      padding: 0 0.5rem;
      font-size: 0.8rem;
    }
  }
`;

const RegisterLink = styled(Link)`
  display: block;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s ease;
  -webkit-tap-highlight-color: transparent;
  padding: 0.2rem 0;

  &:hover {
    color: #a259ff;
  }

  strong {
    color: #a259ff;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }

  @media (hover: none) {
    &:active {
      color: #a259ff;
      transform: scale(0.98);
    }
  }
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        // Redirect after successful login based on role
        const role = result.user?.role || user?.role;
        if (role && ["admin", "super_admin"].includes(role)) {
          navigate("/admin/dashboard");
        } else if (role === "partner") {
          navigate("/partner/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // If user is already authenticated, redirect away from /login
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const role = user?.role;
      if (role && ["admin", "super_admin"].includes(role)) {
        navigate("/admin/dashboard");
      } else if (role === "partner") {
        navigate("/partner/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  return (
    <LoginContainer>
      <LoginCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Logo>
          <FaGraduationCap className="logo-icon" />
          <span className="logo-text">EduWallet</span>
        </Logo>

        <Title>Chào mừng trở lại!</Title>
        <Subtitle>Đăng nhập để tiếp tục hành trình học tập của bạn</Subtitle>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <FaUser />
            </InputIcon>
            <Input
              type="email"
              name="email"
              placeholder="Địa chỉ email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <FaLock />
            </InputIcon>
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle>
          </InputGroup>

          <ForgotPassword to="/forgot-password">Quên mật khẩu?</ForgotPassword>

          <SubmitButton
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </SubmitButton>

          <Divider>
            <span>hoặc</span>
          </Divider>

          <RegisterLink to="/register">
            Chưa có tài khoản? <strong>Tạo tài khoản mới</strong>
          </RegisterLink>
        </Form>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
