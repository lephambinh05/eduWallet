import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { blockchainAPI } from "../config/api";
import { BLOCKCHAIN_NETWORKS } from "../config/blockchain";

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
`;

const Title = styled.h2`
  margin: 0 0 1rem 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: #333;
  border-bottom: 1px solid #eee;
`;

const Td = styled.td`
  padding: 0.75rem 0.5rem;
  font-size: 0.95rem;
  color: #444;
  border-bottom: 1px solid #f6f6f6;
`;

const Status = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  color: #fff;
  background: ${(p) =>
    p.status === "success"
      ? "#4caf50"
      : p.status === "pending"
      ? "#ff9800"
      : "#f44336"};
`;

const TxLink = styled.a`
  color: #3772ff;
  text-decoration: none;
`;

const Empty = styled.div`
  padding: 2rem;
  text-align: center;
  color: #666;
`;

const TransactionHistory = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const explorerBase =
    BLOCKCHAIN_NETWORKS.pioneZero.blockExplorerUrls?.[0] || "";

  const load = async (p = 1, opts = {}) => {
    setLoading(true);
    try {
      const res = await blockchainAPI.getMyTransactions(p, limit, {
        type: opts.type || filterType || undefined,
        status: opts.status || filterStatus || undefined,
      });
      const data = res?.data?.data || {};
      setItems(data.items || []);
      setPage(data.page || p);
      setTotal(data.total || 0);
    } catch (e) {
      console.error("Failed to load transactions", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterApply = () => {
    load(1, {
      type: filterType || undefined,
      status: filterStatus || undefined,
    });
  };

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  return (
    <Container>
      <Card>
        <Title>Lịch sử giao dịch</Title>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 12,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 12,
              alignItems: "center",
            }}
          >
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#666" }}>
                Loại
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="deposit_points">Deposit Points</option>
                <option value="mint">Mint</option>
                <option value="transferEduTokens">Transfer EDU</option>
                <option value="purchaseItem">Purchase</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, color: "#666" }}>
                Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="pending">pending</option>
                <option value="success">success</option>
                <option value="failed">failed</option>
              </select>
            </div>

            <div>
              <button
                onClick={handleFilterApply}
                style={{ padding: "0.5rem 1rem" }}
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <Empty>Đang tải...</Empty>
        ) : items.length === 0 ? (
          <Empty>Không có giao dịch nào</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Ngày</Th>
                <Th>Loại</Th>
                <Th>Số lượng</Th>
                <Th>Trạng thái</Th>
                <Th>TxHash</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((tx) => (
                <tr key={tx._id}>
                  <Td>{new Date(tx.createdAt).toLocaleString()}</Td>
                  <Td>{tx.type}</Td>
                  <Td>{tx.amount || tx.tokenId || "-"}</Td>
                  <Td>
                    <Status status={tx.status}>{tx.status}</Status>
                  </Td>
                  <Td>
                    {tx.txHash ? (
                      <TxLink
                        href={`${explorerBase}/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {tx.txHash.slice(0, 10)}...
                      </TxLink>
                    ) : (
                      "-"
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {/* Pagination controls */}
        {items.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <div>
              <button
                onClick={() => {
                  if (page > 1) {
                    const p = page - 1;
                    setPage(p);
                    load(p);
                  }
                }}
                disabled={page <= 1}
                style={{ padding: "0.4rem 0.75rem" }}
              >
                Prev
              </button>
              <button
                onClick={() => {
                  if (page < totalPages) {
                    const p = page + 1;
                    setPage(p);
                    load(p);
                  }
                }}
                disabled={page >= totalPages}
                style={{ padding: "0.4rem 0.75rem", marginLeft: 8 }}
              >
                Next
              </button>
            </div>
            <div style={{ color: "#666" }}>
              Trang {page} / {totalPages} — Tổng {total}
            </div>
          </div>
        )}
      </Card>
    </Container>
  );
};

export default TransactionHistory;
