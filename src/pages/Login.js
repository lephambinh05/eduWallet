import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaMagic } from 'react-icons/fa';
import { validateUser, saveUserToLocalStorage } from '../utils/userUtils';
import toast from 'react-hot-toast';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const LoginCard = styled.div`
  background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(83,52,131,0.05) 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255,255,255,0.12);
  border-radius: 20px;
  padding: 3rem 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px 0 rgba(83,52,131,0.15);
`;

const Title = styled.h2`
  text-align: center;
  color: white;
  margin-bottom: 2rem;
  font-size: 2rem;
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
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 10px;
  background: rgba(255,255,255,0.05);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #533483;
    box-shadow: 0 0 0 3px rgba(83,52,131,0.1);
  }

  &::placeholder {
    color: rgba(255,255,255,0.6);
  }
`;

const Icon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255,255,255,0.6);
  font-size: 1.2rem;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  font-size: 1.2rem;
`;

const Button = styled.button`
  background: linear-gradient(90deg, #533483, #0f3460, #16213e, #1a1a2e);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(83,52,131,0.4);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const LinkText = styled.div`
  text-align: center;
  color: rgba(255,255,255,0.8);
  margin-top: 1rem;

  a {
    color: #533483;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const AutoFillButton = styled.button`
  background: linear-gradient(90deg, #4CAF50, #45a049);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  margin-bottom: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
  }
`;

const DemoInfo = styled.div`
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.6);
  
  .demo-accounts {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .demo-account {
    background: rgba(255,255,255,0.05);
    padding: 0.5rem;
    border-radius: 8px;
    font-family: monospace;
    font-size: 0.8rem;
  }
`;

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAutoFill = (username, password) => {
    setFormData({
      username,
      password
    });
    toast.success('Đã điền thông tin đăng nhập!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate user using utility function
      const user = validateUser(formData.username, formData.password);

      if (user) {
        // Save user to localStorage
        saveUserToLocalStorage(user);
        toast.success('Đăng nhập thành công!');
        navigate('/dashboard');
      } else {
        toast.error('Tên đăng nhập hoặc mật khẩu không đúng!');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng nhập!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <LoginCard>
        <Title>Đăng nhập</Title>
        
        <AutoFillButton onClick={() => handleAutoFill('lephambinhdz', 'BinhdzITK29')}>
          <FaMagic />
          Auto Fill - Lê Phạm Bình
        </AutoFillButton>
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Icon>
              <FaUser />
            </Icon>
            <Input
              type="text"
              name="username"
              placeholder="Tên đăng nhập"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <Icon>
              <FaLock />
            </Icon>
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

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </Form>

        <LinkText>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </LinkText>
      </LoginCard>
    </Container>
  );
};

export default Login; 