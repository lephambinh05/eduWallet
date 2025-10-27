import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AdminService from "../services/adminService";

const Container = styled.div`
  color: #fff;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: #fff;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  font-size: 0.95rem;
`;

const Placeholder = styled.div`
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
`;

const AdminNFTPortfolio = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getNFTPortfolio({ page, limit, search });
      const payload = res?.data || {};
      setItems(payload.items || []);
      setTotalPages(payload.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load NFT portfolio", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <Container>
      <Header>
        <h3>NFT Portfolio (Minted)</h3>
        <div>
          <input
            placeholder="Tìm kiếm Token ID / TX / IPFS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
              marginRight: 8,
              background: "transparent",
              color: "#fff",
            }}
          />
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              setPage(1);
              fetchData();
            }}
          >
            Tìm
          </button>
        </div>
      </Header>

      {loading && <Placeholder>Đang tải...</Placeholder>}

      {!loading && items.length === 0 && (
        <Placeholder>Không có NFT nào được tìm thấy.</Placeholder>
      )}

      {!loading && items.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <Table>
            <thead>
              <tr>
                <Th>TX Hash</Th>
                <Th>Token ID</Th>
                <Th>IPFS</Th>
                <Th>Metadata URI</Th>
                <Th>Owner</Th>
                <Th>Time</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <Td>
                    <a
                      href={`https://etherscan.io/tx/${item.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.txHash}
                    </a>
                  </Td>
                  <Td>{item.tokenId || "-"}</Td>
                  <Td>{item.ipfsHash || item.metadata?.ipfs || "-"}</Td>
                  <Td>{item.metadataURI || "-"}</Td>
                  <Td>
                    {item.userId
                      ? `${item.userId.firstName || ""} ${
                          item.userId.lastName || ""
                        } (${item.userId.email || ""})`
                      : item.to || "-"}
                  </Td>
                  <Td>{new Date(item.createdAt).toLocaleString()}</Td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <button
              className="btn btn-sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </button>
            <div>
              Trang {page} / {totalPages}
            </div>
            <button
              className="btn btn-sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default AdminNFTPortfolio;
