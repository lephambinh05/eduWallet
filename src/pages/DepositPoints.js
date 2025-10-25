import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useWallet } from "../context/WalletContext";
import {
  FaCoins,
  FaExchangeAlt,
  FaWallet,
  FaCheck,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";
import pointService from "../services/pointService";
import { blockchainAPI } from "../config/api";

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
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 700;
`;

const BalanceCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
  }

  input {
    width: 100%;
    padding: 1rem;
    border: 2px solid #e1e5e9;
    border-radius: 10px;
    font-size: 1rem;
    transition: border-color 0.3s ease;

    &:focus {
      outline: none;
      border-color: #667eea;
    }
  }
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
  background: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1.5rem;

  .info-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #1976d2;
    margin-bottom: 0.5rem;
  }

  .info-content {
    color: #1565c0;
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const ExchangeRate = styled.div`
  background: #f5f5f5;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: center;

  .rate {
    font-size: 1.5rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .description {
    color: #666;
    font-size: 0.9rem;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
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
  const { isConnected, account } = useWallet();
  const [pzoBalance, setPzoBalance] = useState("0");
  const [pointBalance, setPointBalance] = useState("0");
  const [pzoAmount, setPzoAmount] = useState("");
  const [pointAmount, setPointAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState("100");
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isExchanging, setIsExchanging] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);

  useEffect(() => {
    if (isConnected && account) {
      loadBalances();
      loadExchangeInfo();
    }
  }, [isConnected, account]);

  useEffect(() => {
    if (pzoAmount && exchangeRate) {
      const points = (parseFloat(pzoAmount) * 100).toFixed(2);
      setPointAmount(points);
    }
  }, [pzoAmount, exchangeRate]);

  const loadBalances = async () => {
    try {
      const connected = await pointService.connectWallet();
      if (!connected) {
        toast.error("Không thể kết nối với smart contract!");
        return;
      }

      const [pzoResult, pointResult] = await Promise.all([
        pointService.getPZOBalance(account),
        pointService.getPointBalance(account),
      ]);

      if (pzoResult.success) {
        setPzoBalance(parseFloat(pzoResult.balance).toFixed(4));
      }

      if (pointResult.success) {
        setPointBalance(parseFloat(pointResult.balance).toFixed(2));
      }
    } catch (error) {
      console.error("Error loading balances:", error);
      toast.error("Lỗi khi tải số dư!");
    }
  };

  const loadExchangeInfo = async () => {
    try {
      const result = await pointService.getExchangeInfo();
      if (result.success) {
        setExchangeRate(result.data.rate);
      }
    } catch (error) {
      console.error("Error loading exchange info:", error);
    }
  };

  const checkApproval = async () => {
    if (!pzoAmount || parseFloat(pzoAmount) <= 0) {
      toast.error("Vui lòng nhập số lượng PZO hợp lệ!");
      return;
    }

    try {
      const result = await pointService.checkPZOApproval(account, pzoAmount);
      if (result.success) {
        setNeedsApproval(!result.approved);
        if (!result.approved) {
          toast.info("Cần approve PZO trước khi đổi!");
        }
      }
    } catch (error) {
      console.error("Error checking approval:", error);
    }
  };

  const approvePZO = async () => {
    if (!pzoAmount || parseFloat(pzoAmount) <= 0) {
      toast.error("Vui lòng nhập số lượng PZO hợp lệ!");
      return;
    }

    setIsApproving(true);

    try {
      const result = await pointService.approvePZO(pzoAmount);
      if (result.success) {
        toast.success("✅ Approve PZO thành công!");
        setNeedsApproval(false);
        await checkApproval();
      } else {
        toast.error("❌ Lỗi: " + result.error);
      }
    } catch (error) {
      console.error("Error approving PZO:", error);
      toast.error("Có lỗi xảy ra khi approve PZO!");
    } finally {
      setIsApproving(false);
    }
  };

  const exchangePZOToPoints = async () => {
    if (!pzoAmount || parseFloat(pzoAmount) <= 0) {
      toast.error("Vui lòng nhập số lượng PZO hợp lệ!");
      return;
    }

    if (parseFloat(pzoAmount) > parseFloat(pzoBalance)) {
      toast.error("Số dư PZO không đủ!");
      return;
    }

    setIsExchanging(true);

    try {
      const result = await pointService.exchangePZOToPoints(pzoAmount);
      if (result.success) {
        toast.success("✅ Đổi PZO thành Point thành công!");
        setPzoAmount("");
        setPointAmount("");
        await loadBalances();
      } else {
        if (result.needsApproval) {
          setNeedsApproval(true);
          toast.error("Cần approve PZO trước!");
        } else {
          toast.error("❌ Lỗi: " + result.error);
        }
      }
    } catch (error) {
      console.error("Error exchanging PZO to Points:", error);
      toast.error("Có lỗi xảy ra khi đổi PZO!");
    } finally {
      setIsExchanging(false);
    }
  };

  const withdrawPointsToPZO = async () => {
    if (!pointAmount || parseFloat(pointAmount) <= 0) {
      toast.error("Vui lòng nhập số lượng Point hợp lệ!");
      return;
    }

    if (parseFloat(pointAmount) > parseFloat(pointBalance)) {
      toast.error("Số dư Point không đủ!");
      return;
    }

    setIsExchanging(true);

    try {
      const result = await pointService.withdrawPointsToPZO(pointAmount);
      if (result.success) {
        toast.success("✅ Rút Point về PZO thành công!");
        setPzoAmount("");
        setPointAmount("");
        await loadBalances();
      } else {
        toast.error("❌ Lỗi: " + result.error);
      }
    } catch (error) {
      console.error("Error withdrawing Points to PZO:", error);
      toast.error("Có lỗi xảy ra khi rút Point!");
    } finally {
      setIsExchanging(false);
    }
  };

  // Convert PZO to EDU token flow (transfer PZO -> platform contract, then backend issues/transfers EDU)
  const convertPZOToEDU = async () => {
    if (!pzoAmount || parseFloat(pzoAmount) <= 0) {
      toast.error("Vui lòng nhập số lượng PZO hợp lệ!");
      return;
    }

    if (parseFloat(pzoAmount) > parseFloat(pzoBalance)) {
      toast.error("Số dư PZO không đủ!");
      return;
    }

    setIsExchanging(true);

    try {
      // 1) Transfer PZO from user's wallet to the pointToken contract (or platform address)
      const transferResult = await pointService.transferPZOToContract(
        pzoAmount
      );
      if (!transferResult.success) {
        throw new Error(transferResult.error || "Transfer failed");
      }

      // 2) Calculate EDU amount. For now assume 1 PZO = 1 EDU (configurable later)
      const eduAmount = parseFloat(pzoAmount);

      // 3) Notify backend to transfer/mint EDU to the user's address
      const apiResult = await blockchainAPI.transferEduTokens(
        account,
        eduAmount
      );
      if (apiResult.status === 200 && apiResult.data?.success) {
        toast.success("✅ Chuyển đổi thành EDU thành công!");
        setPzoAmount("");
        setPointAmount("");
        await loadBalances();
      } else {
        console.error("Backend transferEduTokens failed:", apiResult.data);
        toast.error("Lỗi khi yêu cầu cấp EDU từ server");
      }
    } catch (error) {
      console.error("Error converting PZO to EDU:", error);
      toast.error("Có lỗi xảy ra khi chuyển PZO thành EDU!");
    } finally {
      setIsExchanging(false);
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

  return (
    <Container>
      <Card>
        <Title>
          <FaCoins /> Nạp Point
        </Title>

        <BalanceCard>
          <BalanceItem>
            <h3>PZO Balance</h3>
            <p className="balance">
              {pzoBalance}
              <span className="symbol">PZO</span>
            </p>
          </BalanceItem>
          <BalanceItem>
            <h3>Point Balance</h3>
            <p className="balance">
              {pointBalance}
              <span className="symbol">POINT</span>
            </p>
          </BalanceItem>
        </BalanceCard>

        <ExchangeRate>
          <div className="rate">1 PZO = 100 POINT</div>
          <div className="description">Tỷ giá: 0.1 PZO = 10 POINT</div>
        </ExchangeRate>

        <InfoBox>
          <div className="info-header">
            <FaInfoCircle />
            Thông tin giao dịch
          </div>
          <div className="info-content">
            • Đổi PZO thành Point để sử dụng trong hệ thống
            <br />
            • Tỷ giá cố định: 1 PZO = 100 POINT
            <br />
            • Cần approve PZO trước khi đổi
            <br />• Giao dịch được thực hiện trên blockchain
          </div>
        </InfoBox>

        <FormGroup>
          <label>Số lượng PZO muốn đổi:</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={pzoAmount}
            onChange={(e) => setPzoAmount(e.target.value)}
            placeholder="Nhập số lượng PZO..."
          />
        </FormGroup>

        <FormGroup>
          <label>Số Point sẽ nhận được:</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={pointAmount}
            readOnly
            style={{ backgroundColor: "#f5f5f5" }}
            placeholder="Số Point sẽ nhận được..."
          />
        </FormGroup>

        {needsApproval ? (
          <Button variant="warning" onClick={approvePZO} disabled={isApproving}>
            {isApproving ? (
              <>
                <LoadingSpinner />
                Đang approve PZO...
              </>
            ) : (
              <>
                <FaCheck />
                Approve PZO
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={exchangePZOToPoints}
            disabled={isExchanging}
          >
            {isExchanging ? (
              <>
                <LoadingSpinner />
                Đang đổi PZO...
              </>
            ) : (
              <>
                <FaExchangeAlt />
                Đổi PZO thành Point
              </>
            )}
          </Button>
        )}

        {/* Convert PZO directly to EDU (on-chain transfer then backend mints/transfers EDU) */}
        <Button
          variant="success"
          onClick={convertPZOToEDU}
          disabled={isExchanging}
          style={{ marginTop: 8 }}
        >
          {isExchanging ? (
            <>
              <LoadingSpinner />
              Đang chuyển PZO → EDU...
            </>
          ) : (
            <>
              <FaCoins />
              Chuyển PZO thành EDU
            </>
          )}
        </Button>

        <Button variant="success" onClick={checkApproval}>
          <FaWallet />
          Kiểm tra Approval
        </Button>

        <Button variant="warning" onClick={loadBalances}>
          <FaCoins />
          Làm mới số dư
        </Button>
      </Card>
    </Container>
  );
};

export default DepositPoints;
