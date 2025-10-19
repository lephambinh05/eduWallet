import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useWallet } from '../context/WalletContext';
import { getCurrentUser } from '../utils/userUtils';
import { FaGraduationCap, FaUser, FaCertificate, FaTrophy, FaCoins, FaWallet, FaPlus, FaCheck, FaCode, FaProjectDiagram } from 'react-icons/fa';
import toast from 'react-hot-toast';
import portfolioContractService from '../services/portfolioContractService';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 0;
`;

const Section = styled.section`
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #667eea;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Card = styled.div`
  background: rgba(255,255,255,0.07);
  border-radius: 14px;
  padding: 1.5rem;
  color: #fff;
  box-shadow: 0 2px 12px rgba(102,126,234,0.08);
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(102,126,234,0.15);
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const InfoIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.7;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-weight: 600;
  color: #fff;
`;

const NFTPreview = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  color: white;
  margin-bottom: 1.5rem;
`;

const NFTIcon = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  margin: 0 auto 1rem;
  backdrop-filter: blur(10px);
`;

const CreateButton = styled.button`
  background: linear-gradient(90deg, #a259ff, #3772ff);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(162, 89, 255, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const CreateNFT = () => {
  const { isConnected, account, provider, signer } = useWallet();
  const [currentUser, setCurrentUser] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [nftCreated, setNftCreated] = useState(false);
  const [isCreatingPortfolio, setIsCreatingPortfolio] = useState(false);
  const [portfolioCreated, setPortfolioCreated] = useState(false);
  
  // Portfolio form states
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioDescription, setPortfolioDescription] = useState('');
  const [portfolioSkills, setPortfolioSkills] = useState('');
  const [portfolioProjectHash, setPortfolioProjectHash] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Tạo Portfolio NFT
  const createPortfolioNFT = async () => {
    if (!isConnected || !account) {
      toast.error('Vui lòng kết nối ví trước!');
      return;
    }

    if (!portfolioTitle || !portfolioDescription || !portfolioSkills) {
      toast.error('Vui lòng điền đầy đủ thông tin Portfolio!');
      return;
    }

    setIsCreatingPortfolio(true);

    try {
      // Kết nối với contract
      const connected = await portfolioContractService.connectWallet();
      if (!connected) {
        toast.error('Không thể kết nối với smart contract!');
        return;
      }

      // Chuẩn bị dữ liệu
      const skillsArray = portfolioSkills.split(',').map(skill => skill.trim()).filter(skill => skill);
      const projectHash = portfolioProjectHash || `0x${Date.now().toString(16)}`;

      const portfolioData = {
        title: portfolioTitle,
        description: portfolioDescription,
        projectHash: projectHash,
        skills: skillsArray
      };

      // Gọi smart contract
      const result = await portfolioContractService.createPortfolioNFT(portfolioData);

      if (result.success) {
        toast.success('✅ Tạo Portfolio NFT thành công!');
        setPortfolioCreated(true);
        
        // Reset form
        setPortfolioTitle('');
        setPortfolioDescription('');
        setPortfolioSkills('');
        setPortfolioProjectHash('');
        
        console.log('Portfolio NFT created:', result);
      } else {
        toast.error('❌ Lỗi: ' + result.error);
      }

    } catch (error) {
      console.error('Error creating Portfolio NFT:', error);
      toast.error('Có lỗi xảy ra khi tạo Portfolio NFT: ' + error.message);
    } finally {
      setIsCreatingPortfolio(false);
    }
  };

  const createLearnPassNFT = async () => {
    if (!isConnected || !account) {
      toast.error('Vui lòng kết nối ví trước!');
      return;
    }

    if (!currentUser) {
      toast.error('Không tìm thấy thông tin người dùng!');
      return;
    }

    setIsCreating(true);

    try {
      // Tạo metadata cho NFT
      const metadata = {
        name: `LearnPass NFT - ${currentUser.firstName} ${currentUser.lastName}`,
        description: `Học bạ số của sinh viên ${currentUser.firstName} ${currentUser.lastName}`,
        image: "https://via.placeholder.com/400x400/667eea/ffffff?text=LearnPass+NFT",
        attributes: [
          {
            trait_type: "Tên sinh viên",
            value: `${currentUser.firstName} ${currentUser.lastName}`
          },
          {
            trait_type: "Email",
            value: currentUser.email
          },
          {
            trait_type: "Mã sinh viên",
            value: currentUser.studentId || "Chưa có"
          },
          {
            trait_type: "Ngày sinh",
            value: currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth).toLocaleDateString('vi-VN') : "Chưa cập nhật"
          },
          {
            trait_type: "Số điện thoại",
            value: currentUser.phone || "Chưa cập nhật"
          },
          {
            trait_type: "Vai trò",
            value: currentUser.role || "student"
          },
          {
            trait_type: "Trạng thái tài khoản",
            value: currentUser.isActive ? "Hoạt động" : "Không hoạt động"
          },
          {
            trait_type: "Xác thực email",
            value: currentUser.isEmailVerified ? "Đã xác thực" : "Chưa xác thực"
          },
          {
            trait_type: "Ngày tạo NFT",
            value: new Date().toLocaleDateString('vi-VN')
          },
          {
            trait_type: "Địa chỉ ví",
            value: account
          }
        ]
      };

      // Lưu metadata vào IPFS hoặc server (ở đây dùng mock)
      const metadataURI = `https://api.eduwallet.com/metadata/${Date.now()}`;
      
      // Gọi smart contract để mint NFT
      // Đây là mock function, trong thực tế sẽ gọi contract
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate blockchain call
      
      toast.success('Tạo LearnPass NFT thành công!');
      setNftCreated(true);
      
      // Cập nhật thông tin user với tokenId mới
      const newTokenId = Math.floor(Math.random() * 10000) + 1;
      console.log(`NFT created with Token ID: ${newTokenId}`);
      console.log('Metadata:', metadata);

    } catch (error) {
      console.error('Error creating NFT:', error);
      toast.error('Có lỗi xảy ra khi tạo NFT: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (!currentUser) {
    return (
      <Container>
        <div style={{ textAlign: 'center', color: 'white', padding: '2rem' }}>
          Đang tải thông tin...
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Section>
        <SectionTitle>
          <FaUser /> Thông tin sinh viên
        </SectionTitle>
        
        <InfoGrid>
          <InfoItem>
            <InfoIcon><FaUser /></InfoIcon>
            <InfoContent>
              <InfoLabel>Họ và tên</InfoLabel>
              <InfoValue>{currentUser.firstName} {currentUser.lastName}</InfoValue>
            </InfoContent>
          </InfoItem>

          <InfoItem>
            <InfoIcon><FaUser /></InfoIcon>
            <InfoContent>
              <InfoLabel>Email</InfoLabel>
              <InfoValue>{currentUser.email}</InfoValue>
            </InfoContent>
          </InfoItem>

          <InfoItem>
            <InfoIcon><FaGraduationCap /></InfoIcon>
            <InfoContent>
              <InfoLabel>Mã sinh viên</InfoLabel>
              <InfoValue>{currentUser.studentId || "Chưa có"}</InfoValue>
            </InfoContent>
          </InfoItem>

          <InfoItem>
            <InfoIcon><FaUser /></InfoIcon>
            <InfoContent>
              <InfoLabel>Ngày sinh</InfoLabel>
              <InfoValue>
                {currentUser.dateOfBirth ? 
                  new Date(currentUser.dateOfBirth).toLocaleDateString('vi-VN') : 
                  "Chưa cập nhật"
                }
              </InfoValue>
            </InfoContent>
          </InfoItem>

          <InfoItem>
            <InfoIcon><FaUser /></InfoIcon>
            <InfoContent>
              <InfoLabel>Số điện thoại</InfoLabel>
              <InfoValue>{currentUser.phone || "Chưa cập nhật"}</InfoValue>
            </InfoContent>
          </InfoItem>

          <InfoItem>
            <InfoIcon><FaTrophy /></InfoIcon>
            <InfoContent>
              <InfoLabel>Vai trò</InfoLabel>
              <InfoValue>{currentUser.role || "student"}</InfoValue>
            </InfoContent>
          </InfoItem>

          <InfoItem>
            <InfoIcon><FaCheck /></InfoIcon>
            <InfoContent>
              <InfoLabel>Trạng thái tài khoản</InfoLabel>
              <InfoValue style={{ color: currentUser.isActive ? '#4CAF50' : '#ff6b6b' }}>
                {currentUser.isActive ? "Hoạt động" : "Không hoạt động"}
              </InfoValue>
            </InfoContent>
          </InfoItem>

          <InfoItem>
            <InfoIcon><FaCheck /></InfoIcon>
            <InfoContent>
              <InfoLabel>Xác thực email</InfoLabel>
              <InfoValue style={{ color: currentUser.isEmailVerified ? '#4CAF50' : '#ff6b6b' }}>
                {currentUser.isEmailVerified ? "Đã xác thực" : "Chưa xác thực"}
              </InfoValue>
            </InfoContent>
          </InfoItem>

          {isConnected && (
            <InfoItem>
              <InfoIcon><FaWallet /></InfoIcon>
              <InfoContent>
                <InfoLabel>Địa chỉ ví</InfoLabel>
                <InfoValue style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  {account}
                </InfoValue>
              </InfoContent>
            </InfoItem>
          )}
        </InfoGrid>
      </Section>

      <Section>
        <SectionTitle>
          <FaGraduationCap /> Tạo LearnPass NFT
        </SectionTitle>
        
        <Card>
          <NFTPreview>
            <NFTIcon>
              <FaGraduationCap />
            </NFTIcon>
            <h3>LearnPass NFT</h3>
            <p>Học bạ số của {currentUser.firstName} {currentUser.lastName}</p>
            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
              NFT này sẽ chứa tất cả thông tin học tập và thành tích của bạn
            </p>
          </NFTPreview>

          {!isConnected ? (
            <div style={{ textAlign: 'center', color: '#ff6b6b', marginBottom: '1rem' }}>
              ⚠️ Vui lòng kết nối ví để tạo NFT
            </div>
          ) : nftCreated ? (
            <div style={{ textAlign: 'center', color: '#4CAF50', marginBottom: '1rem' }}>
              ✅ NFT đã được tạo thành công!
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <CreateButton 
                onClick={createLearnPassNFT} 
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <LoadingSpinner />
                    Đang tạo NFT...
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Tạo LearnPass NFT
                  </>
                )}
              </CreateButton>
            </div>
          )}
        </Card>
      </Section>

      <Section>
        <SectionTitle>
          <FaProjectDiagram /> Tạo Portfolio NFT
        </SectionTitle>
        
        <Card>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>Thông tin Portfolio</h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff' }}>
                  Tiêu đề dự án *
                </label>
                <input
                  type="text"
                  value={portfolioTitle}
                  onChange={(e) => setPortfolioTitle(e.target.value)}
                  placeholder="Ví dụ: EduWallet DApp"
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff' }}>
                  Mô tả dự án *
                </label>
                <textarea
                  value={portfolioDescription}
                  onChange={(e) => setPortfolioDescription(e.target.value)}
                  placeholder="Mô tả chi tiết về dự án của bạn..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff' }}>
                  Kỹ năng sử dụng * (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={portfolioSkills}
                  onChange={(e) => setPortfolioSkills(e.target.value)}
                  placeholder="Ví dụ: React, Node.js, Solidity, MongoDB"
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff' }}>
                  Project Hash (tùy chọn)
                </label>
                <input
                  type="text"
                  value={portfolioProjectHash}
                  onChange={(e) => setPortfolioProjectHash(e.target.value)}
                  placeholder="Hash của dự án hoặc để trống để tự động tạo"
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>
          </div>

          <NFTPreview style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)' }}>
            <NFTIcon>
              <FaProjectDiagram />
            </NFTIcon>
            <h3>Portfolio NFT</h3>
            <p>Dự án của {currentUser.firstName} {currentUser.lastName}</p>
            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
              NFT này sẽ chứa thông tin dự án và kỹ năng của bạn
            </p>
          </NFTPreview>

          {!isConnected ? (
            <div style={{ textAlign: 'center', color: '#ff6b6b', marginBottom: '1rem' }}>
              ⚠️ Vui lòng kết nối ví để tạo Portfolio NFT
            </div>
          ) : portfolioCreated ? (
            <div style={{ textAlign: 'center', color: '#4CAF50', marginBottom: '1rem' }}>
              ✅ Portfolio NFT đã được tạo thành công!
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <CreateButton 
                onClick={createPortfolioNFT} 
                disabled={isCreatingPortfolio}
                style={{ background: 'linear-gradient(90deg, #ff6b6b, #ee5a24)' }}
              >
                {isCreatingPortfolio ? (
                  <>
                    <LoadingSpinner />
                    Đang tạo Portfolio NFT...
                  </>
                ) : (
                  <>
                    <FaCode />
                    Tạo Portfolio NFT
                  </>
                )}
              </CreateButton>
            </div>
          )}
        </Card>
      </Section>

      <Section>
        <SectionTitle>
          <FaCertificate /> Thông tin sẽ được lưu trong NFT
        </SectionTitle>
        
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Thông tin cá nhân</h4>
              <ul style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                <li>Họ và tên</li>
                <li>Email</li>
                <li>Mã sinh viên</li>
                <li>Ngày sinh</li>
                <li>Số điện thoại</li>
              </ul>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Thông tin tài khoản</h4>
              <ul style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                <li>Vai trò</li>
                <li>Trạng thái tài khoản</li>
                <li>Xác thực email</li>
                <li>Địa chỉ ví</li>
                <li>Ngày tạo NFT</li>
              </ul>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Tính năng NFT</h4>
              <ul style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                <li>Bảo mật cao</li>
                <li>Không thể giả mạo</li>
                <li>Lưu trữ vĩnh viễn</li>
                <li>Có thể chuyển nhượng</li>
                <li>Xác minh dễ dàng</li>
              </ul>
            </div>
          </div>
        </Card>
      </Section>
    </Container>
  );
};

export default CreateNFT;
