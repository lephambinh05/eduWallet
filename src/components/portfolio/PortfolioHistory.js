import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../../utils/userUtils";
import { useWallet } from "../../context/WalletContext";
import portfolioNFTService from "../../services/portfolioNFTService";
import { BLOCKCHAIN_NETWORKS } from "../../config/blockchain";
import { ethers } from "ethers";
import styled from "styled-components";
import { motion } from "framer-motion";
import {
  FaHistory,
  FaSpinner,
  FaTimes,
  FaPlus,
  FaEdit,
  FaCertificate,
  FaMedal,
  FaGraduationCap,
  FaClock,
  FaUser,
  FaShieldAlt,
  FaCopy,
} from "react-icons/fa";
import toast from "react-hot-toast";
import logger from "../../utils/logger";

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
`;

const HistoryHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const HistoryTitle = styled.h2`
  color: #2d3748;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
`;

const HistorySubtitle = styled.p`
  color: #718096;
  font-size: 16px;
`;

const SearchSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(102, 126, 234, 0.35);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled(FaSpinner)`
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const StatusMessage = styled.div`
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;

  &.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  &.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }

  &.info {
    background: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
  }
`;

const TimelineContainer = styled.div`
  position: relative;
  padding-left: 30px;

  &::before {
    content: "";
    position: absolute;
    left: 15px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  }
`;

const TimelineItem = styled(motion.div)`
  position: relative;
  margin-bottom: 30px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-left: 4px solid
    ${(props) =>
      props.type === "mint"
        ? "#28a745"
        : props.type === "update"
        ? "#ffc107"
        : "#6c757d"};

  &::before {
    content: "";
    position: absolute;
    left: -37px;
    top: 20px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${(props) =>
      props.type === "mint"
        ? "#28a745"
        : props.type === "update"
        ? "#ffc107"
        : "#6c757d"};
    border: 3px solid white;
    box-shadow: 0 0 0 3px
      ${(props) =>
        props.type === "mint"
          ? "#28a745"
          : props.type === "update"
          ? "#ffc107"
          : "#6c757d"};
  }
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const TimelineTitle = styled.h3`
  color: #2d3748;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TimelineDate = styled.div`
  color: #718096;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const TimelineContent = styled.div`
  color: #4a5568;
  line-height: 1.6;
`;

const ChangeList = styled.div`
  margin-top: 15px;
`;

const ChangeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
`;

const ChangeIcon = styled.div`
  color: ${(props) =>
    props.type === "add"
      ? "#28a745"
      : props.type === "update"
      ? "#ffc107"
      : "#dc3545"};
  font-size: 12px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  border: 1px solid #e2e8f0;
`;

const StatNumber = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #718096;
  font-weight: 500;
`;

const PortfolioHistory = () => {
  const [tokenId, setTokenId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentNFTs, setCurrentNFTs] = useState([]);
  const [currentNFTsLoading, setCurrentNFTsLoading] = useState(false);
  const [currentNFTsError, setCurrentNFTsError] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("info");
  const { provider, signer } = useWallet();
  // getCurrentUser imported above

  useEffect(() => {
    if (tokenId) {
      loadPortfolioHistory(tokenId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenId]);

  // Load current NFTs on mount and when wallet/provider changes
  useEffect(() => {
    loadCurrentNFTs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, signer]);

  const loadPortfolioHistory = async (id) => {
    setIsLoading(true);
    setStatusMessage("🔍 Đang tải lịch sử portfolio...");
    setStatusType("info");

    try {
      // Attempt to load server-side portfolio changes (courses/certificates/badges)
      const user = getCurrentUser();
      let serverEntries = [];
      if (user && user.email) {
        try {
          const base =
            process.env.REACT_APP_API_BASE_URL ||
            process.env.REACT_APP_BACKEND_URL ||
            "http://127.0.0.1:3001";
          const res = await fetch(
            `${base}/api/portfolio/email/${encodeURIComponent(user.email)}`
          );
          const json = await res.json();
          if (json && json.success && json.data) {
            const { courses = [], certificates = [], badges = [] } = json.data;

            // Map courses/certificates/badges to history entries
            serverEntries = [
              ...courses.map((c) => ({
                type: "update",
                timestamp:
                  c.updatedAt || c.createdAt || new Date().toISOString(),
                transactionHash: null,
                changes: [
                  {
                    type: "add",
                    item: c.courseName || c.title || "Course",
                    category: "course",
                  },
                ],
                stats: { courses: 1, certificates: 0, badges: 0, gpa: 0 },
                userId: json.data.user?.id || user.id,
                userName:
                  `${json.data.user?.firstName || ""} ${
                    json.data.user?.lastName || ""
                  }`.trim() || null,
              })),
              ...certificates.map((c) => ({
                type: "update",
                timestamp:
                  c.updatedAt || c.createdAt || new Date().toISOString(),
                transactionHash: null,
                changes: [
                  {
                    type: "add",
                    item: c.title || c.name || "Certificate",
                    category: "certificate",
                  },
                ],
                stats: { courses: 0, certificates: 1, badges: 0, gpa: 0 },
                userId: json.data.user?.id || user.id,
                userName:
                  `${json.data.user?.firstName || ""} ${
                    json.data.user?.lastName || ""
                  }`.trim() || null,
              })),
              ...badges.map((b) => ({
                type: "update",
                timestamp:
                  b.updatedAt || b.createdAt || new Date().toISOString(),
                transactionHash: null,
                changes: [
                  {
                    type: "add",
                    item: b.name || b.title || "Badge",
                    category: "badge",
                  },
                ],
                stats: { courses: 0, certificates: 0, badges: 1, gpa: 0 },
                userId: json.data.user?.id || user.id,
                userName:
                  `${json.data.user?.firstName || ""} ${
                    json.data.user?.lastName || ""
                  }`.trim() || null,
              })),
            ];
          }
        } catch (err) {
          console.warn("Failed to load portfolio from API:", err.message);
        }
      }

      // We no longer rely on localStorage for mint history. Persisted transactions
      // on the backend (and on-chain queries) are used instead.

      // Also attempt to load persisted blockchain transactions for the user
      let persistedTxEntries = [];
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const base =
            process.env.REACT_APP_API_BASE_URL ||
            process.env.REACT_APP_BACKEND_URL ||
            "http://127.0.0.1:3001";
          const txRes = await fetch(`${base}/api/blockchain/transactions/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          });
          const txJson = await txRes.json();
          if (txJson && txJson.success && txJson.data && txJson.data.items) {
            persistedTxEntries = txJson.data.items.map((t) => ({
              type: "mint",
              timestamp: t.createdAt || t.updatedAt || new Date().toISOString(),
              transactionHash: t.txHash || t.txhash || null,
              changes: [
                {
                  type: "add",
                  item: `Token #${t.tokenId || "?"}`,
                  category: "verification",
                },
                {
                  type: "add",
                  item: `IPFS: ${t.ipfsHash || t.metadataURI || "n/a"}`,
                  category: "statistics",
                },
              ],
              stats: {
                courses: t.metadata?.totalCourses || 0,
                certificates: t.metadata?.totalCertificates || 0,
                badges: t.metadata?.totalBadges || 0,
                gpa: t.metadata?.gpa || 0,
              },
              userId: t.userId || (user && user.id) || null,
            }));
          }
        }
      } catch (e) {
        console.warn(
          "Failed to load persisted blockchain transactions:",
          e.message || e
        );
      }

      // Combine persisted blockchain txs and server entries. Sort by timestamp desc
      const combined = [...persistedTxEntries, ...serverEntries].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      if (combined.length === 0) {
        setHistory([]);
        setStatusMessage(
          "ℹ️ Chưa có lịch sử nào được tìm thấy. Hãy mint hoặc cập nhật portfolio để tạo lịch sử."
        );
        setStatusType("info");
      } else {
        // Map to UI timeline format
        const ui = combined.map((r, idx) => ({
          id: idx + 1,
          type: r.type,
          version: r.version || 1,
          timestamp: r.timestamp,
          transactionHash: r.transactionHash,
          changes: r.changes || [],
          stats: r.stats || { courses: 0, certificates: 0, badges: 0, gpa: 0 },
          userId: r.userId || null,
        }));

        setHistory(ui);
        setStatusMessage("✅ Đã tải lịch sử portfolio");
        setStatusType("success");
      }
    } catch (error) {
      console.error("Error loading portfolio history:", error);
      setStatusMessage(`❌ Lỗi: ${error.message}`);
      setStatusType("error");
    } finally {
      setIsLoading(false);
    }
  };

  // Load current NFTs owned by the user and include in UI
  const loadCurrentNFTs = async () => {
    setCurrentNFTsLoading(true);
    setCurrentNFTsError(null);
    try {
      const user = getCurrentUser();
      const ownerAddress =
        (user &&
          (user.walletAddress || user.address || user.walletInfo?.address)) ||
        null;

      if (!ownerAddress) {
        setCurrentNFTs([]);
        setCurrentNFTsLoading(false);
        return;
      }

      // Use connected provider if available; otherwise fall back to read-only RPC
      const rpc = BLOCKCHAIN_NETWORKS.pioneZero.rpcUrl;
      const readOnlyProvider = new ethers.providers.JsonRpcProvider(rpc);
      const providerToUse = provider || readOnlyProvider;

      // Initialize portfolioNFTService with provider (and signer if present)
      await portfolioNFTService.initialize(
        providerToUse,
        signer || providerToUse
      );
      // Fetch persisted tokenIds first to avoid querying summaries for tokens
      // we don't want to show. If backend returns persisted tokenIds, only
      // fetch summaries for those IDs. Otherwise fall back to querying all
      // on-chain tokens for the owner.
      let summaries = [];
      try {
        const token = localStorage.getItem("accessToken");
        const base =
          process.env.REACT_APP_API_BASE_URL ||
          process.env.REACT_APP_BACKEND_URL ||
          "http://127.0.0.1:3001";

        let persistedTokenIds = null;
        if (token) {
          try {
            const txRes = await fetch(
              `${base}/api/blockchain/transactions/me`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                },
              }
            );
            const txJson = await txRes.json();
            if (
              txJson &&
              txJson.success &&
              txJson.data &&
              Array.isArray(txJson.data.items)
            ) {
              persistedTokenIds = txJson.data.items
                .map((t) =>
                  t.tokenId !== undefined && t.tokenId !== null
                    ? String(t.tokenId)
                    : null
                )
                .filter(Boolean);
              logger.log(
                "portfolioHistory: persisted tokenIds from backend:",
                persistedTokenIds
              );
            }
          } catch (e) {
            console.warn(
              "Failed to fetch persisted txs for filtering:",
              e.message || e
            );
          }
        }

        if (Array.isArray(persistedTokenIds) && persistedTokenIds.length > 0) {
          // Only fetch summaries for the persisted tokenIds
          summaries = await Promise.all(
            persistedTokenIds.map(async (t) => {
              try {
                const s = await portfolioNFTService.getPortfolioSummary(t);
                return { tokenId: t.toString(), summary: s };
              } catch (e) {
                logger.warn(
                  "Failed to load summary for token",
                  t,
                  e.message || e
                );
                return { tokenId: t.toString(), summary: null };
              }
            })
          );
        } else {
          // No persisted token IDs -> fallback to listing all on-chain tokens
          const tokenIds = await portfolioNFTService.getAllOwnerTokens(
            ownerAddress
          );
          if (!tokenIds || tokenIds.length === 0) {
            setCurrentNFTs([]);
            setCurrentNFTsLoading(false);
            return;
          }

          summaries = await Promise.all(
            tokenIds.map(async (t) => {
              try {
                const s = await portfolioNFTService.getPortfolioSummary(t);
                return { tokenId: String(t), summary: s };
              } catch (e) {
                logger.warn(
                  "Failed to load summary for token",
                  t,
                  e.message || e
                );
                return { tokenId: String(t), summary: null };
              }
            })
          );
        }

        setCurrentNFTs(summaries);
      } catch (e) {
        console.error("Error loading current NFTs:", e);
        setCurrentNFTs([]);
        setCurrentNFTsError(e.message || String(e));
      } finally {
        setCurrentNFTsLoading(false);
      }
    } catch (e) {
      console.error("Error loading current NFTs:", e);
      setCurrentNFTs([]);
      setCurrentNFTsError(e.message || String(e));
      setCurrentNFTsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "mint":
        return <FaPlus />;
      case "update":
        return <FaEdit />;
      default:
        return <FaHistory />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "mint":
        return "Tạo mới Portfolio NFT";
      case "update":
        return "Cập nhật Portfolio";
      default:
        return "Thay đổi";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "course":
        return <FaGraduationCap />;
      case "certificate":
        return <FaCertificate />;
      case "badge":
        return <FaMedal />;
      case "statistics":
        return <FaUser />;
      case "verification":
        return <FaShieldAlt />;
      default:
        return <FaHistory />;
    }
  };

  // Helper for future: copyToClipboard

  return (
    <Container>
      <HistoryHeader>
        <HistoryTitle>Lịch sử Portfolio NFT #{tokenId}</HistoryTitle>
        <HistorySubtitle>
          Theo dõi tất cả các thay đổi và cập nhật theo thời gian
        </HistorySubtitle>
      </HistoryHeader>

      <SearchSection>
        <SearchForm
          onSubmit={(e) => {
            e.preventDefault();
            loadPortfolioHistory(tokenId);
          }}
        >
          <Input
            type="text"
            placeholder="Nhập Token ID để xem lịch sử (ví dụ: 899)"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
          />
          <Button type="submit" disabled={isLoading || !tokenId}>
            {isLoading ? (
              <>
                <LoadingSpinner />
                Đang tải...
              </>
            ) : (
              <>
                <FaHistory />
                Tải lịch sử
              </>
            )}
          </Button>
        </SearchForm>

        {statusMessage && (
          <StatusMessage className={statusType}>{statusMessage}</StatusMessage>
        )}
      </SearchSection>

      {/* Current NFTs owned by user (rendered regardless of history) */}
      {currentNFTsLoading && (
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            textAlign: "center",
          }}
        >
          <LoadingSpinner style={{ fontSize: 36 }} />
          <div style={{ marginTop: 12, color: "#4a5568" }}>Đang tải NFT...</div>
        </div>
      )}
      {currentNFTsError && (
        <StatusMessage className="error" style={{ marginBottom: 12 }}>
          {currentNFTsError}
        </StatusMessage>
      )}
      {currentNFTs && currentNFTs.length > 0 && (
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h3 style={{ color: "#2d3748", marginBottom: "15px" }}>
            📦 NFT hiện có ({currentNFTs.length})
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
            }}
          >
            {currentNFTs
              .filter((n) =>
                tokenId ? n.tokenId === tokenId.toString() : true
              )
              .map((n) => (
                <div
                  key={n.tokenId}
                  style={{
                    border: "1px solid #e6e6e6",
                    borderRadius: "12px",
                    padding: "15px",
                    background: "#fafafa",
                  }}
                >
                  <div
                    style={{ fontSize: "18px", fontWeight: 700, color: "#000" }}
                  >
                    Token #{n.tokenId}
                  </div>
                  {n.summary ? (
                    (() => {
                      const currentUser = getCurrentUser();
                      // Prefer showing application username when the current user is the minter
                      let displayName =
                        n.summary.studentName || n.summary.studentId || "-";
                      try {
                        if (currentUser) {
                          const currentWallet = (
                            currentUser.walletAddress || ""
                          ).toLowerCase();
                          const owner = (n.summary.owner || "").toLowerCase();
                          if (
                            (n.summary.studentId &&
                              currentUser.studentId &&
                              n.summary.studentId === currentUser.studentId) ||
                            (owner && currentWallet && owner === currentWallet)
                          ) {
                            displayName =
                              currentUser.username ||
                              `${currentUser.firstName || ""} ${
                                currentUser.lastName || ""
                              }`.trim() ||
                              displayName;
                          }
                        }
                      } catch (e) {
                        /* ignore */
                      }

                      return (
                        <div style={{ marginTop: "10px", color: "#4a5568" }}>
                          <div>
                            <strong>Người mint:</strong> {displayName}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <strong>IPFS:</strong>
                            <span style={{ fontFamily: "monospace" }}>
                              {n.summary.ipfsHash
                                ? `${n.summary.ipfsHash.slice(
                                    0,
                                    5
                                  )}...${n.summary.ipfsHash.slice(-5)}`
                                : "-"}
                            </span>
                            {n.summary.ipfsHash && (
                              <button
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(
                                      n.summary.ipfsHash
                                    );
                                    toast.success(
                                      "Copied IPFS hash to clipboard"
                                    );
                                  } catch (err) {
                                    toast.error("Không thể copy vào clipboard");
                                  }
                                }}
                                title="Copy full IPFS hash"
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  cursor: "pointer",
                                  padding: 4,
                                }}
                              >
                                <FaCopy />
                              </button>
                            )}
                          </div>
                          <div>
                            <strong>Ngày mint:</strong>{" "}
                            {n.summary.mintDate
                              ? new Date(n.summary.mintDate).toLocaleString(
                                  "vi-VN"
                                )
                              : "-"}
                          </div>

                          {/* Quick View Button */}
                          <button
                            onClick={() => {
                              // Open IPFS gateway to view metadata
                              if (n.summary.ipfsHash) {
                                const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${n.summary.ipfsHash}`;
                                window.open(ipfsUrl, "_blank");
                                toast.success("Đang mở metadata trên IPFS...");
                              } else {
                                toast.error("Không có IPFS hash");
                              }
                            }}
                            style={{
                              marginTop: "12px",
                              width: "100%",
                              padding: "10px 15px",
                              background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              color: "white",
                              border: "none",
                              borderRadius: "8px",
                              fontSize: "14px",
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 12px rgba(102, 126, 234, 0.4)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            👁️ Xem nhanh
                          </button>
                        </div>
                      );
                    })()
                  ) : (
                    <div style={{ marginTop: "10px", color: "#6c757d" }}>
                      Không thể tải thông tin chi tiết
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <>
          {/* Thống kê tổng quan */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "20px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ color: "#2d3748", marginBottom: "15px" }}>
              📊 Thống kê Lịch sử
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "15px",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  padding: "15px",
                  background: "#f8f9fa",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#28a745",
                  }}
                >
                  {history.length}
                </div>
                <div style={{ fontSize: "14px", color: "#718096" }}>
                  Tổng số thay đổi
                </div>
              </div>
              <div
                style={{
                  textAlign: "center",
                  padding: "15px",
                  background: "#f8f9fa",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#667eea",
                  }}
                >
                  {history[0]?.version || 0}
                </div>
                <div style={{ fontSize: "14px", color: "#718096" }}>
                  Version hiện tại
                </div>
              </div>
              <div
                style={{
                  textAlign: "center",
                  padding: "15px",
                  background: "#f8f9fa",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#ffc107",
                  }}
                >
                  {history.filter((h) => h.type === "update").length}
                </div>
                <div style={{ fontSize: "14px", color: "#718096" }}>
                  Lần cập nhật
                </div>
              </div>
              <div
                style={{
                  textAlign: "center",
                  padding: "15px",
                  background: "#f8f9fa",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#6c757d",
                  }}
                >
                  {history.length > 0
                    ? Math.ceil(
                        (new Date() -
                          new Date(history[history.length - 1].timestamp)) /
                          (1000 * 60 * 60 * 24)
                      )
                    : 0}
                </div>
                <div style={{ fontSize: "14px", color: "#718096" }}>
                  Ngày từ lần cuối
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <TimelineContainer>
            {history.map((item, index) => (
              <TimelineItem
                key={item.id}
                type={item.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <TimelineHeader>
                  <TimelineTitle>
                    {getTypeIcon(item.type)}
                    {getTypeLabel(item.type)} - Version {item.version}
                  </TimelineTitle>
                  <TimelineDate>
                    <FaClock />
                    {formatDate(item.timestamp)}
                  </TimelineDate>
                </TimelineHeader>

                <TimelineContent>
                  <p>
                    <strong>🔗 Transaction Hash:</strong> {item.transactionHash}
                  </p>
                  {item.userName ? (
                    <p>
                      <strong>👤 Người dùng:</strong> {item.userName}
                    </p>
                  ) : item.userId ? (
                    <p>
                      <strong>👤 User ID:</strong> {item.userId}
                    </p>
                  ) : null}

                  <ChangeList>
                    <h4 style={{ marginBottom: "10px", color: "#2d3748" }}>
                      📝 Thay đổi:
                    </h4>
                    {item.changes.map((change, changeIndex) => (
                      <ChangeItem key={changeIndex}>
                        <ChangeIcon type={change.type}>
                          {change.type === "add" ? (
                            <FaPlus />
                          ) : change.type === "update" ? (
                            <FaEdit />
                          ) : (
                            <FaTimes />
                          )}
                        </ChangeIcon>
                        <span>
                          <strong>
                            {change.type === "add"
                              ? "Thêm"
                              : change.type === "update"
                              ? "Cập nhật"
                              : "Xóa"}
                            :
                          </strong>{" "}
                          {change.item}
                        </span>
                        {getCategoryIcon(change.category)}
                      </ChangeItem>
                    ))}
                  </ChangeList>

                  <StatsGrid>
                    <StatCard>
                      <StatNumber>{item.stats.courses}</StatNumber>
                      <StatLabel>Khóa học</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatNumber>{item.stats.certificates}</StatNumber>
                      <StatLabel>Chứng chỉ</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatNumber>{item.stats.badges}</StatNumber>
                      <StatLabel>Huy hiệu</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatNumber>{item.stats.gpa}</StatNumber>
                      <StatLabel>GPA</StatLabel>
                    </StatCard>
                  </StatsGrid>
                </TimelineContent>
              </TimelineItem>
            ))}
          </TimelineContainer>
        </>
      )}

      {history.length === 0 && !isLoading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#718096" }}>
          <FaHistory style={{ fontSize: "48px", marginBottom: "20px" }} />
          <p>Chưa có lịch sử thay đổi nào cho Portfolio NFT này.</p>
        </div>
      )}
    </Container>
  );
};

export default PortfolioHistory;
