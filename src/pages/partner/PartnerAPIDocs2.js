/* cspell:disable */
import React, { useEffect, useState } from "react";
import api from "../../config/api";
import toast from "react-hot-toast";
import { FiCopy, FiDownload } from "react-icons/fi";

const storageKey = (partnerId) => `partnerApiKeyInfo_${partnerId || "anon"}`;
const BASE_URL = process.env.REACT_APP_BACKEND_URL || "";

function maskKey(key) {
  if (!key || key.length <= 10) return key;
  return `${key.slice(0, 5)}***${key.slice(-5)}`;
}

export default function PartnerAPIDocs() {
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);
  const [apiKey, setApiKey] = useState(null); // plaintext in-session only
  const [partnerId, setPartnerId] = useState(null);

  // modal state for password when rotating key
  const [showRotateModal, setShowRotateModal] = useState(false);
  const [rotatePassword, setRotatePassword] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [modalLoading, setModalLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey());
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.apiKey) setApiKey(parsed.apiKey);
      } catch (e) {}
    }
    fetchMetadata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchMetadata() {
    setLoading(true);
    try {
      const res = await api.get(`/api/partner/apikey`);
      const payload =
        res && res.data && res.data.data
          ? res.data.data
          : res && res.data
          ? res.data
          : null;
      setMetadata(payload || null);
      const pid =
        (payload && payload.partnerId) ||
        (res && res.data && res.data.partnerId) ||
        null;
      if (pid) setPartnerId(pid);

      const saved = sessionStorage.getItem(storageKey(pid));
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.apiKey) setApiKey(parsed.apiKey);
        } catch (e) {}
      }
    } catch (err) {
      console.error("Failed to fetch api key metadata", err);
      toast.error("Không thể lấy thông tin khóa API.");
    } finally {
      setLoading(false);
    }
  }

  function persistKeyToSession(key) {
    if (!partnerId) {
      sessionStorage.setItem(storageKey(), JSON.stringify({ apiKey: key }));
    } else {
      sessionStorage.setItem(
        storageKey(partnerId),
        JSON.stringify({ apiKey: key })
      );
    }
  }

  async function generateKey(password) {
    setLoading(true);
    try {
      const body = password ? { password } : {};
      const res = await api.post(`/api/partner/apikey/generate`, body);
      const payload =
        res && res.data && res.data.data
          ? res.data.data
          : res && res.data
          ? res.data
          : null;
      if (payload && payload.apiKey) {
        setApiKey(payload.apiKey);
        persistKeyToSession(payload.apiKey);
        toast.success("Khóa API đã được tạo. Lưu lại ngay!");
      } else {
        toast.error("Không nhận được khóa API từ máy chủ.");
      }
      await fetchMetadata();
    } catch (err) {
      console.error("generateKey error", err);
      const msg = err?.response?.data?.message || "Tạo khóa thất bại.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function revealKey() {
    setLoading(true);
    try {
      const res = await api.post(`/api/partner/apikey/reveal`);
      const payload =
        res && res.data && res.data.data
          ? res.data.data
          : res && res.data
          ? res.data
          : null;
      if (payload && payload.apiKey) {
        setApiKey(payload.apiKey);
        persistKeyToSession(payload.apiKey);
        return payload.apiKey;
      } else {
        toast.error("Không thể hiện khóa.");
        return null;
      }
    } catch (err) {
      console.error("revealKey error", err);
      const msg = err?.response?.data?.message || "Hiện khóa thất bại.";
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function copyKey() {
    try {
      let keyToCopy = apiKey;
      if (!keyToCopy) {
        keyToCopy = await revealKey();
        if (!keyToCopy) return;
      }
      await navigator.clipboard.writeText(keyToCopy);
      toast.success("Đã sao chép khóa vào clipboard.");
    } catch (err) {
      console.error("copyKey error", err);
      toast.error("Sao chép thất bại.");
    }
  }

  async function downloadKey() {
    try {
      let keyToDownload = apiKey;
      if (!keyToDownload) {
        keyToDownload = await revealKey();
        if (!keyToDownload) return;
      }
      const blob = new Blob([keyToDownload], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "partner-api-key.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Đã tải xuống file chứa khóa.");
    } catch (err) {
      console.error("downloadKey error", err);
      toast.error("Tải xuống thất bại.");
    }
  }

  function openRotateModal() {
    setRotatePassword("");
    setModalError(null);
    setShowRotateModal(true);
  }
  function closeRotateModal() {
    setShowRotateModal(false);
    setModalLoading(false);
    setModalError(null);
  }

  function copyText(text) {
    try {
      navigator.clipboard.writeText(text);
      toast.success("Đã sao chép.");
    } catch (e) {
      toast.error("Không thể sao chép.");
    }
  }

  async function confirmRotate() {
    if (!rotatePassword) {
      toast.error("Vui lòng nhập mật khẩu.");
      return;
    }
    await generateKey(rotatePassword);
    closeRotateModal();
  }

  // Inline styles
  const buttonStyle = {
    padding: "8px 16px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: "#1976d2",
    border: "1px solid #1976d2",
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    background: "#d32f2f",
    border: "1px solid #d32f2f",
  };

  const inputStyle = {
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(0,0,0,0.3)",
    color: "#fff",
    fontSize: 14,
    width: "100%",
    marginTop: 8,
  };

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  };

  const modalStyle = {
    background: "#1e1e1e",
    padding: 24,
    borderRadius: 8,
    maxWidth: 400,
    width: "90%",
    color: "#fff",
  };

  return (
    <div style={{ color: "#fff", padding: 20 }}>
      <h2 style={{ color: "#fff" }}>Partner API Docs</h2>
      <p style={{ color: "#ddd" }}>
        Tại đây bạn có thể tạo, sao chép, tải xuống, và quay vòng API key của
        partner.
      </p>

      <section style={{ marginTop: 12 }}>
        <h3>Khóa API</h3>

        {loading && <div>Đang tải...</div>}

        {!loading && (
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
              padding: 16,
              borderRadius: 8,
            }}
          >
            {metadata && metadata.exists ? (
              <div>
                <div style={{ marginBottom: 8 }}>
                  Khóa hiện tại:{" "}
                  <strong style={{ fontFamily: "monospace" }}>
                    {apiKey ? apiKey : maskKey(metadata.maskedKey || "")}
                  </strong>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={copyKey}
                    style={buttonStyle}
                    title="Sao chép"
                  >
                    <FiCopy style={{ marginRight: 6 }} /> Sao chép
                  </button>
                  <button
                    onClick={downloadKey}
                    style={buttonStyle}
                    title="Tải xuống"
                  >
                    <FiDownload style={{ marginRight: 6 }} /> Tải xuống
                  </button>
                  <button
                    onClick={openRotateModal}
                    style={dangerButtonStyle}
                    title="Đổi khóa API"
                  >
                    Đổi khóa API
                  </button>
                </div>

                <div style={{ marginTop: 12, color: "#ccc" }}>
                  Tạo lúc:{" "}
                  {metadata.createdAt
                    ? new Date(metadata.createdAt).toLocaleString()
                    : "—"}{" "}
                  • Lần quay vòng cuối:{" "}
                  {metadata.rotatedAt
                    ? new Date(metadata.rotatedAt).toLocaleString()
                    : "—"}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 12 }}>
                  Bạn chưa có khóa API. Nhấn tạo để tạo khóa mới.
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => generateKey()}
                    style={primaryButtonStyle}
                  >
                    Tạo khóa API
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Ví dụ & Links</h3>
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.06)",
            padding: 12,
            borderRadius: 8,
          }}
        >
          <small style={{ color: "#ddd" }}>
            Danh sách endpoint mẫu và ví dụ curl để thử nhanh.
          </small>
          <ul style={{ marginTop: 10, color: "#fff" }}>
            <li style={{ marginBottom: 8 }}>
              <strong>GET</strong> Metadata:
              <a
                href={`${BASE_URL}/api/partner/apikey`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#9ad3ff", marginLeft: 8 }}
              >
                {BASE_URL || ""}/api/partner/apikey
              </a>
              <button
                onClick={() => copyText(`${BASE_URL || ""}/api/partner/apikey`)}
                style={{ ...buttonStyle, marginLeft: 8 }}
              >
                <FiCopy /> Copy
              </button>
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>POST</strong> Tạo / Quay vòng:
              <a
                href={`${BASE_URL}/api/partner/apikey/generate`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#9ad3ff", marginLeft: 8 }}
              >
                {BASE_URL || ""}/api/partner/apikey/generate
              </a>
              <button
                onClick={() =>
                  copyText(`${BASE_URL || ""}/api/partner/apikey/generate`)
                }
                style={{ ...buttonStyle, marginLeft: 8 }}
              >
                <FiCopy /> Copy
              </button>
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>POST</strong> Reveal:
              <a
                href={`${BASE_URL}/api/partner/apikey/reveal`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#9ad3ff", marginLeft: 8 }}
              >
                {BASE_URL || ""}/api/partner/apikey/reveal
              </a>
              <button
                onClick={() =>
                  copyText(`${BASE_URL || ""}/api/partner/apikey/reveal`)
                }
                style={{ ...buttonStyle, marginLeft: 8 }}
              >
                <FiCopy /> Copy
              </button>
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>GET</strong> Public course:
              <code style={{ marginLeft: 8 }}>
                {BASE_URL || ""}/api/partner/public/course/:id
              </code>
              <button
                onClick={() =>
                  copyText(`${BASE_URL || ""}/api/partner/public/course/:id`)
                }
                style={{ ...buttonStyle, marginLeft: 8 }}
              >
                <FiCopy /> Copy
              </button>
            </li>
          </ul>

          <div style={{ marginTop: 10 }}>
            <small style={{ color: "#ddd" }}>Ví dụ curl nhanh:</small>
            <pre
              style={{
                background: "#0b2545",
                padding: 12,
                borderRadius: 6,
                color: "#fff",
                overflowX: "auto",
              }}
            >
              {`# GET metadata (requires Authorization header)
curl -H "Authorization: Bearer <ACCESS_TOKEN>" ${
                BASE_URL || ""
              }/api/partner/apikey

# Rotate (with password):
curl -X POST -H "Authorization: Bearer <ACCESS_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"password": "your_password"}' \\
  ${BASE_URL || ""}/api/partner/apikey/generate`}
            </pre>
          </div>
        </div>
      </section>

      {showRotateModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3>Xác nhận đổi khóa API</h3>
            <p>Vui lòng nhập mật khẩu tài khoản để xác nhận:</p>
            <input
              type="password"
              value={rotatePassword}
              onChange={(e) => setRotatePassword(e.target.value)}
              placeholder="Mật khẩu"
              style={inputStyle}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={confirmRotate} style={primaryButtonStyle}>
                Xác nhận
              </button>
              <button onClick={closeRotateModal} style={buttonStyle}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
