import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaWallet, FaCertificate, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { useWallet } from '../../context/WalletContext';
import toast from 'react-hot-toast';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled(motion.div)`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 20px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h2`
  color: #fff;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #fff;
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.8rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const Select = styled.select`
  padding: 0.8rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
  }

  option {
    background: #1a1a2e;
    color: #fff;
  }
`;

const TextArea = styled.textarea`
  padding: 0.8rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  min-height: 100px;
  resize: vertical;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &.primary {
    background: linear-gradient(90deg, #a259ff, #3772ff);
    color: white;

    &:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(162, 89, 255, 0.4);
    }
  }

  &.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const WalletStatus = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatusItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StatusLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const StatusValue = styled.span`
  color: #fff;
  font-weight: 500;
  font-family: monospace;
`;

const ErrorMessage = styled.div`
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 8px;
  padding: 1rem;
  color: #ff6b6b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  padding: 1rem;
  color: #4CAF50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const NFTMintingModal = ({ isOpen, onClose, onSuccess }) => {
  const { isConnected, account, provider, signer } = useWallet();
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    category: '',
    grade: '',
    credits: '',
    description: ''
  });
  const [isMinting, setIsMinting] = useState(false);
  const [mintStep, setMintStep] = useState('form'); // form, minting, success, error
  const [error, setError] = useState('');
  const [transactionHash, setTransactionHash] = useState('');

  const categories = [
    'Programming',
    'Design',
    'Business',
    'Language',
    'Science',
    'Arts',
    'Academic',
    'Professional',
    'Other'
  ];

  const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateVerificationCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `EDU-${timestamp}-${random}`;
  };

  const calculatePoints = (grade, credits) => {
    const gradePoints = {
      'A+': 4.0, 'A': 3.7, 'A-': 3.3,
      'B+': 3.0, 'B': 2.7, 'B-': 2.3,
      'C+': 2.0, 'C': 1.7, 'C-': 1.3,
      'D': 1.0, 'F': 0.0
    };
    return Math.round((gradePoints[grade] || 0) * (parseInt(credits) || 0) * 25);
  };

  const createMetadata = () => {
    const verificationCode = generateVerificationCode();
    const points = calculatePoints(formData.grade, formData.credits);
    
    return {
      name: formData.name,
      description: formData.description || `Certificate for ${formData.name}`,
      image: "https://via.placeholder.com/400x400/667eea/ffffff?text=Certificate+NFT",
      attributes: [
        {
          trait_type: "Category",
          value: formData.category
        },
        {
          trait_type: "Issuer",
          value: formData.issuer
        },
        {
          trait_type: "Issue Date",
          value: formData.issueDate
        },
        {
          trait_type: "Grade",
          value: formData.grade
        },
        {
          trait_type: "Credits",
          value: parseInt(formData.credits) || 0
        },
        {
          trait_type: "Points",
          value: points
        },
        {
          trait_type: "Verification Code",
          value: verificationCode
        }
      ]
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Vui lòng kết nối ví trước!');
      return;
    }

    // Validation
    if (!formData.name || !formData.issuer || !formData.issueDate || !formData.category || !formData.grade || !formData.credits) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    setIsMinting(true);
    setMintStep('minting');
    setError('');

    try {
      // Step 1: Create metadata
      const metadata = createMetadata();
      console.log('Metadata created:', metadata);

      // Step 2: Upload metadata to IPFS (mock for now)
      const metadataURI = `https://api.eduwallet.com/metadata/${Date.now()}`;
      console.log('Metadata URI:', metadataURI);

      // Step 3: Call smart contract to mint NFT
      // This is a mock implementation - in real app, you'd call the actual contract
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate blockchain call
      
      const mockTransactionHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      setTransactionHash(mockTransactionHash);

      // Step 4: Success
      setMintStep('success');
      toast.success('Certificate NFT đã được tạo thành công!');
      
      if (onSuccess) {
        onSuccess({
          tokenId: Math.floor(Math.random() * 10000) + 1,
          transactionHash: mockTransactionHash,
          metadata: metadata
        });
      }

    } catch (error) {
      console.error('Error minting NFT:', error);
      setError(error.message || 'Có lỗi xảy ra khi tạo NFT');
      setMintStep('error');
      toast.error('Có lỗi xảy ra khi tạo NFT');
    } finally {
      setIsMinting(false);
    }
  };

  const handleClose = () => {
    if (!isMinting) {
      setFormData({
        name: '',
        issuer: '',
        issueDate: '',
        category: '',
        grade: '',
        credits: '',
        description: ''
      });
      setMintStep('form');
      setError('');
      setTransactionHash('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <ModalContent
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader>
            <ModalTitle>
              <FaCertificate />
              Tạo Certificate NFT
            </ModalTitle>
            <CloseButton onClick={handleClose} disabled={isMinting}>
              <FaTimes />
            </CloseButton>
          </ModalHeader>

          {!isConnected && (
            <ErrorMessage>
              <FaExclamationTriangle />
              Vui lòng kết nối ví MetaMask để tạo NFT
            </ErrorMessage>
          )}

          {isConnected && (
            <WalletStatus>
              <StatusItem>
                <StatusLabel>Địa chỉ ví:</StatusLabel>
                <StatusValue>{account}</StatusValue>
              </StatusItem>
              <StatusItem>
                <StatusLabel>Network:</StatusLabel>
                <StatusValue>PioneZero (5080)</StatusValue>
              </StatusItem>
              <StatusItem>
                <StatusLabel>Trạng thái:</StatusLabel>
                <StatusValue style={{ color: '#4CAF50' }}>Đã kết nối</StatusValue>
              </StatusItem>
            </WalletStatus>
          )}

          {mintStep === 'form' && (
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Tên chứng chỉ *</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: React Development Certificate"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Người/tổ chức cấp *</Label>
                <Input
                  type="text"
                  name="issuer"
                  value={formData.issuer}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: EduWallet University"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Ngày cấp *</Label>
                <Input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Danh mục *</Label>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Điểm/Đánh giá *</Label>
                <Select
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn điểm</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Số tín chỉ *</Label>
                <Input
                  type="number"
                  name="credits"
                  value={formData.credits}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 3"
                  min="1"
                  max="10"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Mô tả (tùy chọn)</Label>
                <TextArea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả chi tiết về chứng chỉ..."
                />
              </FormGroup>

              <ButtonGroup>
                <Button type="button" className="secondary" onClick={handleClose}>
                  Hủy
                </Button>
                <Button type="submit" className="primary" disabled={!isConnected}>
                  <FaCertificate />
                  Tạo Certificate NFT
                </Button>
              </ButtonGroup>
            </Form>
          )}

          {mintStep === 'minting' && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <FaSpinner style={{ fontSize: '3rem', color: '#667eea', animation: 'spin 1s linear infinite' }} />
              <h3 style={{ color: '#fff', marginTop: '1rem' }}>Đang tạo Certificate NFT...</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
                Vui lòng chờ trong khi chúng tôi xử lý giao dịch trên blockchain
              </p>
            </div>
          )}

          {mintStep === 'success' && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <FaCheck style={{ fontSize: '3rem', color: '#4CAF50' }} />
              <h3 style={{ color: '#fff', marginTop: '1rem' }}>Tạo NFT thành công!</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
                Certificate NFT đã được tạo và lưu trữ trên blockchain
              </p>
              {transactionHash && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Transaction Hash:</p>
                  <p style={{ color: '#fff', fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                    {transactionHash}
                  </p>
                </div>
              )}
              <Button className="primary" onClick={handleClose} style={{ marginTop: '1rem' }}>
                Đóng
              </Button>
            </div>
          )}

          {mintStep === 'error' && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <FaExclamationTriangle style={{ fontSize: '3rem', color: '#ff6b6b' }} />
              <h3 style={{ color: '#fff', marginTop: '1rem' }}>Có lỗi xảy ra</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
                {error}
              </p>
              <ButtonGroup style={{ marginTop: '1rem' }}>
                <Button className="secondary" onClick={() => setMintStep('form')}>
                  Thử lại
                </Button>
                <Button className="primary" onClick={handleClose}>
                  Đóng
                </Button>
              </ButtonGroup>
            </div>
          )}
        </ModalContent>
      </ModalOverlay>
    </AnimatePresence>
  );
};

export default NFTMintingModal;
