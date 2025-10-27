import React, { useEffect, useState } from "react";
import AdminService from "../services/adminService";
import styled from "styled-components";

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;
const Th = styled.th`
  text-align: left;
  padding: 8px;
  border-bottom: 1px solid #e2e8f0;
`;
const Td = styled.td`
  padding: 8px;
  border-bottom: 1px solid #f1f5f9;
`;

const AdminPortfolioChanges = () => {
  const [changes, setChanges] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const filters = {};

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await AdminService.getPortfolioChanges({
        page: p,
        limit,
        ...filters,
      });
      setChanges(res.data.changes || res.data || []);
      setPage(res.data.page || p);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to load portfolio changes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h2>Portfolio Change Logs</h2>
      <p>Total: {total}</p>
      <div style={{ overflowX: "auto" }}>
        <Table>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>When</Th>
              <Th>Type</Th>
              <Th>User</Th>
              <Th>Token</Th>
              <Th>Details</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <Td colSpan={6}>Loading...</Td>
              </tr>
            ) : changes.length === 0 ? (
              <tr>
                <Td colSpan={6}>No records</Td>
              </tr>
            ) : (
              changes.map((ch, idx) => (
                <tr key={ch._id || idx}>
                  <Td>{idx + 1}</Td>
                  <Td>{new Date(ch.createdAt).toLocaleString()}</Td>
                  <Td>{ch.changeType}</Td>
                  <Td>
                    {ch.userId
                      ? `${ch.userId.firstName || ""} ${
                          ch.userId.lastName || ""
                        }`
                      : ch.userId}
                  </Td>
                  <Td>{ch.tokenId || "-"}</Td>
                  <Td style={{ maxWidth: 400, whiteSpace: "pre-wrap" }}>
                    {JSON.stringify(ch.diff || ch.meta || {}, null, 2)}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => load(page - 1)} disabled={page <= 1}>
          Prev
        </button>
        <span style={{ margin: "0 8px" }}>Page {page}</span>
        <button onClick={() => load(page + 1)} disabled={page * limit >= total}>
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminPortfolioChanges;
