import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSave, FaUser, FaEnvelope, FaLock, FaPhone, FaCalendar, FaUserShield } from 'react-icons/fa';
import toast from 'react-hot-toast';
import AdminService from '../services/adminService';

const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    role: 'student',
    isActive: true,
    isEmailVerified: false
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      if (dob >= today) {
        newErrors.dateOfBirth = 'Date of birth must be in the past';
      }
    }

    // Phone validation (optional but if provided, validate)
    if (formData.phone && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...userData } = formData;
      
      const response = await AdminService.createUser(userData);
      toast.success('User created successfully!');
      
      if (onUserCreated) {
        onUserCreated(response.data.user);
      }
      
      // Reset form
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      const validationErrors = error.response?.data?.errors;
      
      if (validationErrors && Array.isArray(validationErrors)) {
        // Map backend validation errors to form errors
        const backendErrors = {};
        validationErrors.forEach(err => {
          if (err.path) {
            backendErrors[err.path] = err.message;
          }
        });
        setErrors(backendErrors);
        toast.error('Please fix the validation errors');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      role: 'student',
      isActive: true,
      isEmailVerified: false
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <ModalContainer
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader>
            <HeaderLeft>
              <IconWrapper>
                <FaUser />
              </IconWrapper>
              <HeaderInfo>
                <Title>Create New User</Title>
                <Subtitle>Add a new user to the system</Subtitle>
              </HeaderInfo>
            </HeaderLeft>
            <CloseButton onClick={handleClose}>
              <FaTimes />
            </CloseButton>
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <FormSection>
                <SectionTitle>Account Credentials</SectionTitle>
                <FormGrid>
                  <FormGroup>
                    <Label>
                      <FaUser /> Username <Required>*</Required>
                    </Label>
                    <Input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Enter username"
                      $hasError={!!errors.username}
                    />
                    {errors.username && <ErrorText>{errors.username}</ErrorText>}
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <FaEnvelope /> Email <Required>*</Required>
                    </Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="user@example.com"
                      $hasError={!!errors.email}
                    />
                    {errors.email && <ErrorText>{errors.email}</ErrorText>}
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <FaLock /> Password <Required>*</Required>
                    </Label>
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Min 8 characters"
                      $hasError={!!errors.password}
                    />
                    {errors.password && <ErrorText>{errors.password}</ErrorText>}
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <FaLock /> Confirm Password <Required>*</Required>
                    </Label>
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Re-enter password"
                      $hasError={!!errors.confirmPassword}
                    />
                    {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
                  </FormGroup>
                </FormGrid>
              </FormSection>

              <FormSection>
                <SectionTitle>Personal Information</SectionTitle>
                <FormGrid>
                  <FormGroup>
                    <Label>First Name <Required>*</Required></Label>
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                      $hasError={!!errors.firstName}
                    />
                    {errors.firstName && <ErrorText>{errors.firstName}</ErrorText>}
                  </FormGroup>

                  <FormGroup>
                    <Label>Last Name <Required>*</Required></Label>
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                      $hasError={!!errors.lastName}
                    />
                    {errors.lastName && <ErrorText>{errors.lastName}</ErrorText>}
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <FaPhone /> Phone
                    </Label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1234567890"
                      $hasError={!!errors.phone}
                    />
                    {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <FaCalendar /> Date of Birth <Required>*</Required>
                    </Label>
                    <Input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      max={new Date().toISOString().split('T')[0]}
                      $hasError={!!errors.dateOfBirth}
                    />
                    {errors.dateOfBirth && <ErrorText>{errors.dateOfBirth}</ErrorText>}
                  </FormGroup>
                </FormGrid>
              </FormSection>

              <FormSection>
                <SectionTitle>
                  <FaUserShield /> Role & Permissions
                </SectionTitle>
                <RoleSelector>
                  {[
                    { value: 'student', label: 'Student', desc: 'Regular student account' },
                    { value: 'institution', label: 'Institution', desc: 'Educational institution' },
                    { value: 'admin', label: 'Admin', desc: 'Administrator access' },
                    { value: 'super_admin', label: 'Super Admin', desc: 'Full system access' }
                  ].map((role) => (
                    <RoleOption
                      key={role.value}
                      type="button"
                      $selected={formData.role === role.value}
                      onClick={() => setFormData(prev => ({ ...prev, role: role.value }))}
                    >
                      <FaUserShield />
                      <RoleLabel>{role.label}</RoleLabel>
                      <RoleDesc>{role.desc}</RoleDesc>
                    </RoleOption>
                  ))}
                </RoleSelector>
              </FormSection>

              <FormSection>
                <SectionTitle>Account Settings</SectionTitle>
                <CheckboxGroup>
                  <CheckboxLabel>
                    <Checkbox
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span>Active Account</span>
                    <CheckboxDesc>User can login and access the system</CheckboxDesc>
                  </CheckboxLabel>

                  <CheckboxLabel>
                    <Checkbox
                      type="checkbox"
                      name="isEmailVerified"
                      checked={formData.isEmailVerified}
                      onChange={handleInputChange}
                    />
                    <span>Email Verified</span>
                    <CheckboxDesc>Mark email as already verified</CheckboxDesc>
                  </CheckboxLabel>
                </CheckboxGroup>
              </FormSection>
            </ModalBody>

            <ModalFooter>
              <FooterButtons>
                <CancelButton type="button" onClick={handleClose}>
                  <FaTimes /> Cancel
                </CancelButton>
                <SubmitButton type="submit" disabled={loading}>
                  <FaSave /> {loading ? 'Creating...' : 'Create User'}
                </SubmitButton>
              </FooterButtons>
            </ModalFooter>
          </Form>
        </ModalContainer>
      </Overlay>
    </AnimatePresence>
  );
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
  overflow-y: auto;
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
  margin: auto;
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

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  display: flex;
  align-items: center;
  gap: 8px;
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
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    color: #667eea;
  }
`;

const Required = styled.span`
  color: #e74c3c;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e0e0e0'};
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#667eea'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(102, 126, 234, 0.1)'};
  }

  &::placeholder {
    color: #999;
  }
`;

const ErrorText = styled.span`
  color: #e74c3c;
  font-size: 12px;
  font-weight: 500;
`;

const RoleSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
  color: ${props => props.$selected ? '#667eea' : '#666'};
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }

  svg {
    font-size: 24px;
  }
`;

const RoleLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

const RoleDesc = styled.div`
  font-size: 11px;
  opacity: 0.7;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e9ecef;
  }

  span {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const CheckboxDesc = styled.div`
  font-size: 12px;
  color: #666;
  margin-left: 28px;
`;

const ModalFooter = styled.div`
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
`;

const FooterButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: 12px 24px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  transition: all 0.3s ease;

  &:hover {
    border-color: #999;
    color: #333;
    transform: translateY(-2px);
  }
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default CreateUserModal;
