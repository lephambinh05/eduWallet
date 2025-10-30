import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaGraduationCap,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
  FaClock,
  FaCheckCircle,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useWallet } from "../../context/WalletContext";
import { getCurrentUser } from "../../utils/userUtils";
// import learnPassData from '../../data/learnPassData.json'; // Removed mock data
import toast from "react-hot-toast";

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
  max-width: 700px;
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

const LearnPassGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const LearnPassCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid ${(props) => (props.selected ? "#667eea" : "transparent")};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
  }

  &.completed {
    border-color: #4caf50;
  }

  &.in-progress {
    border-color: #ffc107;
  }

  &.not-started {
    border-color: #ff6b6b;
    opacity: 0.6;
  }
`;

const LearnPassHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const LearnPassIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
`;

const LearnPassInfo = styled.div`
  flex: 1;
`;

const LearnPassName = styled.h3`
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const LearnPassLevel = styled.span`
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin: 1rem 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  width: ${(props) => props.progress}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
`;

const SkillTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const SkillTag = styled.span`
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
`;

const StatusBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;

  &.completed {
    background: rgba(76, 175, 80, 0.2);
    color: #4caf50;
  }

  &.in-progress {
    background: rgba(255, 193, 7, 0.2);
    color: #ffc107;
  }

  &.not-started {
    background: rgba(255, 107, 107, 0.2);
    color: #ff6b6b;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
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
  color: #4caf50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const LearnPassNFTModal = ({ isOpen, onClose, onSuccess }) => {
  const { isConnected, account } = useWallet();
  const [learnPasses, setLearnPasses] = useState([]);
  const [selectedLearnPass, setSelectedLearnPass] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintStep, setMintStep] = useState("select"); // select, minting, success, error
  const [error, setError] = useState("");
  const [transactionHash, setTransactionHash] = useState("");

  // Load LearnPass data
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.email === "lephambinh05@gmail.com") {
      // Load real data for specific user
      // Removed mock data usage - load from API instead
      setLearnPasses([]);
    } else {
      // Mock data for other users
      const mockLearnPasses = [
        {
          id: "lp001",
          name: "Blockchain Fundamentals",
          description: "Learn the basics of blockchain technology",
          level: "Beginner",
          progress: 100,
          modulesCompleted: 10,
          totalModules: 10,
          deadline: "2024-12-31",
          status: "Completed",
          skills: ["Blockchain", "Cryptocurrency", "Smart Contracts"],
          isActive: true,
        },
        {
          id: "lp002",
          name: "React Development",
          description: "Master React.js for modern web development",
          level: "Intermediate",
          progress: 75,
          modulesCompleted: 15,
          totalModules: 20,
          deadline: "2024-12-31",
          status: "In Progress",
          skills: ["React", "JavaScript", "Frontend"],
          isActive: true,
        },
      ];
      setLearnPasses(mockLearnPasses);
    }
  }, []);

  const canMintLearnPass = (learnPass) => {
    return learnPass.status === "Completed" && learnPass.progress === 100;
  };

  const createLearnPassMetadata = (learnPass) => {
    return {
      name: `LearnPass NFT - ${learnPass.name}`,
      description: learnPass.description,
      attributes: [
        {
          trait_type: "Course Name",
          value: learnPass.name,
        },
        {
          trait_type: "Level",
          value: learnPass.level,
        },
        {
          trait_type: "Progress",
          value: `${learnPass.progress}%`,
        },
        {
          trait_type: "Modules Completed",
          value: `${learnPass.modulesCompleted}/${learnPass.totalModules}`,
        },
        {
          trait_type: "Status",
          value: learnPass.status,
        },
        {
          trait_type: "Skills",
          value: learnPass.skillTags.join(", "),
        },
        {
          trait_type: "Completion Date",
          value: new Date().toLocaleDateString("vi-VN"),
        },
        {
          trait_type: "Student Wallet",
          value: account,
        },
      ],
    };
  };

  const handleMintLearnPass = async (learnPass) => {
    if (!isConnected) {
      toast.error("Vui lòng kết nối ví trước!");
      return;
    }

    if (!canMintLearnPass(learnPass)) {
      toast.error("Chỉ có thể mint LearnPass đã hoàn thành!");
      return;
    }

    setSelectedLearnPass(learnPass);
    setIsMinting(true);
    setMintStep("minting");
    setError("");

    try {
      // Step 1: Create metadata
      const metadata = createLearnPassMetadata(learnPass);
      console.log("LearnPass metadata created:", metadata);

      // Step 2: Upload metadata to IPFS (mock for now)
      const metadataURI = `https://api.eduwallet.com/learnpass-metadata/${learnPass.id}`;
      console.log("Metadata URI:", metadataURI);

      // Step 3: Call smart contract to mint LearnPass NFT
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate blockchain call

      const mockTransactionHash = `0x${Math.random()
        .toString(16)
        .substring(2, 66)}`;
      setTransactionHash(mockTransactionHash);

      // Step 4: Success
      setMintStep("success");
      toast.success("LearnPass NFT đã được tạo thành công!");

      if (onSuccess) {
        onSuccess({
          tokenId: Math.floor(Math.random() * 10000) + 1,
          transactionHash: mockTransactionHash,
          metadata: metadata,
          learnPass: learnPass,
        });
      }
    } catch (error) {
      console.error("Error minting LearnPass NFT:", error);
      setError(error.message || "Có lỗi xảy ra khi tạo LearnPass NFT");
      setMintStep("error");
      toast.error("Có lỗi xảy ra khi tạo LearnPass NFT");
    } finally {
      setIsMinting(false);
    }
  };

  const handleClose = () => {
    if (!isMinting) {
      setSelectedLearnPass(null);
      setMintStep("select");
      setError("");
      setTransactionHash("");
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
              <FaGraduationCap />
              Tạo LearnPass NFT
            </ModalTitle>
            <CloseButton onClick={handleClose} disabled={isMinting}>
              <FaTimes />
            </CloseButton>
          </ModalHeader>

          {!isConnected && (
            <ErrorMessage>
              <FaExclamationTriangle />
              Vui lòng kết nối ví MetaMask để tạo LearnPass NFT
            </ErrorMessage>
          )}

          {mintStep === "select" && (
            <>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ color: "#fff", marginBottom: "1rem" }}>
                  Chọn LearnPass để tạo NFT
                </h3>
                <p
                  style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}
                >
                  Chỉ có thể tạo NFT cho các LearnPass đã hoàn thành 100%
                </p>
              </div>

              <LearnPassGrid>
                {learnPasses.map((learnPass) => (
                  <LearnPassCard
                    key={learnPass.id}
                    className={learnPass.status.toLowerCase().replace(" ", "-")}
                    onClick={() =>
                      canMintLearnPass(learnPass) &&
                      handleMintLearnPass(learnPass)
                    }
                    style={{
                      cursor: canMintLearnPass(learnPass)
                        ? "pointer"
                        : "not-allowed",
                    }}
                  >
                    <StatusBadge
                      className={learnPass.status
                        .toLowerCase()
                        .replace(" ", "-")}
                    >
                      {learnPass.status === "Completed" && <FaCheckCircle />}
                      {learnPass.status === "In Progress" && <FaClock />}
                      {learnPass.status === "Not Started" && (
                        <FaExclamationTriangle />
                      )}
                      {learnPass.status}
                    </StatusBadge>

                    <LearnPassHeader>
                      <LearnPassIcon>
                        <FaGraduationCap />
                      </LearnPassIcon>
                      <LearnPassInfo>
                        <LearnPassName>{learnPass.name}</LearnPassName>
                        <LearnPassLevel>{learnPass.level}</LearnPassLevel>
                      </LearnPassInfo>
                    </LearnPassHeader>

                    <ProgressText>
                      <span>Tiến độ</span>
                      <span>{learnPass.progress}%</span>
                    </ProgressText>
                    <ProgressBar>
                      <ProgressFill progress={learnPass.progress} />
                    </ProgressBar>

                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "rgba(255,255,255,0.7)",
                        marginBottom: "1rem",
                      }}
                    >
                      {learnPass.modulesCompleted}/{learnPass.totalModules}{" "}
                      modules hoàn thành
                    </div>

                    {learnPass.issuer && (
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.6)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <strong>Issuer:</strong> {learnPass.issuer}
                      </div>
                    )}

                    {learnPass.issueDate && (
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.6)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <strong>Issue Date:</strong>{" "}
                        {new Date(learnPass.issueDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </div>
                    )}

                    {learnPass.score && (
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.6)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <strong>Score:</strong> {learnPass.score}%
                      </div>
                    )}

                    {learnPass.verificationUrl && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <a
                          href={learnPass.verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#667eea",
                            textDecoration: "none",
                            fontSize: "0.8rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                        >
                          <FaExternalLinkAlt />
                          Verify Certificate
                        </a>
                      </div>
                    )}

                    <SkillTags>
                      {learnPass.skills.map((skill, index) => (
                        <SkillTag key={index}>{skill}</SkillTag>
                      ))}
                    </SkillTags>

                    {!canMintLearnPass(learnPass) && (
                      <div
                        style={{
                          color: "#ff6b6b",
                          fontSize: "0.9rem",
                          textAlign: "center",
                          padding: "0.5rem",
                          background: "rgba(255, 107, 107, 0.1)",
                          borderRadius: "4px",
                        }}
                      >
                        {learnPass.status === "In Progress"
                          ? "Chưa hoàn thành"
                          : "Chưa bắt đầu"}
                      </div>
                    )}
                  </LearnPassCard>
                ))}
              </LearnPassGrid>

              <ButtonGroup>
                <Button className="secondary" onClick={handleClose}>
                  Đóng
                </Button>
              </ButtonGroup>
            </>
          )}

          {mintStep === "minting" && (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <FaSpinner
                style={{
                  fontSize: "3rem",
                  color: "#667eea",
                  animation: "spin 1s linear infinite",
                }}
              />
              <h3 style={{ color: "#fff", marginTop: "1rem" }}>
                Đang tạo LearnPass NFT...
              </h3>
              <p
                style={{ color: "rgba(255,255,255,0.7)", marginTop: "0.5rem" }}
              >
                Vui lòng chờ trong khi chúng tôi xử lý giao dịch trên blockchain
              </p>
              {selectedLearnPass && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "8px",
                  }}
                >
                  <p style={{ color: "#fff", fontWeight: "600" }}>
                    {selectedLearnPass.name}
                  </p>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "0.9rem",
                    }}
                  >
                    {selectedLearnPass.level}
                  </p>
                </div>
              )}
            </div>
          )}

          {mintStep === "success" && (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <FaCheck style={{ fontSize: "3rem", color: "#4CAF50" }} />
              <h3 style={{ color: "#fff", marginTop: "1rem" }}>
                Tạo LearnPass NFT thành công!
              </h3>
              <p
                style={{ color: "rgba(255,255,255,0.7)", marginTop: "0.5rem" }}
              >
                LearnPass NFT đã được tạo và lưu trữ trên blockchain
              </p>
              {selectedLearnPass && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "8px",
                  }}
                >
                  <p style={{ color: "#fff", fontWeight: "600" }}>
                    {selectedLearnPass.name}
                  </p>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "0.9rem",
                    }}
                  >
                    {selectedLearnPass.level}
                  </p>
                </div>
              )}
              {transactionHash && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "0.9rem",
                    }}
                  >
                    Transaction Hash:
                  </p>
                  <p
                    style={{
                      color: "#fff",
                      fontFamily: "monospace",
                      fontSize: "0.8rem",
                      wordBreak: "break-all",
                    }}
                  >
                    {transactionHash}
                  </p>
                </div>
              )}
              <Button
                className="primary"
                onClick={handleClose}
                style={{ marginTop: "1rem" }}
              >
                Đóng
              </Button>
            </div>
          )}

          {mintStep === "error" && (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <FaExclamationTriangle
                style={{ fontSize: "3rem", color: "#ff6b6b" }}
              />
              <h3 style={{ color: "#fff", marginTop: "1rem" }}>
                Có lỗi xảy ra
              </h3>
              <p
                style={{ color: "rgba(255,255,255,0.7)", marginTop: "0.5rem" }}
              >
                {error}
              </p>
              <ButtonGroup style={{ marginTop: "1rem" }}>
                <Button
                  className="secondary"
                  onClick={() => setMintStep("select")}
                >
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

export default LearnPassNFTModal;
