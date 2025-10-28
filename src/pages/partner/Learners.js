import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { partnerAPI } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h2`
  margin: 0 0 12px 0;
  color: #ffffff;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 6px 20px rgba(2, 6, 23, 0.06);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 8px 6px;
  font-size: 0.9rem;
  color: #374151;
`;

const Td = styled.td`
  padding: 10px 6px;
  border-top: 1px solid #f3f4f6;
  color: #111827;
`;

const Learners = () => {
  const { user } = useAuth();
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (user && user.role && user.role !== "partner") return;
    load(page);
  }, [user, page]);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await partnerAPI.getMyLearners({ page: p, limit: 50 });
      const data = res?.data?.data || {};
      setLearners(data.learners || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách học viên");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Quản lý người học</Title>

      <Card>
        {loading ? (
          <p>Đang tải...</p>
        ) : learners.length === 0 ? (
          <p>Chưa có học viên nào.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Học viên</Th>
                <Th>Khóa học</Th>
                <Th>Ngày mua</Th>
                <Th>Giá (EDU)</Th>
                <Th>Link truy cập</Th>
                <Th>Quản lý</Th>
              </tr>
            </thead>
            <tbody>
              {learners.map((l) => (
                <tr key={l._id}>
                  <Td>
                    {l.user?.firstName || l.user?.username || l.user?.email}
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {l.user?.email}
                    </div>
                  </Td>
                  <Td>{l.courseTitle || l.itemId?.name || l.itemId}</Td>
                  <Td>{new Date(l.createdAt).toLocaleDateString()}</Td>
                  <Td>{l.purchase?.total || "-"}</Td>
                  <Td>
                    {l.accessLink ? (
                      <a href={l.accessLink} target="_blank" rel="noreferrer">
                        Mở khóa học
                      </a>
                    ) : (
                      "-"
                    )}
                  </Td>
                  <Td>
                    {/* Quản lý chuyển tới trang chi tiết enrollment (seller có quyền xem) */}
                    <a
                      href={`/partner/learners/${l._id}`}
                      style={{ color: "#6b21a8", textDecoration: "underline" }}
                    >
                      Quản lý
                    </a>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <div style={{ marginTop: 12 }}>
          <small>
            Tổng: {total} học viên. Trang {page}.
          </small>
        </div>
      </Card>
    </Container>
  );
};

export default Learners;
