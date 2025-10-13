import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
// import demoData from '../data/demoData.json'; // Removed mock data
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { getCurrentUser } from '../utils/userUtils';
// import { setTestUser } from '../utils/setTestUser'; // Removed mock data
import toast from 'react-hot-toast';
import NFTMintingModal from '../components/blockchain/NFTMintingModal';
import LearnPassNFTModal from '../components/student/LearnPassNFTModal';
import WalletConnection from '../components/blockchain/WalletConnection';
import { 
  FaUser, 
  FaGraduationCap, 
  FaMedal, 
  FaStore, 
  FaCertificate,
  FaTrophy,
  FaCoins,
  FaWallet,
  FaCheckCircle,
  FaCopy
} from 'react-icons/fa';

const Container = styled.div`
  max-width: 1100px;
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

const CardRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
`;

const Card = styled.div`
  background: rgba(255,255,255,0.07);
  border-radius: 14px;
  padding: 1.5rem;
  min-width: 220px;
  flex: 1 1 220px;
  color: #fff;
  box-shadow: 0 2px 12px rgba(102,126,234,0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(102,126,234,0.15);
  }
`;

const Avatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
`;

const TokenBalance = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  color: white;
  margin-bottom: 1rem;
`;

const CertificateCard = styled(Card)`
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
  }
`;

const BadgeCard = styled(Card)`
  text-align: center;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
`;

const BadgeIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #333;
`;

const MarketplaceCard = styled(Card)`
  text-align: center;
`;

const MarketplaceIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  color: white;
`;

const Dashboard = () => {
  // Sample data
  const certificates = [];
  const badges = [];
  const marketplace = { 
    items: [
      {
        id: 1,
        name: "Voucher Starbucks 100k",
        description: "Voucher cà phê Starbucks trị giá 100.000 VNĐ",
        price: 20
      },
      {
        id: 2,
        name: "Voucher Shopee 200k",
        description: "Voucher mua sắm Shopee trị giá 200.000 VNĐ",
        price: 40
      },
      {
        id: 3,
        name: "Voucher Grab 150k",
        description: "Voucher giao hàng Grab trị giá 150.000 VNĐ",
        price: 30
      }
    ]
  };
  const { isConnected, account, getAccountBalance } = useWallet();
  const [userBalance] = useState(50);
  const [currentUser, setCurrentUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showLearnPassModal, setShowLearnPassModal] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Lấy số dư ví khi kết nối
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (isConnected && account && getAccountBalance) {
        setIsLoadingBalance(true);
        try {
          const balance = await getAccountBalance();
          setWalletBalance(balance);
        } catch (error) {
          console.error('Error fetching wallet balance:', error);
          setWalletBalance('0');
        } finally {
          setIsLoadingBalance(false);
        }
      } else {
        setWalletBalance('0');
      }
    };

    fetchWalletBalance();
  }, [isConnected, account, getAccountBalance]);

  const handleCertificateSuccess = (nftData) => {
    console.log('Certificate NFT created:', nftData);
    toast.success(`Certificate NFT #${nftData.tokenId} đã được tạo thành công!`);
    // Có thể cập nhật state hoặc refetch data ở đây
  };

  const handleLearnPassSuccess = (nftData) => {
    console.log('LearnPass NFT created:', nftData);
    toast.success(`LearnPass NFT #${nftData.tokenId} đã được tạo thành công!`);
    // Có thể cập nhật state hoặc refetch data ở đây
  };

  const handleSetTestUser = () => {
    // Removed setTestUser() - no more mock data
    toast.success('Đã set test user lephambinh05@gmail.com! Vui lòng refresh trang.');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (!currentUser) {
    return (
      <Container>
        <div style={{ textAlign: 'center', color: 'white', padding: '2rem' }}>
          Đang tải...
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Section>
        <SectionTitle>
          <FaUser /> Thông tin cá nhân
        </SectionTitle>
        <CardRow>
          <Card style={{ maxWidth: 300 }}>
            <Avatar>
              <FaUser />
            </Avatar>
            <div><b>{currentUser.name}</b></div>
            <div>{currentUser.email}</div>
            {isConnected ? (
              <div style={{ fontSize: '0.9rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaWallet /> {account?.slice(0, 6)}...{account?.slice(-4)}
              </div>
            ) : (
              <div style={{ fontSize: '0.9rem', color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaWallet /> Chưa kết nối ví
              </div>
            )}
            {currentUser.email !== 'lephambinh05@gmail.com' && (
              <button 
                className="btn btn-secondary"
                onClick={handleSetTestUser}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', marginTop: '0.5rem', width: '100%' }}
              >
                🧪 Set Test User
              </button>
            )}
            <Link to="/learnpass" className="btn btn-primary" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <FaGraduationCap /> Xem LearnPass
            </Link>
          </Card>
          
          {isConnected && (
            <>
              <Card style={{ maxWidth: 300 }}>
                <TokenBalance>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: 8, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <FaCoins /> Số dư EDU Token
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                    {userBalance} EDU
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    Có thể đổi lấy voucher, phần thưởng
                  </div>
                </TokenBalance>
                <Link to="/marketplace" className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <FaStore /> Đi đến Marketplace
                </Link>
              </Card>

              <Card style={{ maxWidth: 300 }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center',
                  color: 'white',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: 8, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <FaWallet /> Số dư ví
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                    {isLoadingBalance ? (
                      <div style={{ fontSize: '1rem' }}>Đang tải...</div>
                    ) : (
                      `${parseFloat(walletBalance).toFixed(4)} PIO`
                    )}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    Số dư native token
                  </div>
                </div>
                <Link to="/transfer" className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <FaWallet /> Chuyển tiền
                </Link>
              </Card>
            </>
          )}
        </CardRow>
      </Section>

      <Section>
        <SectionTitle>
          <FaWallet /> Kết nối ví
        </SectionTitle>
        <WalletConnection showDetails={true} />
      </Section>

      {isConnected && (
        <Section>
          <SectionTitle>
            <FaWallet /> Thông tin ví
          </SectionTitle>
          <CardRow>
            <Card style={{ maxWidth: 400 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <FaWallet />
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Địa chỉ ví</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8, fontFamily: 'monospace' }}>
                    {account}
                  </div>
                </div>
              </div>
              <div style={{ 
                background: 'rgba(255,255,255,0.05)', 
                borderRadius: '8px', 
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Số dư hiện tại:</span>
                  <span style={{ fontWeight: 'bold' }}>
                    {isLoadingBalance ? 'Đang tải...' : `${parseFloat(walletBalance).toFixed(4)} PIO`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Trạng thái:</span>
                  <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>Đã kết nối</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Network:</span>
                  <span style={{ fontWeight: 'bold' }}>Pione Zero</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                  onClick={() => {
                    navigator.clipboard.writeText(account);
                    toast.success('Đã sao chép địa chỉ ví!');
                  }}
                >
                  <FaCopy /> Sao chép địa chỉ
                </button>
                <Link to="/transfer" className="btn btn-primary" style={{ flex: 1, fontSize: '0.9rem' }}>
                  Chuyển tiền
                </Link>
              </div>
            </Card>
          </CardRow>
        </Section>
      )}

      {isConnected && (
        <Section>
          <SectionTitle>
            <FaGraduationCap /> Tạo NFT
          </SectionTitle>
          <CardRow>
            <Card style={{ maxWidth: 300, textAlign: 'center' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                margin: '0 auto 1rem'
              }}>
                <FaCertificate />
              </div>
              <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Certificate NFT</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Tạo NFT cho chứng chỉ học tập của bạn
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCertificateModal(true)}
                style={{ width: '100%' }}
              >
                <FaCertificate /> Tạo Certificate NFT
              </button>
            </Card>

            <Card style={{ maxWidth: 300, textAlign: 'center' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                margin: '0 auto 1rem'
              }}>
                <FaGraduationCap />
              </div>
              <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>LearnPass NFT</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Tạo NFT cho LearnPass đã hoàn thành
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowLearnPassModal(true)}
                style={{ width: '100%' }}
              >
                <FaGraduationCap /> Tạo LearnPass NFT
              </button>
            </Card>
          </CardRow>
        </Section>
      )}

      <Section>
        <StatsGrid>
          <StatCard>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
              {certificates.length}
            </div>
            <div>Chứng chỉ</div>
          </StatCard>
          <StatCard>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffd700' }}>
              {badges.length}
            </div>
            <div>Badges</div>
          </StatCard>
          <StatCard>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>
              {marketplace.items.length}
            </div>
            <div>Sản phẩm Marketplace</div>
          </StatCard>
        </StatsGrid>
      </Section>

      <Section>
        <SectionTitle>
          <FaCertificate /> Chứng chỉ gần đây
        </SectionTitle>
        <CardRow>
          {certificates.slice(0, 3).map((cert, index) => (
            <CertificateCard key={index}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <FaCertificate />
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{cert.title}</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{cert.issuer}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                {cert.description}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4CAF50' }}>
                <FaCheckCircle />
                <span style={{ fontSize: '0.9rem' }}>Đã xác minh</span>
              </div>
            </CertificateCard>
          ))}
        </CardRow>
      </Section>

      <Section>
        <SectionTitle>
          <FaMedal /> Badges thành tích
        </SectionTitle>
        <CardRow>
          {badges.slice(0, 4).map((badge, index) => (
            <BadgeCard key={index}>
              <BadgeIcon>
                <FaTrophy />
              </BadgeIcon>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{badge.name}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{badge.description}</div>
            </BadgeCard>
          ))}
        </CardRow>
      </Section>

      <Section>
        <SectionTitle>
          <FaStore /> Marketplace nổi bật
        </SectionTitle>
        <CardRow>
          {marketplace.items.slice(0, 3).map((item, index) => (
            <MarketplaceCard key={index}>
              <MarketplaceIcon>
                <FaStore />
              </MarketplaceIcon>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{item.name}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4CAF50', marginBottom: '0.5rem' }}>
                {item.price} EDU
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1rem' }}>
                {item.description}
              </div>
              <Link to="/marketplace" className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <FaStore /> Mua ngay
              </Link>
            </MarketplaceCard>
          ))}
        </CardRow>
      </Section>

      {/* NFT Modals */}
      <NFTMintingModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        onSuccess={handleCertificateSuccess}
      />

      <LearnPassNFTModal
        isOpen={showLearnPassModal}
        onClose={() => setShowLearnPassModal(false)}
        onSuccess={handleLearnPassSuccess}
      />
    </Container>
  );
};

export default Dashboard; 