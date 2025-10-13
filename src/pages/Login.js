import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaGraduationCap } from 'react-icons/fa';
// import toast from 'react-hot-toast'; // Removed unused import

const LoginContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
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
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 1;
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
`;

const Title = styled.h1`
  text-align: center;
  color: white;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
  font-size: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #a259ff;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(162, 89, 255, 0.1);
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
  
  &:hover {
    color: #a259ff;
  }
`;

const ForgotPassword = styled(Link)`
  color: #a259ff;
  text-decoration: none;
  font-size: 0.9rem;
  text-align: right;
  transition: color 0.3s ease;
  
  &:hover {
    color: #3772ff;
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
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }
  
  span {
    color: rgba(255, 255, 255, 0.5);
    padding: 0 1rem;
    font-size: 0.9rem;
  }
`;

const RegisterLink = styled(Link)`
  display: block;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: #a259ff;
  }
  
  strong {
    color: #a259ff;
    font-weight: 600;
  }
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
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
        // Redirect to dashboard after successful login
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
              type={showPassword ? 'text' : 'password'}
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
          
          <ForgotPassword to="/forgot-password">
            Quên mật khẩu?
          </ForgotPassword>
          
          <SubmitButton
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
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