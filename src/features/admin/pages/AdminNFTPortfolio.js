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

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Table = styled.table`
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  color: #fff;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.02);
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  font-size: 0.95rem;
  vertical-align: middle;
`;

const MaskedText = styled.span`
  font-family: monospace;
  color: #9ae6ff;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const QuickButton = styled.button`
  background: #0b74ff;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;

  &:hover {
    background: #0a5fd6;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewView, setPreviewView] = useState("pretty"); // 'pretty' | 'raw'

  // Function to mask IPFS hash - show first 6 and last 6 characters
  const maskIPFS = (ipfsHash) => {
    if (!ipfsHash || ipfsHash.length <= 12) return ipfsHash || "-";
    return `${ipfsHash.slice(0, 6)}...${ipfsHash.slice(-6)}`;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getNFTPortfolio({ page, limit, search });
      const payload = res?.data || {};
      console.log("🔍 NFT Portfolio Response:", res); // Debug log
      console.log("📦 Items:", payload.items); // Debug log
      if (payload.items && payload.items.length > 0) {
        console.log("👤 First item userId:", payload.items[0].userId); // Debug log
      }
      setItems(payload.items || []);
      setTotalPages(payload.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load NFT portfolio", err);
    } finally {
      setLoading(false);
    }
  };

  const openPreview = async (item) => {
    setPreviewOpen(true);
    setPreviewLoading(true);
    try {
      const res = await AdminService.getNFTPreview(item._id);
      // API returns { success: true, data: { metadata, previewImage, sourceUrl } }
      // AdminService returns that object (not axios response), so normalize both shapes.
      const payload = res?.data ? res.data : res;
      setPreviewData({ ...payload, item });
    } catch (err) {
      console.error("Failed to load preview", err);
      setPreviewData({ error: err.message || "Failed to load" });
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewData(null);
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
            placeholder="Tìm kiếm Token ID / IPFS..."
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
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>IPFS</Th>
                <Th>Token ID</Th>
                <Th>Xem nhanh</Th>
                <Th>Metadata URI</Th>
                <Th>Owner</Th>
                <Th>Time</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const ipfsHash = item.ipfsHash || item.metadata?.ipfs || "";
                const maskedIPFS = maskIPFS(ipfsHash);

                return (
                  <tr key={item._id}>
                    <Td>
                      <MaskedText
                        title={ipfsHash}
                        onClick={() => {
                          if (ipfsHash) {
                            const ipfsUrl = ipfsHash.startsWith("ipfs://")
                              ? `https://gateway.pinata.cloud/ipfs/${ipfsHash.replace(
                                  "ipfs://",
                                  ""
                                )}`
                              : `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
                            window.open(ipfsUrl, "_blank");
                          }
                        }}
                      >
                        {maskedIPFS}
                      </MaskedText>
                    </Td>
                    <Td style={{ fontWeight: 600 }}>{item.tokenId || "-"}</Td>
                    <Td>
                      <QuickButton onClick={() => openPreview(item)}>
                        Xem nhanh
                      </QuickButton>
                    </Td>
                    <Td>
                      <MaskedText title={item.metadataURI || "-"}>
                        {maskIPFS(item.metadataURI)}
                      </MaskedText>
                    </Td>
                    <Td>
                      {item.userId
                        ? `${item.userId.firstName || ""} ${
                            item.userId.lastName || ""
                          } (${item.userId.email || ""})`
                        : item.to || "-"}
                    </Td>
                    <Td style={{ whiteSpace: "nowrap" }}>
                      {new Date(item.createdAt).toLocaleString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!loading && items.length > 0 && (
          <>
            <button
              className="btn btn-sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{
                background: page <= 1 ? "rgba(255,255,255,0.05)" : "#0b74ff",
                border: "none",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: page <= 1 ? "not-allowed" : "pointer",
              }}
            >
              Prev
            </button>
            <div
              style={{
                padding: "8px 16px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "6px",
                fontWeight: 600,
              }}
            >
              Trang {page} / {totalPages}
            </div>
            <button
              className="btn btn-sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{
                background:
                  page >= totalPages ? "rgba(255,255,255,0.05)" : "#0b74ff",
                border: "none",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: page >= totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </>
        )}
      </div>

      {previewOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: 20,
          }}
          onClick={closePreview}
        >
          <div
            style={{
              width: previewView === "pretty" ? 900 : 800,
              maxWidth: "95%",
              maxHeight: "90vh",
              background: "#0b1220",
              padding: 24,
              borderRadius: 16,
              color: "#fff",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              border: "1px solid rgba(154,230,255,0.1)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                paddingBottom: 16,
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <h4 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                NFT Preview
                {previewData?.item?.tokenId && (
                  <span
                    style={{
                      color: "#9ae6ff",
                      fontSize: 16,
                      marginLeft: 8,
                      fontWeight: 600,
                    }}
                  >
                    #{previewData.item.tokenId}
                  </span>
                )}
              </h4>
              <button
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
                onClick={closePreview}
                onMouseOver={(e) =>
                  (e.target.style.background = "rgba(255,255,255,0.15)")
                }
                onMouseOut={(e) =>
                  (e.target.style.background = "rgba(255,255,255,0.1)")
                }
              >
                ✕ Close
              </button>
            </div>

            {previewLoading && <Placeholder>Đang tải preview...</Placeholder>}

            {!previewLoading &&
              previewData &&
              (previewData.metadata || previewData.data?.metadata) &&
              (() => {
                const meta =
                  previewData.metadata || previewData.data?.metadata || {};
                const sourceUrl =
                  previewData.sourceUrl ||
                  previewData.data?.sourceUrl ||
                  previewData.metadataURI ||
                  previewData.data?.metadataURI;

                const fixIpfs = (u) => {
                  if (!u) return null;
                  if (String(u).startsWith("ipfs://"))
                    return (
                      (process.env.REACT_APP_IPFS_GATEWAY ||
                        "https://gateway.pinata.cloud/ipfs/") +
                      String(u).replace(/^ipfs:\/\//, "")
                    );
                  return u;
                };

                const renderAttributes = (attrs) => {
                  if (!attrs) return null;
                  if (Array.isArray(attrs)) {
                    return (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(200px, 1fr))",
                          gap: 12,
                          marginTop: 12,
                        }}
                      >
                        {attrs.map((a, i) => (
                          <div
                            key={i}
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              padding: 12,
                              borderRadius: 8,
                              border: "1px solid rgba(255,255,255,0.1)",
                            }}
                          >
                            <div
                              style={{
                                color: "#9ae6ff",
                                fontSize: 11,
                                fontWeight: 600,
                                marginBottom: 4,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              {a.trait_type || a.name || "Attribute"}
                            </div>
                            <div
                              style={{
                                color: "#fff",
                                fontSize: 14,
                                fontWeight: 700,
                              }}
                            >
                              {String(a.value ?? a.display_value ?? a)}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  if (typeof attrs === "object") {
                    return (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(200px, 1fr))",
                          gap: 12,
                          marginTop: 12,
                        }}
                      >
                        {Object.keys(attrs).map((k) => (
                          <div
                            key={k}
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              padding: 12,
                              borderRadius: 8,
                              border: "1px solid rgba(255,255,255,0.1)",
                            }}
                          >
                            <div
                              style={{
                                color: "#9ae6ff",
                                fontSize: 11,
                                fontWeight: 600,
                                marginBottom: 4,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              {k}
                            </div>
                            <div
                              style={{
                                color: "#fff",
                                fontSize: 14,
                                fontWeight: 700,
                              }}
                            >
                              {String(attrs[k])}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return <div>{String(attrs)}</div>;
                };

                const renderPretty = (m) => {
                  const attrs = m.attributes || m.traits || m.properties;

                  return (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                        maxHeight: 520,
                        overflowY: "auto",
                        paddingRight: 8,
                      }}
                    >
                      {/* Main Info Card */}
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(11,116,255,0.1) 0%, rgba(154,230,255,0.05) 100%)",
                          border: "1px solid rgba(154,230,255,0.2)",
                          borderRadius: 12,
                          padding: 20,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: "#fff",
                            marginBottom: 8,
                          }}
                        >
                          {m.name || "Untitled NFT"}
                        </div>
                        <div
                          style={{
                            color: "rgba(255,255,255,0.7)",
                            fontSize: 14,
                            lineHeight: 1.6,
                          }}
                        >
                          {m.description || "No description available"}
                        </div>
                      </div>

                      {/* Token Info Card */}
                      <div
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 12,
                          padding: 16,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#9ae6ff",
                            marginBottom: 12,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          🔗 Token Information
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                color: "rgba(255,255,255,0.6)",
                                fontSize: 13,
                              }}
                            >
                              Token ID
                            </span>
                            <span
                              style={{
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: 14,
                                background: "rgba(154,230,255,0.1)",
                                padding: "4px 12px",
                                borderRadius: 6,
                              }}
                            >
                              #{previewData.item?.tokenId ?? "-"}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                color: "rgba(255,255,255,0.6)",
                                fontSize: 13,
                              }}
                            >
                              TX Hash
                            </span>
                            {previewData.item?.txHash ? (
                              <a
                                href={`https://etherscan.io/tx/${previewData.item.txHash}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  color: "#9ae6ff",
                                  fontSize: 13,
                                  fontFamily: "monospace",
                                  textDecoration: "none",
                                }}
                              >
                                {String(previewData.item.txHash).slice(0, 8)}...
                                {String(previewData.item.txHash).slice(-6)}
                              </a>
                            ) : (
                              <span style={{ color: "rgba(255,255,255,0.4)" }}>
                                -
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Owner Card */}
                      <div
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 12,
                          padding: 16,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#9ae6ff",
                            marginBottom: 12,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          👤 Owner
                        </div>
                        <div style={{ color: "#fff", fontSize: 14 }}>
                          {(() => {
                            const item = previewData.item;
                            if (item?.userId) {
                              const firstName = item.userId.firstName || "";
                              const lastName = item.userId.lastName || "";
                              const email = item.userId.email || "";
                              const fullName =
                                `${firstName} ${lastName}`.trim();

                              if (fullName && email) {
                                return `${fullName} (${email})`;
                              } else if (email) {
                                return email;
                              } else if (fullName) {
                                return fullName;
                              }
                            }
                            return item?.to || "Unknown";
                          })()}
                        </div>
                      </div>

                      {/* IPFS Card */}
                      <div
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 12,
                          padding: 16,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#9ae6ff",
                            marginBottom: 12,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          📦 IPFS & Metadata
                        </div>
                        <div
                          style={{
                            color: "rgba(255,255,255,0.7)",
                            fontSize: 12,
                            fontFamily: "monospace",
                            wordBreak: "break-all",
                            lineHeight: 1.6,
                          }}
                        >
                          {previewData.item?.metadataURI ||
                            previewData.item?.ipfsHash ||
                            "No IPFS data"}
                        </div>
                        {sourceUrl && (
                          <div style={{ marginTop: 12 }}>
                            <a
                              href={fixIpfs(sourceUrl)}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                background: "#0b74ff",
                                color: "#fff",
                                padding: "8px 16px",
                                borderRadius: 8,
                                textDecoration: "none",
                                fontSize: 13,
                                fontWeight: 600,
                                transition: "all 0.2s",
                              }}
                            >
                              🔗 Open IPFS Gateway
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Attributes/Traits Cards */}
                      {attrs && (
                        <div
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 12,
                            padding: 16,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#9ae6ff",
                              marginBottom: 4,
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            ✨ Attributes & Traits
                          </div>
                          {renderAttributes(attrs)}
                        </div>
                      )}
                    </div>
                  );
                };

                const renderRaw = (m) => {
                  return (
                    <div
                      style={{
                        flex: 1,
                        overflow: "auto",
                        background: "#000",
                        padding: 16,
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <pre
                        style={{
                          whiteSpace: "pre",
                          color: "#0f0",
                          margin: 0,
                          fontSize: 12,
                          lineHeight: 1.4,
                          fontFamily:
                            "Consolas, Monaco, 'Courier New', monospace",
                        }}
                      >
                        {JSON.stringify(m)}
                      </pre>
                    </div>
                  );
                };

                return (
                  <div
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                      <button
                        style={{
                          background:
                            previewView === "pretty"
                              ? "#0b74ff"
                              : "rgba(255,255,255,0.05)",
                          border:
                            previewView === "pretty"
                              ? "1px solid #0b74ff"
                              : "1px solid rgba(255,255,255,0.1)",
                          color: "#fff",
                          padding: "10px 20px",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 14,
                          fontWeight: 600,
                          transition: "all 0.2s",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                        onClick={() => setPreviewView("pretty")}
                      >
                        ✨ Pretty View
                      </button>
                      <button
                        style={{
                          background:
                            previewView === "raw"
                              ? "#0b74ff"
                              : "rgba(255,255,255,0.05)",
                          border:
                            previewView === "raw"
                              ? "1px solid #0b74ff"
                              : "1px solid rgba(255,255,255,0.1)",
                          color: "#fff",
                          padding: "10px 20px",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 14,
                          fontWeight: 600,
                          transition: "all 0.2s",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                        onClick={() => setPreviewView("raw")}
                      >
                        📄 Raw JSON
                      </button>
                    </div>
                    {previewView === "pretty"
                      ? renderPretty(meta)
                      : renderRaw(meta)}
                  </div>
                );
              })()}

            {!previewLoading && previewData && previewData.error && (
              <Placeholder>{previewData.error}</Placeholder>
            )}
          </div>
        </div>
      )}
    </Container>
  );
};

export default AdminNFTPortfolio;
