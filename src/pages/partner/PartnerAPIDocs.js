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
  const [modalLoading, setModalLoading] = useState(false);
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

  async function handleRotateSubmit(e) {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);
    try {
      if (!rotatePassword) {
        setModalError("Vui lòng nhập mật khẩu tài khoản.");
        setModalLoading(false);
        return;
      }
      await generateKey(rotatePassword);
      setShowRotateModal(false);
    } catch (err) {
      setModalError(err?.response?.data?.message || "Đổi khóa thất bại.");
    } finally {
      setModalLoading(false);
    }
  }

  function copyText(text) {
    try {
      navigator.clipboard.writeText(text);
      toast.success("Đã sao chép.");
    } catch (e) {
      toast.error("Không thể sao chép.");
    }
  }

  const buttonStyle = {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: "#0b74ff",
    border: "1px solid #0b74ff",
  };

  const curlGet = `curl -H "Authorization: Bearer <ACCESS_TOKEN>" ${BASE_URL}/api/partner/apikey`;
  const curlRotate = `curl -X POST -H "Authorization: Bearer <ACCESS_TOKEN>" -H "Content-Type: application/json" -d '{"password":"<PASSWORD>"}' ${BASE_URL}/api/partner/apikey/generate`;

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
                    style={primaryButtonStyle}
                    title="Đổi khóa API KEY"
                  >
                    Đổi khóa API KEY
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 8 }}>Bạn chưa có khóa API.</div>
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

      <section style={{ marginTop: 18 }}>
        <h3>Danh sách API Endpoints</h3>
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.06)",
            padding: 16,
            borderRadius: 8,
          }}
        >
          <p style={{ color: "#ddd", marginBottom: 16 }}>
            Dưới đây là danh sách đầy đủ các API endpoint dành cho Partner:
          </p>

          {/* API Key Management */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ color: "#9ae6ff", marginBottom: 10 }}>
              🔑 Quản lý API Key
            </h4>
            <div style={{ marginLeft: 16 }}>
              <div
                style={{
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div>
                  <strong>GET</strong>{" "}
                  <code
                    style={{
                      color: "#9ae6ff",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /api/partner/apikey
                  </code>
                </div>
                <div style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
                  Lấy metadata của API key (không trả về key thật)
                </div>
                <button
                  onClick={() => copyText(`${BASE_URL}/api/partner/apikey`)}
                  style={{ ...buttonStyle, marginTop: 6, fontSize: 12 }}
                >
                  <FiCopy style={{ marginRight: 4 }} /> Copy
                </button>
              </div>

              <div
                style={{
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div>
                  <strong>POST</strong>{" "}
                  <code
                    style={{
                      color: "#9ae6ff",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /api/partner/apikey/generate
                  </code>
                </div>
                <div style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
                  Tạo mới hoặc đổi API key (yêu cầu password nếu đã có key)
                </div>
                <button
                  onClick={() =>
                    copyText(`${BASE_URL}/api/partner/apikey/generate`)
                  }
                  style={{ ...buttonStyle, marginTop: 6, fontSize: 12 }}
                >
                  <FiCopy style={{ marginRight: 4 }} /> Copy
                </button>
              </div>

              <div
                style={{
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div>
                  <strong>POST</strong>{" "}
                  <code
                    style={{
                      color: "#9ae6ff",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /api/partner/apikey/reveal
                  </code>
                </div>
                <div style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
                  Hiển thị API key đầy đủ (chỉ cho partner đã đăng nhập)
                </div>
                <button
                  onClick={() =>
                    copyText(`${BASE_URL}/api/partner/apikey/reveal`)
                  }
                  style={{ ...buttonStyle, marginTop: 6, fontSize: 12 }}
                >
                  <FiCopy style={{ marginRight: 4 }} /> Copy
                </button>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div>
                  <strong>GET</strong>{" "}
                  <code
                    style={{
                      color: "#9ae6ff",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /api/partner/apikey/validate
                  </code>
                </div>
                <div style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
                  Validate API key và trả về thông tin partner (Public - dùng
                  API key)
                </div>
                <button
                  onClick={() =>
                    copyText(`${BASE_URL}/api/partner/apikey/validate`)
                  }
                  style={{ ...buttonStyle, marginTop: 6, fontSize: 12 }}
                >
                  <FiCopy style={{ marginRight: 4 }} /> Copy
                </button>
              </div>
            </div>
          </div>

          {/* Course Management */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ color: "#9ae6ff", marginBottom: 10 }}>
              📚 Quản lý Khóa học
            </h4>
            <div style={{ marginLeft: 16 }}>
              <div
                style={{
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div>
                  <strong>GET</strong>{" "}
                  <code
                    style={{
                      color: "#9ae6ff",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /api/partner/courses
                  </code>
                </div>
                <div style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
                  Lấy danh sách khóa học của partner (yêu cầu đăng nhập)
                </div>
                <button
                  onClick={() => copyText(`${BASE_URL}/api/partner/courses`)}
                  style={{ ...buttonStyle, marginTop: 6, fontSize: 12 }}
                >
                  <FiCopy style={{ marginRight: 4 }} /> Copy
                </button>
              </div>

              <div
                style={{
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div>
                  <strong>POST</strong>{" "}
                  <code
                    style={{
                      color: "#9ae6ff",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /api/partner/courses
                  </code>
                </div>
                <div style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
                  Tạo khóa học mới
                </div>
                <button
                  onClick={() => copyText(`${BASE_URL}/api/partner/courses`)}
                  style={{ ...buttonStyle, marginTop: 6, fontSize: 12 }}
                >
                  <FiCopy style={{ marginRight: 4 }} /> Copy
                </button>
              </div>

              <div
                style={{
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div>
                  <strong>PATCH</strong>{" "}
                  <code
                    style={{
                      color: "#9ae6ff",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /api/partner/courses/:id/publish
                  </code>
                </div>
                <div style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
                  Publish/unpublish khóa học
                </div>
                <button
                  onClick={() =>
                    copyText(`${BASE_URL}/api/partner/courses/:id/publish`)
                  }
                  style={{ ...buttonStyle, marginTop: 6, fontSize: 12 }}
                >
                  <FiCopy style={{ marginRight: 4 }} /> Copy
                </button>
              </div>

              <div
                style={{
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div>
                  <strong>GET</strong>{" "}
                  <code
                    style={{
                      color: "#9ae6ff",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /api/partner/public/course/:id
                  </code>
                </div>
                <div style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
                  Lấy thông tin chi tiết 1 khóa học (Public - dùng API key)
                </div>
                <button
                  onClick={() =>
                    copyText(`${BASE_URL}/api/partner/public/course/:id`)
                  }
                  style={{ ...buttonStyle, marginTop: 6, fontSize: 12 }}
                >
                  <FiCopy style={{ marginRight: 4 }} /> Copy
                </button>
              </div>

              <div
                style={{
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div>
                  <strong>GET</strong>{" "}
                  <code
                    style={{
                      color: "#9ae6ff",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /api/partner/public-courses
                  </code>
                </div>
                <div style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
                  Danh sách public courses (có search, pagination)
                </div>
                <button
                  onClick={() =>
                    copyText(`${BASE_URL}/api/partner/public-courses`)
                  }
                  style={{ ...buttonStyle, marginTop: 6, fontSize: 12 }}
                >
                  <FiCopy style={{ marginRight: 4 }} /> Copy
                </button>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div>
                  <strong>POST</strong>{" "}
                  <code
                    style={{
                      color: "#9ae6ff",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /api/partner/courses/:id/purchase
                  </code>
                </div>
                <div style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
                  Mua khóa học (yêu cầu đăng nhập)
                </div>
                <button
                  onClick={() =>
                    copyText(`${BASE_URL}/api/partner/courses/:id/purchase`)
                  }
                  style={{ ...buttonStyle, marginTop: 6, fontSize: 12 }}
                >
                  <FiCopy style={{ marginRight: 4 }} /> Copy
                </button>
              </div>
            </div>
          </div>

          {/* Sales & Learners */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ color: "#9ae6ff", marginBottom: 10 }}>
              💰 Doanh số & Học viên
            </h4>
            <div style={{ marginLeft: 16 }}>
              <div
                style={{
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div>
                  <strong>GET</strong>{" "}
                  <code
                    style={{
                      color: "#9ae6ff",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /api/partner/sales
                  </code>
                </div>
                <div style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
                  Lấy danh sách đơn hàng đã bán (pagination)
                </div>
                <button
                  onClick={() => copyText(`${BASE_URL}/api/partner/sales`)}
                  style={{ ...buttonStyle, marginTop: 6, fontSize: 12 }}
                >
                  <FiCopy style={{ marginRight: 4 }} /> Copy
                </button>
              </div>

              <div
                style={{
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div>
                  <strong>GET</strong>{" "}
                  <code
                    style={{
                      color: "#9ae6ff",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /api/partner/learners
                  </code>
                </div>
                <div style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
                  Lấy danh sách học viên (enrollments, pagination)
                </div>
                <button
                  onClick={() => copyText(`${BASE_URL}/api/partner/learners`)}
                  style={{ ...buttonStyle, marginTop: 6, fontSize: 12 }}
                >
                  <FiCopy style={{ marginRight: 4 }} /> Copy
                </button>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div>
                  <strong>GET</strong>{" "}
                  <code
                    style={{
                      color: "#9ae6ff",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /api/partner/my-enrollments
                  </code>
                </div>
                <div style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
                  Lấy danh sách khóa học đã mua của user hiện tại
                </div>
                <button
                  onClick={() =>
                    copyText(`${BASE_URL}/api/partner/my-enrollments`)
                  }
                  style={{ ...buttonStyle, marginTop: 6, fontSize: 12 }}
                >
                  <FiCopy style={{ marginRight: 4 }} /> Copy
                </button>
              </div>
            </div>
          </div>

          {/* Enrollment Progress Tracking */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ color: "#9ae6ff", marginBottom: 10 }}>
              📊 Quản lý Tiến trình Học viên
            </h4>
            <div style={{ marginLeft: 16 }}>
              <div
                style={{
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div>
                  <strong>GET</strong>{" "}
                  <code
                    style={{
                      color: "#9ae6ff",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /api/partner/enrollment/:enrollmentId
                  </code>
                </div>
                <div style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
                  Lấy chi tiết enrollment và tiến trình học tập (yêu cầu partner
                  auth)
                </div>
                <button
                  onClick={() =>
                    copyText(`${BASE_URL}/api/partner/enrollment/:enrollmentId`)
                  }
                  style={{ ...buttonStyle, marginTop: 6, fontSize: 12 }}
                >
                  <FiCopy style={{ marginRight: 4 }} /> Copy
                </button>
              </div>

              <div
                style={{
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div>
                  <strong>PATCH</strong>{" "}
                  <code
                    style={{
                      color: "#9ae6ff",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /api/partner/enrollment/:enrollmentId/progress
                  </code>
                </div>
                <div style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
                  Cập nhật tiến trình học tập của học viên (progressPercent,
                  totalPoints, timeSpentSeconds, status)
                </div>
                <button
                  onClick={() =>
                    copyText(
                      `${BASE_URL}/api/partner/enrollment/:enrollmentId/progress`
                    )
                  }
                  style={{ ...buttonStyle, marginTop: 6, fontSize: 12 }}
                >
                  <FiCopy style={{ marginRight: 4 }} /> Copy
                </button>
              </div>

              <div
                style={{
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div>
                  <strong>GET</strong>{" "}
                  <code
                    style={{
                      color: "#9ae6ff",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /api/partner/courses/:courseId/students
                  </code>
                </div>
                <div style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
                  Xem danh sách học viên trong 1 khóa học cụ thể (kèm tiến trình
                  của từng người)
                </div>
                <button
                  onClick={() =>
                    copyText(
                      `${BASE_URL}/api/partner/courses/:courseId/students`
                    )
                  }
                  style={{ ...buttonStyle, marginTop: 6, fontSize: 12 }}
                >
                  <FiCopy style={{ marginRight: 4 }} /> Copy
                </button>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div>
                  <strong>GET</strong>{" "}
                  <code
                    style={{
                      color: "#9ae6ff",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /api/partner/public/enrollment/student/:studentId
                  </code>
                </div>
                <div style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
                  Lấy thông tin enrollment của học viên (Public - dùng API key,
                  optional ?courseId=)
                </div>
                <button
                  onClick={() =>
                    copyText(
                      `${BASE_URL}/api/partner/public/enrollment/student/:studentId`
                    )
                  }
                  style={{ ...buttonStyle, marginTop: 6, fontSize: 12 }}
                >
                  <FiCopy style={{ marginRight: 4 }} /> Copy
                </button>
              </div>
            </div>
          </div>

          {/* Completed Courses */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ color: "#9ae6ff", marginBottom: 10 }}>
              📚 Khóa học Hoàn thành
            </h4>
            <div style={{ marginLeft: 16 }}>
              <div
                style={{
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div>
                  <strong>GET</strong>{" "}
                  <code
                    style={{
                      color: "#9ae6ff",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /api/partner/completed-courses/:userId
                  </code>
                </div>
                <div style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
                  Lấy danh sách khóa học đã hoàn thành của user (format chuẩn
                  với score, grade, skills, etc.)
                </div>
                <button
                  onClick={() =>
                    copyText(
                      `${BASE_URL}/api/partner/completed-courses/:userId`
                    )
                  }
                  style={{ ...buttonStyle, marginTop: 6, fontSize: 12 }}
                >
                  <FiCopy style={{ marginRight: 4 }} /> Copy
                </button>
              </div>

              <div
                style={{
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div>
                  <strong>GET</strong>{" "}
                  <code
                    style={{
                      color: "#9ae6ff",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /api/partner/public/completed-courses/user/:userId
                  </code>
                </div>
                <div style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
                  Lấy completed courses (Public API - dùng API key, chỉ trả về
                  courses do partner này phát hành)
                </div>
                <button
                  onClick={() =>
                    copyText(
                      `${BASE_URL}/api/partner/public/completed-courses/user/:userId`
                    )
                  }
                  style={{ ...buttonStyle, marginTop: 6, fontSize: 12 }}
                >
                  <FiCopy style={{ marginRight: 4 }} /> Copy
                </button>
              </div>

              <div
                style={{
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div>
                  <strong>POST</strong>{" "}
                  <code
                    style={{
                      color: "#9ae6ff",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /api/partner/enrollment/:enrollmentId/complete
                  </code>
                </div>
                <div style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
                  Đánh dấu enrollment hoàn thành và tạo CompletedCourse record
                  (với category, level, credits, grade, skills)
                </div>
                <button
                  onClick={() =>
                    copyText(
                      `${BASE_URL}/api/partner/enrollment/:enrollmentId/complete`
                    )
                  }
                  style={{ ...buttonStyle, marginTop: 6, fontSize: 12 }}
                >
                  <FiCopy style={{ marginRight: 4 }} /> Copy
                </button>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div>
                  <strong>PATCH</strong>{" "}
                  <code
                    style={{
                      color: "#9ae6ff",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /api/partner/completed-course/:courseId
                  </code>
                </div>
                <div style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
                  Cập nhật thông tin chi tiết của completed course (description,
                  category, level, credits, grade, score, skills, etc.)
                </div>
                <button
                  onClick={() =>
                    copyText(
                      `${BASE_URL}/api/partner/completed-course/:courseId`
                    )
                  }
                  style={{ ...buttonStyle, marginTop: 6, fontSize: 12 }}
                >
                  <FiCopy style={{ marginRight: 4 }} /> Copy
                </button>
              </div>
            </div>
          </div>

          {/* Example curl commands */}
          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <h4 style={{ color: "#9ae6ff", marginBottom: 10 }}>
              💡 Ví dụ CURL
            </h4>
            <div style={{ fontSize: 13, color: "#bbb", marginBottom: 8 }}>
              Lấy metadata API key:
            </div>
            <pre
              style={{
                background: "#021024",
                color: "#9ae6ff",
                padding: 12,
                borderRadius: 6,
                overflowX: "auto",
                fontSize: 12,
              }}
            >
              {curlGet}
            </pre>

            <div
              style={{
                fontSize: 13,
                color: "#bbb",
                marginBottom: 8,
                marginTop: 12,
              }}
            >
              Đổi API key (với password):
            </div>
            <pre
              style={{
                background: "#021024",
                color: "#9ae6ff",
                padding: 12,
                borderRadius: 6,
                overflowX: "auto",
                fontSize: 12,
              }}
            >
              {curlRotate}
            </pre>

            <div
              style={{
                fontSize: 13,
                color: "#bbb",
                marginBottom: 8,
                marginTop: 12,
              }}
            >
              Validate API key:
            </div>
            <pre
              style={{
                background: "#021024",
                color: "#9ae6ff",
                padding: 12,
                borderRadius: 6,
                overflowX: "auto",
                fontSize: 12,
              }}
            >
              {`curl -H "X-Partner-API-Key: YOUR_API_KEY" ${BASE_URL}/api/partner/apikey/validate`}
            </pre>

            <div
              style={{
                fontSize: 13,
                color: "#bbb",
                marginBottom: 8,
                marginTop: 12,
              }}
            >
              Lấy thông tin khóa học (dùng API key):
            </div>
            <pre
              style={{
                background: "#021024",
                color: "#9ae6ff",
                padding: 12,
                borderRadius: 6,
                overflowX: "auto",
                fontSize: 12,
              }}
            >
              {`curl -H "X-Partner-API-Key: YOUR_API_KEY" ${BASE_URL}/api/partner/public/course/COURSE_ID`}
            </pre>

            <div
              style={{
                fontSize: 13,
                color: "#bbb",
                marginBottom: 8,
                marginTop: 12,
              }}
            >
              Cập nhật tiến trình học viên:
            </div>
            <pre
              style={{
                background: "#021024",
                color: "#9ae6ff",
                padding: 12,
                borderRadius: 6,
                overflowX: "auto",
                fontSize: 12,
              }}
            >
              {`curl -X PATCH -H "Authorization: Bearer <ACCESS_TOKEN>" -H "Content-Type: application/json" -d '{"progressPercent":85,"totalPoints":950,"timeSpentSeconds":4200,"status":"in_progress"}' ${BASE_URL}/api/partner/enrollment/ENROLLMENT_ID/progress`}
            </pre>

            <div
              style={{
                fontSize: 13,
                color: "#bbb",
                marginBottom: 8,
                marginTop: 12,
              }}
            >
              Xem học viên trong khóa học:
            </div>
            <pre
              style={{
                background: "#021024",
                color: "#9ae6ff",
                padding: 12,
                borderRadius: 6,
                overflowX: "auto",
                fontSize: 12,
              }}
            >
              {`curl -H "Authorization: Bearer <ACCESS_TOKEN>" ${BASE_URL}/api/partner/courses/COURSE_ID/students?page=1&limit=50`}
            </pre>
          </div>
        </div>
      </section>

      {/* Rotate modal */}
      {showRotateModal && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              color: "#000",
              padding: 20,
              borderRadius: 8,
              width: 420,
            }}
          >
            <h4>Quay vòng khóa API</h4>
            <p>Vui lòng nhập mật khẩu để xác thực hành động.</p>
            <form onSubmit={handleRotateSubmit}>
              <div style={{ marginBottom: 8 }}>
                <input
                  type="password"
                  value={rotatePassword}
                  onChange={(e) => setRotatePassword(e.target.value)}
                  placeholder="Mật khẩu tài khoản"
                  style={{ width: "100%", padding: 8 }}
                />
              </div>
              {modalError && (
                <div style={{ color: "red", marginBottom: 8 }}>
                  {modalError}
                </div>
              )}
              <div
                style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
              >
                <button
                  type="button"
                  onClick={closeRotateModal}
                  style={buttonStyle}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={primaryButtonStyle}
                  disabled={modalLoading}
                >
                  {modalLoading ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
