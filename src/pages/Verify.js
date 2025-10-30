import React, { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  border: 1px solid #667eea;
  margin-bottom: 1rem;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.07);
  color: #fff;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2rem;
  color: #fff;
  margin-top: 1.5rem;
`;

const Verify = () => {
  const [cid, setCid] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const GATEWAY =
    process.env.REACT_APP_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/";

  const handleVerify = async (e) => {
    e && e.preventDefault();
    setError(null);
    setResult(null);

    const value = cid.trim();
    if (!value) {
      setError("Vui lòng nhập một IPFS hash (CID)");
      return;
    }

    setLoading(true);
    try {
      const url = `${GATEWAY.replace(/\/$/, "")}/${value}`;
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        throw new Error(
          `Không thể truy cập IPFS gateway (status: ${res.status})`
        );
      }

      const contentType = res.headers.get("content-type") || "";
      let data;
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      setResult({ url, contentType, data });
    } catch (err) {
      setError(err.message || "Lỗi khi truy vấn IPFS");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h2 style={{ color: "#667eea", marginBottom: 24 }}>
        Xác minh nội dung IPFS
      </h2>

      <form onSubmit={handleVerify}>
        <Input
          placeholder="Nhập IPFS CID (ví dụ: Qm...) hoặc IPFS path"
          value={cid}
          onChange={(e) => setCid(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Đang kiểm tra..." : "Kiểm tra"}
        </button>
      </form>

      {error && <div style={{ color: "red", marginTop: 16 }}>{error}</div>}

      {result && (
        <Card>
          <div style={{ marginBottom: 8 }}>
            <b>URL:</b>{" "}
            <a href={result.url} target="_blank" rel="noreferrer">
              {result.url}
            </a>
          </div>
          <div style={{ marginBottom: 8 }}>
            <b>Content-Type:</b> {result.contentType}
          </div>
          <div>
            <b>Nội dung:</b>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                marginTop: 8,
                maxHeight: 400,
                overflow: "auto",
              }}
            >
              {typeof result.data === "string"
                ? result.data
                : JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        </Card>
      )}
    </Container>
  );
};

export default Verify;
