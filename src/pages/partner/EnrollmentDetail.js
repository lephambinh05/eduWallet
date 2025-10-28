import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams, Link } from "react-router-dom";
import { userAPI } from "../../config/api";
import toast from "react-hot-toast";

const Container = styled.div`
  padding: 20px;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 6px 20px rgba(2, 6, 23, 0.06);
  margin-bottom: 12px;
`;

const Title = styled.h2`
  margin: 0 0 12px 0;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
`;

const Input = styled.input`
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;

const Button = styled.button`
  background: #4f46e5;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
`;

const Small = styled.div`
  color: #374151;
  font-size: 14px;
  margin-bottom: 6px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
`;
const Th = styled.th`
  text-align: left;
  padding: 8px;
  border-bottom: 1px solid #e5e7eb;
`;
const Td = styled.td`
  padding: 8px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;
const ModalBox = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  width: 420px;
  box-shadow: 0 8px 40px rgba(2, 6, 23, 0.12);
`;
const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
`;

export default function EnrollmentDetailPartner() {
  const { id } = useParams();
  const [enrollment, setEnrollment] = useState(null);
  const [title, setTitle] = useState("");
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editScore, setEditScore] = useState(0);
  const [editingSubmitting, setEditingSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await userAPI.getEnrollment(id);
        if (!mounted) return;
        setEnrollment(res.data.data.enrollment);
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.message || "Không thể tải dữ liệu");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const assessments =
    enrollment &&
    enrollment.metadata &&
    Array.isArray(enrollment.metadata.assessments)
      ? enrollment.metadata.assessments
      : [];

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Nhập tiêu đề mục điểm");
    const n = Number(score);
    if (Number.isNaN(n) || n < 0 || n > 10)
      return toast.error("Điểm phải từ 0 đến 10");
    try {
      setSubmitting(true);
      // create assessment
      await userAPI.addEnrollmentAssessment(id, {
        title: title.trim(),
        score: n,
      });
      // defensive: reload enrollment to ensure we have the latest data
      const fresh = await userAPI.getEnrollment(id);
      setEnrollment(fresh.data.data.enrollment);
      setTitle("");
      setScore(0);
      toast.success("Đã thêm mục điểm");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Thêm mục điểm thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const [statusLoading, setStatusLoading] = useState(false);

  const handleStatusChange = async (e) => {
    const value = e.target.value;
    if (!enrollment) return;
    if (String(enrollment.status) === "completed") {
      return toast.error("Trạng thái đã hoàn thành, không thể thay đổi");
    }
    try {
      setStatusLoading(true);
      const res = await userAPI.updateEnrollmentStatus(id, { status: value });
      setEnrollment(res.data.data.enrollment);
      toast.success("Đã cập nhật trạng thái");
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Cập nhật trạng thái thất bại"
      );
    } finally {
      setStatusLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await userAPI.deleteEnrollmentAssessment(id, deleteTarget.id);
      setEnrollment(res.data.data.enrollment);
      toast.success("Đã xóa mục điểm");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Xóa thất bại");
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  return (
    <Container>
      <Link to="/partner/learners">← Quay lại</Link>
      <Title>
        Quản lý học viên: {enrollment?.courseTitle || enrollment?.itemId?.title}
      </Title>

      {/* Form on top per request */}
      <Card>
        <h4>Thêm / Cập nhật mục điểm</h4>
        <form onSubmit={handleAdd} style={{ marginTop: 6 }}>
          <Field>
            <label>Tiêu đề</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field>
            <label>Điểm (0-10)</label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
          </Field>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Button
              type="submit"
              disabled={
                submitting || String(enrollment?.status) === "completed"
              }
            >
              {submitting ? "Đang thêm..." : "Thêm mục điểm"}
            </Button>
            <Button
              as="button"
              type="button"
              onClick={() => {
                setTitle("");
                setScore(0);
              }}
              style={{ background: "#e5e7eb", color: "#111827" }}
            >
              Hủy
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <Small>
          Học viên:{" "}
          {enrollment?.user?.username ||
            enrollment?.user?.email ||
            enrollment?.user}
        </Small>
        <Small>
          Trạng thái:{" "}
          <select
            value={enrollment?.status || "in_progress"}
            onChange={handleStatusChange}
            disabled={
              String(enrollment?.status) === "completed" || statusLoading
            }
          >
            <option value="in_progress">Đang học</option>
            <option value="expired">Hết hạn</option>
            <option value="completed">Hoàn thành</option>
          </select>
        </Small>
        <Small style={{ marginTop: 8 }}>
          Tổng điểm hiện tại:{" "}
          {enrollment?.totalPoints != null ? enrollment.totalPoints : "-"}
        </Small>

        <div style={{ marginTop: 12 }}>
          <h4>Bảng điểm</h4>
          {assessments.length === 0 ? (
            <Small>Chưa có mục điểm nào.</Small>
          ) : (
            (() => {
              const sorted = [...assessments].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              );
              return (
                <Table>
                  <thead>
                    <tr>
                      <Th>Tiêu đề</Th>
                      <Th>Điểm</Th>
                      <Th>Ngày</Th>
                      <Th>Hành động</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((a) => (
                      <tr key={String(a._id) || `${a.title}-${a.createdAt}`}>
                        <Td>
                          {editingId === String(a._id) ? (
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                            />
                          ) : (
                            <div style={{ fontWeight: 700 }}>{a.title}</div>
                          )}
                        </Td>
                        <Td>
                          {editingId === String(a._id) ? (
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              value={editScore}
                              onChange={(e) => setEditScore(e.target.value)}
                              style={{ width: 100 }}
                            />
                          ) : (
                            `${a.score} / 10`
                          )}
                        </Td>
                        <Td>
                          {a.createdAt
                            ? new Date(a.createdAt).toLocaleString()
                            : "-"}
                        </Td>
                        <Td>
                          {editingId === String(a._id) ? (
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={async () => {
                                  const n = Number(editScore);
                                  if (!editTitle.trim())
                                    return toast.error(
                                      "Tiêu đề không được bỏ trống"
                                    );
                                  if (Number.isNaN(n) || n < 0 || n > 10)
                                    return toast.error("Điểm phải từ 0 đến 10");
                                  try {
                                    setEditingSubmitting(true);
                                    const res =
                                      await userAPI.updateEnrollmentAssessment(
                                        id,
                                        a._id,
                                        { title: editTitle.trim(), score: n }
                                      );
                                    setEnrollment(res.data.data.enrollment);
                                    setEditingId(null);
                                    toast.success("Cập nhật thành công");
                                  } catch (err) {
                                    console.error(err);
                                    toast.error(
                                      err?.response?.data?.message ||
                                        "Cập nhật thất bại"
                                    );
                                  } finally {
                                    setEditingSubmitting(false);
                                  }
                                }}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 8,
                                  border: "none",
                                  background: "#10b981",
                                  color: "white",
                                  cursor: "pointer",
                                }}
                                disabled={editingSubmitting}
                              >
                                {editingSubmitting ? "Đang lưu..." : "Lưu"}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  setEditTitle("");
                                  setEditScore(0);
                                }}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 8,
                                  border: "1px solid #e5e7eb",
                                  background: "white",
                                  cursor: "pointer",
                                }}
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={() => {
                                  if (
                                    String(enrollment?.status) === "completed"
                                  )
                                    return toast.error(
                                      "Không thể sửa khi trạng thái là Hoàn thành"
                                    );
                                  setEditingId(String(a._id));
                                  setEditTitle(a.title || "");
                                  setEditScore(a.score != null ? a.score : 0);
                                }}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 8,
                                  border: "1px solid #e5e7eb",
                                  background: "white",
                                  cursor: "pointer",
                                }}
                                disabled={
                                  String(enrollment?.status) === "completed"
                                }
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    String(enrollment?.status) === "completed"
                                  )
                                    return toast.error(
                                      "Không thể xóa khi trạng thái là Hoàn thành"
                                    );
                                  setShowDeleteModal(true);
                                  setDeleteTarget({
                                    id: a._id,
                                    title: a.title,
                                  });
                                }}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 8,
                                  border: "1px solid #fde68a",
                                  background: "#fff7ed",
                                  cursor: "pointer",
                                }}
                                disabled={
                                  String(enrollment?.status) === "completed"
                                }
                              >
                                Xóa
                              </button>
                            </div>
                          )}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              );
            })()
          )}
        </div>
      </Card>

      {showDeleteModal && (
        <ModalOverlay>
          <ModalBox>
            <div style={{ fontWeight: 700 }}>Xác nhận xóa</div>
            <div style={{ marginTop: 8 }}>
              Bạn có chắc muốn xóa mục điểm "{deleteTarget?.title}" ?
            </div>
            <ModalActions>
              <button
                onClick={cancelDelete}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: "#ef4444",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Xóa
              </button>
            </ModalActions>
          </ModalBox>
        </ModalOverlay>
      )}
    </Container>
  );
}
