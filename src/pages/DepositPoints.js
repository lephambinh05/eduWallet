import React, { useState } from "react";
import styled from "styled-components";
import { useWallet } from "../context/WalletContext";
import { FaCoins, FaSyncAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import pointService from "../services/pointService";
import { blockchainAPI, adminAPI, authAPI } from "../config/api";

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #333;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 2rem;
  font-weight: 700;
`;

const BalanceCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 15px;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BalanceItem = styled.div`
  text-align: center;

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    opacity: 0.9;
  }

  .balance {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
  }

  .symbol {
    font-size: 1rem;
    opacity: 0.8;
    margin-left: 0.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 0.75rem;
`;

const Button = styled.button`
  background: ${(props) =>
    props.variant === "primary"
      ? "linear-gradient(90deg, #667eea, #764ba2)"
      : props.variant === "success"
      ? "linear-gradient(90deg, #4CAF50, #45a049)"
      : props.variant === "warning"
      ? "linear-gradient(90deg, #ff9800, #f57c00)"
      : "linear-gradient(90deg, #f44336, #d32f2f)"};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin-bottom: 1rem;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const InfoBox = styled.div`
  margin-top: 0.5rem;
  color: #333;
`;

// (exchange rate UI removed in simplified view)

const LoadingSpinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.7);
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const DepositPoints = () => {
  const { isConnected, account, chainId, currentNetwork } = useWallet();
  const [pointBalance, setPointBalance] = useState("0");
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminSettings, setAdminSettings] = useState(null);

  const loadBalances = React.useCallback(async () => {
    try {
      // Load EDU token balance from backend (database) instead of blockchain
      const profileResponse = await authAPI.getProfile();

      if (profileResponse.data.success) {
        // API returns { success: true, data: { user } }
        const userData =
          profileResponse.data.data.user || profileResponse.data.data;
        const eduBalance = userData.eduTokenBalance || 0;

        setPointBalance(parseFloat(eduBalance).toFixed(2));

        if (eduBalance > 0) {
          toast.success(`Đã tải số dư: ${eduBalance} EDU`);
        }
      } else {
        toast.error("Không thể tải số dư từ server");
      }
    } catch (error) {
      console.error("❌ Error loading balances:", error);
      toast.error("Lỗi khi tải số dư! Vui lòng đăng nhập lại.");
    }
  }, []);

  // Initial load
  React.useEffect(() => {
    if (isConnected && account) {
      loadBalances();
      // Try to load admin settings from public API
      (async () => {
        try {
          const resp = await adminAPI.getPublicAdminWallet();
          const data = resp?.data?.data || null;
          if (data) {
            setAdminSettings({
              address: data.address || null,
              eduPrice: data.eduPrice || null,
              minConvertPZO: data.minConvertPZO || null,
              maxConvertPZO: data.maxConvertPZO || null,
            });
            return;
          }
        } catch (e) {
          // ignore
        }

        // Fallback to env
        const envAddr = process.env.REACT_APP_ADMIN_WALLET || null;
        if (envAddr) {
          setAdminSettings({
            address: envAddr,
            eduPrice: null,
            minConvertPZO: null,
            maxConvertPZO: null,
          });
        }
      })();
    }
  }, [isConnected, account, loadBalances]);

  // Convert PZO to EDU token flow (transfer PZO -> platform contract, then backend issues/transfers EDU)
  const convertPZOToEDU = async (pzoAmount) => {
    if (!pzoAmount || parseFloat(pzoAmount) <= 0) {
      toast.error("Vui lòng nhập số lượng PZO hợp lệ!");
      return;
    }

    setIsProcessing(true);

    try {
      // Check if wallet is connected to user account
      const profileResponse = await authAPI.getProfile();
      if (!profileResponse.data.success) {
        toast.error("Không thể xác minh tài khoản. Vui lòng đăng nhập lại.");
        setIsProcessing(false);
        return;
      }

      const userData =
        profileResponse.data.data.user || profileResponse.data.data;
      if (
        !userData.walletAddress ||
        userData.walletAddress.toLowerCase() !== account.toLowerCase()
      ) {
        toast.error(
          "Ví hiện tại chưa được kết nối với tài khoản. Vui lòng nhấp vào 'Kết nối ví' trong sidebar."
        );
        setIsProcessing(false);
        return;
      }

      // Ensure PZO network if chainId is present
      if (chainId && chainId !== 5080) {
        toast.error(
          `Vui lòng chuyển sang mạng Pione Zero (${currentNetwork}) trước khi thực hiện giao dịch.`
        );
        setIsProcessing(false);
        return;
      }

      // 0) Resolve admin wallet address: prefer loaded adminSettings.address (if available),
      // otherwise try GET /admin/wallet (may be protected), then fall back to env var.
      let adminAddress = adminSettings?.address || null;
      if (!adminAddress) {
        try {
          const adminResp = await adminAPI.getAdminWallet();
          adminAddress = adminResp?.data?.data?.address || null;
        } catch (e) {
          console.warn(
            "adminAPI.getAdminWallet failed, will try env fallback:",
            e?.message
          );
        }
      }

      // Fallback to env var if configured
      if (!adminAddress) {
        adminAddress = process.env.REACT_APP_ADMIN_WALLET || null;
      }

      if (!adminAddress) {
        toast.error(
          "Địa chỉ ví admin chưa được cấu hình trên server hoặc môi trường. Liên hệ quản trị để cấu hình."
        );
        setIsProcessing(false);
        return;
      }

      // 0.5) Ensure pointService is connected
      console.log("🔌 Connecting to PZO contract...");
      const connected = await pointService.connectWallet();
      if (!connected) {
        toast.error(
          "Không thể kết nối với smart contract PZO! Vui lòng kiểm tra MetaMask."
        );
        setIsProcessing(false);
        return;
      }
      console.log("✅ Connected to PZO contract");

      // 1) Transfer PZO from user's wallet to the configured admin wallet
      console.log(
        `💸 Transferring ${pzoAmount} PZO to admin wallet: ${adminAddress}`
      );
      const transferResult = await pointService.transferPZOToContract(
        pzoAmount,
        adminAddress
      );

      if (!transferResult.success) {
        throw new Error(transferResult.error || "Transfer failed");
      }

      // 2) Persist transaction record to backend for audit (non-blocking)
      try {
        await blockchainAPI.saveTransaction({
          txHash: transferResult.txHash,
          from: account,
          to: adminAddress,
          amount: pzoAmount,
          network: currentNetwork || "pioneZero",
          type: "deposit_points",
        });
      } catch (e) {
        console.error("Failed to save transaction to backend:", e);
      }

      // 3) Call backend to process deposit and credit EDU tokens
      try {
        console.log("Processing deposit with public endpoint:", {
          txHash: transferResult.txHash,
          pzoAmount: pzoAmount,
          walletAddress: account,
        });

        const depositResponse = await blockchainAPI.processPointDepositPublic({
          txHash: transferResult.txHash,
          pzoAmount: pzoAmount,
          walletAddress: account,
        });

        console.log("Deposit response:", depositResponse);

        if (depositResponse.data.success) {
          const { eduCredited, newBalance } = depositResponse.data.data;
          toast.success(
            `✅ Nạp thành công! Bạn nhận được ${eduCredited.toFixed(
              2
            )} EDU. Số dư mới: ${newBalance.toFixed(2)} EDU`,
            { duration: 5000 }
          );
        } else {
          throw new Error(
            depositResponse.data.error || "Failed to credit EDU tokens"
          );
        }
      } catch (e) {
        console.error("Failed to process deposit - Full error:", e);
        console.error("Error response:", e.response?.data);
        console.error("Error status:", e.response?.status);

        // Show detailed error message
        let errorMsg = "⚠️ PZO đã được chuyển nhưng có lỗi khi cộng điểm.";
        if (e.response?.status === 401) {
          errorMsg += " Lỗi xác thực - Vui lòng đăng nhập lại.";
        } else if (e.response?.data?.error) {
          errorMsg += ` Chi tiết: ${e.response.data.error}`;
        }
        errorMsg += ` Mã giao dịch: ${transferResult.txHash}`;

        toast.error(errorMsg, { duration: 8000 });
        setIsProcessing(false);
        return;
      }

      toast.success(
        "✅ Hoàn tất! PZO đã được chuyển và điểm đã được cộng vào tài khoản.",
        { duration: 5000 }
      );

      // Refresh point balance after a short delay
      setTimeout(loadBalances, 2000);
    } catch (error) {
      console.error("Error converting PZO to EDU:", error);
      toast.error(
        "Có lỗi xảy ra khi chuyển PZO!" +
          (error?.message ? ` (${error.message})` : "")
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isConnected) {
    return (
      <Container>
        <Card>
          <Title>Nạp Point</Title>
          <div
            style={{
              textAlign: "center",
              color: "#f44336",
              fontSize: "1.2rem",
            }}
          >
            ⚠️ Vui lòng kết nối ví để sử dụng chức năng này
          </div>
        </Card>
      </Container>
    );
  }

  const promptAndConvert = async () => {
    const input = window.prompt("Nhập số PZO muốn chuyển (vd: 0.5):");
    if (!input) return;
    const amount = parseFloat(input);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Số PZO không hợp lệ");
      return;
    }
    // If admin settings specify min/max, enforce them
    const min =
      adminSettings && adminSettings.minConvertPZO
        ? parseFloat(adminSettings.minConvertPZO)
        : null;
    const max =
      adminSettings && adminSettings.maxConvertPZO
        ? parseFloat(adminSettings.maxConvertPZO)
        : null;
    if (min !== null && amount < min) {
      toast.error(`Số PZO phải >= ${min} theo cấu hình hệ thống`);
      return;
    }
    if (max !== null && amount > max) {
      toast.error(`Số PZO phải <= ${max} theo cấu hình hệ thống`);
      return;
    }

    // Compute expected EDU based on admin-configured price (if available)
    let expectedEdu = null;
    if (adminSettings && adminSettings.eduPrice) {
      const price = parseFloat(adminSettings.eduPrice);
      if (!isNaN(price) && price > 0) {
        expectedEdu = amount / price;
      }
    }

    // Confirm with user showing the estimated EDU they will receive
    const confirmMessage = expectedEdu
      ? `Bạn sẽ nhận khoảng ${expectedEdu.toFixed(
          4
        )} EDU (ước tính) nếu chuyển ${amount} PZO. Xác nhận?`
      : `Bạn sắp chuyển ${amount} PZO đến ví nền tảng. Xác nhận?`;

    const ok = window.confirm(confirmMessage);
    if (!ok) return;

    await convertPZOToEDU(amount.toString());
  };

  return (
    <Container>
      <Card>
        <Title>
          <FaCoins /> Nạp Point
        </Title>

        <BalanceCard>
          <BalanceItem>
            <h3>EDU Token Balance</h3>
            <p className="balance">
              {pointBalance}
              <span className="symbol">EDU</span>
            </p>
          </BalanceItem>

          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              minWidth: 180,
            }}
          >
            <div style={{ textAlign: "right", fontSize: 13 }}>
              {adminSettings?.eduPrice ? (
                <div>Giá: 1 EDU = {adminSettings.eduPrice} PZO</div>
              ) : (
                <div>Giá: chưa cấu hình</div>
              )}
              {adminSettings?.minConvertPZO && (
                <div>Min: {adminSettings.minConvertPZO} PZO</div>
              )}
              {adminSettings?.maxConvertPZO && (
                <div>Max: {adminSettings.maxConvertPZO} PZO</div>
              )}
            </div>

            <Button
              variant="primary"
              onClick={loadBalances}
              disabled={isProcessing}
            >
              <FaSyncAlt /> Làm mới
            </Button>
          </div>
        </BalanceCard>

        <FormGroup>
          <Button
            variant="success"
            onClick={promptAndConvert}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <LoadingSpinner />
                Đang xử lý...
              </>
            ) : (
              "Nạp Point (Chuyển PZO → EDU)"
            )}
          </Button>
        </FormGroup>

        <InfoBox>
          Lưu ý: Sau khi chuyển PZO đến ví nền tảng, hệ thống backend sẽ xử lý
          và cấp EDU/Point cho tài khoản của bạn. Nếu sau một thời gian ngắn bạn
          không thấy điểm được cập nhật, kiểm tra trang lịch sử giao dịch hoặc
          liên hệ quản trị.
        </InfoBox>
      </Card>
    </Container>
  );
};

export default DepositPoints;
