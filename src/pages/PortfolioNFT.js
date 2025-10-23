import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { FaPlus, FaEye, FaHistory, FaCog } from "react-icons/fa";
import PortfolioMintingModal from "../components/portfolio/PortfolioMintingModal";
import PortfolioViewer from "../components/portfolio/PortfolioViewer";
import PortfolioHistory from "../components/portfolio/PortfolioHistory";
import { useWallet } from "../context/WalletContext";
import { getCurrentUser } from "../utils/userUtils";
import toast from "react-hot-toast";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  color: #2d3748;
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #718096;
  font-size: 18px;
  margin-bottom: 30px;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  background: white;
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const Tab = styled.button`
  flex: 1;
  padding: 15px 20px;
  border: none;
  background: ${(props) =>
    props.$active
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : "transparent"};
  color: ${(props) => (props.$active ? "white" : "#4a5568")};
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: ${(props) =>
      props.$active
        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        : "#f7fafc"};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: ${(props) =>
    props.variant === "primary"
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : "white"};
  color: ${(props) => (props.variant === "primary" ? "white" : "#4a5568")};
  border: 2px solid
    ${(props) => (props.variant === "primary" ? "transparent" : "#e2e8f0")};
  border-radius: 16px;
  padding: 15px 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 180px;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    border-color: ${(props) =>
      props.variant === "primary" ? "transparent" : "#667eea"};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const InfoSection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const InfoTitle = styled.h2`
  color: #2d3748;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const InfoCard = styled.div`
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  border: 1px solid #e2e8f0;
`;

const InfoIcon = styled.div`
  font-size: 32px;
  color: #667eea;
  margin-bottom: 15px;
`;

const InfoCardTitle = styled.h3`
  color: #2d3748;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
`;

const InfoCardText = styled.p`
  color: #718096;
  font-size: 14px;
  line-height: 1.5;
`;

const WalletStatus = styled.div`
  background: ${(props) => (props.connected ? "#d4edda" : "#f8d7da")};
  color: ${(props) => (props.connected ? "#155724" : "#721c24")};
  border: 1px solid ${(props) => (props.connected ? "#c3e6cb" : "#f5c6cb")};
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
`;

const PortfolioNFT = () => {
  const { account, isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState("mint");
  const [showMintingModal, setShowMintingModal] = useState(false);
  React.useEffect(() => {
    // Initialize any required setup here
  }, []);

  const handleMintSuccess = (result) => {
    toast.success(
      `Portfolio NFT minted successfully! Token ID: ${result.tokenId}`
    );
    setShowMintingModal(false);
    // Optionally switch to viewer tab to show the new NFT
    setActiveTab("view");
  };

  const renderMintTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <InfoSection>
        <InfoTitle>Create Your Portfolio NFT</InfoTitle>
        <InfoGrid>
          <InfoCard>
            <InfoIcon>🔒</InfoIcon>
            <InfoCardTitle>Immutable Record</InfoCardTitle>
            <InfoCardText>
              Your academic achievements are permanently recorded on the
              blockchain, ensuring they cannot be altered or falsified.
            </InfoCardText>
          </InfoCard>
          <InfoCard>
            <InfoIcon>🌐</InfoIcon>
            <InfoCardTitle>Public Verification</InfoCardTitle>
            <InfoCardText>
              Third parties can easily verify your credentials without needing
              access to your personal accounts or documents.
            </InfoCardText>
          </InfoCard>
          <InfoCard>
            <InfoIcon>📈</InfoIcon>
            <InfoCardTitle>Dynamic Updates</InfoCardTitle>
            <InfoCardText>
              Your portfolio grows with you. Update your NFT as you complete new
              courses and earn new certifications.
            </InfoCardText>
          </InfoCard>
          <InfoCard>
            <InfoIcon>🏛️</InfoIcon>
            <InfoCardTitle>Institution Verified</InfoCardTitle>
            <InfoCardText>
              Get your portfolio verified by authorized institutions for
              enhanced credibility and trust.
            </InfoCardText>
          </InfoCard>
        </InfoGrid>
      </InfoSection>

      <ActionButtons>
        <ActionButton
          variant="primary"
          onClick={() => setShowMintingModal(true)}
          disabled={!isConnected}
        >
          <FaPlus />
          Mint Portfolio NFT
        </ActionButton>
      </ActionButtons>

      {!isConnected && (
        <WalletStatus connected={false}>
          ⚠️ Please connect your wallet to mint a Portfolio NFT
        </WalletStatus>
      )}

      {isConnected && (
        <WalletStatus connected={true}>
          ✅ Wallet connected: {account}
        </WalletStatus>
      )}
    </motion.div>
  );

  const renderViewTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <PortfolioViewer />
    </motion.div>
  );

  const renderHistoryTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <InfoSection>
        <InfoTitle>Lịch sử Portfolio NFT</InfoTitle>
        <InfoCardText>
          Theo dõi tất cả các thay đổi và cập nhật Portfolio NFT theo thời gian.
          Mỗi phiên bản được ghi lại vĩnh viễn trên blockchain.
        </InfoCardText>
      </InfoSection>

      <PortfolioHistory />
    </motion.div>
  );

  const renderSettingsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <InfoSection>
        <InfoTitle>Portfolio NFT Settings</InfoTitle>
        <InfoCardText>
          Manage your Portfolio NFT preferences, update verification settings,
          and configure privacy options.
        </InfoCardText>
      </InfoSection>

      <div style={{ textAlign: "center", padding: "40px", color: "#718096" }}>
        <FaCog style={{ fontSize: "48px", marginBottom: "20px" }} />
        <p>Settings panel coming soon...</p>
      </div>
    </motion.div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "mint":
        return renderMintTab();
      case "view":
        return renderViewTab();
      case "history":
        return renderHistoryTab();
      case "settings":
        return renderSettingsTab();
      default:
        return renderMintTab();
    }
  };

  return (
    <Container>
      <Header>
        <Title>Portfolio NFT</Title>
        <Subtitle>
          Transform your academic achievements into immutable blockchain records
        </Subtitle>
      </Header>

      <TabContainer>
        <Tab
          $active={activeTab === "mint"}
          onClick={() => setActiveTab("mint")}
        >
          <FaPlus />
          Mint NFT
        </Tab>
        <Tab
          $active={activeTab === "view"}
          onClick={() => setActiveTab("view")}
        >
          <FaEye />
          View Portfolio
        </Tab>
        <Tab
          $active={activeTab === "history"}
          onClick={() => setActiveTab("history")}
        >
          <FaHistory />
          History
        </Tab>
        <Tab
          $active={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
        >
          <FaCog />
          Settings
        </Tab>
      </TabContainer>

      {renderActiveTab()}

      {showMintingModal && (
        <PortfolioMintingModal
          isOpen={showMintingModal}
          onClose={() => setShowMintingModal(false)}
          onSuccess={handleMintSuccess}
        />
      )}
    </Container>
  );
};

export default PortfolioNFT;
