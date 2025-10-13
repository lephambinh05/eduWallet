import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaEnvelope, FaPhone, FaCalendarAlt, FaGraduationCap } from 'react-icons/fa';
import toast from 'react-hot-toast';

const RegisterContainer = styled.div`
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

const RegisterCard = styled(motion.div)`
  background: rgba(20, 20, 40, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(120, 80, 220, 0.2);
  border-radius: 20px;
  padding: 3rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 1;
  max-height: 90vh;
  overflow-y: auto;
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

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
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

const LoginLink = styled(Link)`
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

const PasswordStrength = styled.div`
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: ${props => {
    if (props.strength === 'weak') return '#ff6b6b';
    if (props.strength === 'medium') return '#ffa726';
    if (props.strength === 'strong') return '#66bb6a';
    return 'rgba(255, 255, 255, 0.5)';
  }};
`;

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getPasswordStrength = (password) => {
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'medium';
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 'strong';
    return 'medium';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      // Đảm bảo lastName không rỗng
      if (!registerData.lastName) {
        registerData.lastName = registerData.firstName;
      }
      const result = await register(registerData);
      if (result.success) {
        // Redirect to dashboard after successful registration
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Logo>
          <FaGraduationCap className="logo-icon" />
          <span className="logo-text">EduWallet</span>
        </Logo>
        
        <Title>Tạo tài khoản mới</Title>
        <Subtitle>Bắt đầu hành trình học tập với EduWallet</Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <InputGroup>
              <InputIcon>
                <FaUser />
              </InputIcon>
              <Input
                type="text"
                name="firstName"
                placeholder="Tên"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </InputGroup>
            
            <InputGroup>
              <InputIcon>
                <FaUser />
              </InputIcon>
              <Input
                type="text"
                name="lastName"
                placeholder="Họ"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </InputGroup>
          </Row>
          
          <InputGroup>
            <InputIcon>
              <FaUser />
            </InputIcon>
            <Input
              type="text"
              name="username"
              placeholder="Tên người dùng"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </InputGroup>
          
          <InputGroup>
            <InputIcon>
              <FaEnvelope />
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
              <FaCalendarAlt />
            </InputIcon>
            <Input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </InputGroup>
          
          <InputGroup>
            <InputIcon>
              <FaPhone />
            </InputIcon>
            <Input
              type="tel"
              name="phone"
              placeholder="Số điện thoại (tùy chọn)"
              value={formData.phone}
              onChange={handleChange}
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
            {formData.password && (
              <PasswordStrength strength={getPasswordStrength(formData.password)}>
                Độ mạnh mật khẩu: {getPasswordStrength(formData.password) === 'weak' ? 'Yếu' : 
                                 getPasswordStrength(formData.password) === 'medium' ? 'Trung bình' : 'Mạnh'}
              </PasswordStrength>
            )}
          </InputGroup>
          
          <InputGroup>
            <InputIcon>
              <FaLock />
            </InputIcon>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <PasswordStrength strength="weak">
                Mật khẩu xác nhận không khớp
              </PasswordStrength>
            )}
          </InputGroup>
          
          <SubmitButton
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </SubmitButton>
          
          <Divider>
            <span>hoặc</span>
          </Divider>
          
          <LoginLink to="/login">
            Đã có tài khoản? <strong>Đăng nhập ngay</strong>
          </LoginLink>
        </Form>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;