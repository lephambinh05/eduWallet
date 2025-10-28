import React, { useEffect, useState } from "react";
// Layout is provided by the router wrapper in App.js — do not double-wrap pages
import styled from "styled-components";
import { Link } from "react-router-dom";
import { userAPI } from "../config/api";
import toast from "react-hot-toast";

// Simple date formatter
function formatDate(dateInput) {
  if (!dateInput) return "-";
  const d = new Date(dateInput);
  const pad = (n) => String(n).padStart(2, "0");
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(20, 20, 40, 0.06);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 14px 30px rgba(20, 20, 40, 0.12);
  }
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1rem;
`;

const Meta = styled.div`
  font-size: 0.85rem;
  color: #4b5563;
  margin-bottom: 12px;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Button = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: linear-gradient(90deg, #a259ff, #3772ff);
  color: white;
  font-weight: 600;
`;

const HeaderRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Avatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: linear-gradient(135deg, #a259ff, #3772ff);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    font-size: 0.85rem;
  }
`;

const SearchRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  width: 320px;
  @media (max-width: 600px) {
    width: 100%;
  }
`;

const Skeleton = styled.div`
  height: 96px;
  border-radius: 10px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e9ecef 37%, #f3f4f6 63%);
  background-size: 400% 100%;
  animation: shimmer 1.2s linear infinite;
  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const Secondary = styled.button`
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: white;
  cursor: pointer;
`;

// Detail button styling (reuse Button/Secondary)

const Empty = styled.div`
  padding: 32px;
  text-align: center;
  color: #6b7280;
`;

const Pagination = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  margin-top: 18px;
`;

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await userAPI.getMyEnrollments({ page, limit });
        if (cancelled) return;
        setEnrollments(res.data.data.enrollments || []);
        setTotal(res.data.data.total || 0);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError(err?.response?.data?.message || err.message || "Lỗi");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [page]);

  useEffect(() => {
    if (!q) {
      setFiltered(enrollments);
      return;
    }
    const lower = q.toLowerCase();
    setFiltered(
      enrollments.filter((en) => {
        const title = (en.courseTitle || en.itemId?.title || "").toLowerCase();
        const sellerName = (
          en.seller && typeof en.seller === "object"
            ? en.seller.username ||
              `${en.seller.firstName || ""} ${en.seller.lastName || ""}`
            : String(en.seller || "")
        ).toLowerCase();
        return title.includes(lower) || sellerName.includes(lower);
      })
    );
  }, [q, enrollments]);

  const list = q ? filtered : enrollments;

  return (
    <Container>
      <Header>
        <div>
          <h2>Quản lý khóa học của tôi</h2>
          <div style={{ color: "#6b7280" }}>
            Danh sách các khóa bạn đã mua và link truy cập.
          </div>
        </div>
        <div>
          <Link to="/courses">
            <Button>Đi tới Mua khóa học</Button>
          </Link>
        </div>
      </Header>

      {loading && (
        <div>
          <Skeleton style={{ marginBottom: 12 }} />
          <Skeleton style={{ marginBottom: 12 }} />
        </div>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {!loading && !error && (
        <div>
          <SearchRow>
            <SearchInput
              placeholder="Tìm theo tên khóa hoặc người bán..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <div style={{ color: "#6b7280" }}>{total} kết quả</div>
          </SearchRow>

          {list.length === 0 ? (
            <Empty>
              <div>Chưa có khóa học nào.</div>
              <div style={{ marginTop: 12 }}>
                <Link to="/courses">
                  <Button>Khám phá khóa học</Button>
                </Link>
              </div>
            </Empty>
          ) : (
            <>
              <Grid>
                {list.map((e) => (
                  <Card key={e._id}>
                    <HeaderRow>
                      <Avatar>
                        {(e.seller &&
                        typeof e.seller === "object" &&
                        (e.seller.username || e.seller.firstName)
                          ? e.seller.username ||
                            (e.seller.firstName && e.seller.firstName.charAt(0))
                          : e.courseTitle || "-"
                        )
                          .toString()
                          .slice(0, 2)
                          .toUpperCase()}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <Title title={e.courseTitle || e.itemId?.title || "-"}>
                          {e.courseTitle || e.itemId?.title || "-"}
                        </Title>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          {e.createdAt ? formatDate(e.createdAt) : "-"}
                        </div>
                      </div>
                    </HeaderRow>
                    <Meta style={{ marginTop: 10 }}>
                      Người bán:{" "}
                      {typeof e.seller === "object"
                        ? e.seller.username ||
                          (e.seller.firstName && e.seller.lastName
                            ? `${e.seller.firstName} ${e.seller.lastName}`
                            : e.seller.email)
                        : e.seller || (e.itemId?.owner ? e.itemId.owner : "-")}
                    </Meta>

                    <Actions>
                      {/* Course detail button */}
                      {/* Always link to enrollment detail (use enrollment _id) so detail page is reachable */}
                      <Link
                        to={`/my-courses/${e._id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <Button>Chi tiết khóa học</Button>
                      </Link>

                      {/* Access link / copy actions */}
                      {(() => {
                        // build access link with student param as before
                        let original = e.accessLink || "";
                        if (!original && e.itemId) {
                          if (typeof e.itemId === "object" && e.itemId.link) {
                            original = e.itemId.link;
                          } else {
                            const itemId =
                              e.itemId && typeof e.itemId === "object"
                                ? e.itemId._id || e.itemId.id
                                : e.itemId || "";
                            if (itemId) {
                              original = window?.location?.origin
                                ? `${window.location.origin}/marketplace/items/${itemId}`
                                : `/marketplace/items/${itemId}`;
                            }
                          }
                        }

                        const studentId =
                          e.user && typeof e.user === "object"
                            ? e.user._id || e.user.id || ""
                            : e.user || "";
                        let linkWithStudent = original;
                        if (original && studentId) {
                          try {
                            const url = new URL(original);
                            url.searchParams.set("student", studentId);
                            linkWithStudent = url.toString();
                          } catch (err) {
                            const parts = original.split("?");
                            const base = parts[0];
                            const qs = parts[1] || "";
                            const params = qs
                              ? qs
                                  .split("&")
                                  .filter((p) => p && !p.startsWith("student="))
                              : [];
                            params.push(
                              `student=${encodeURIComponent(studentId)}`
                            );
                            linkWithStudent = params.length
                              ? `${base}?${params.join("&")}`
                              : base;
                          }
                        }

                        if (linkWithStudent) {
                          return (
                            <>
                              <a
                                href={linkWithStudent}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Button>Mở khóa học</Button>
                              </a>
                              <Secondary
                                onClick={() => {
                                  navigator.clipboard?.writeText(
                                    linkWithStudent || ""
                                  );
                                  toast.success("Đã sao chép link truy cập");
                                }}
                              >
                                Sao chép link
                              </Secondary>
                            </>
                          );
                        }

                        return <Secondary disabled>Không có link</Secondary>;
                      })()}
                    </Actions>
                  </Card>
                ))}
              </Grid>

              <Pagination>
                <Secondary
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Prev
                </Secondary>
                <div>
                  Trang {page} / {Math.max(1, Math.ceil((total || 0) / limit))}
                </div>
                <Secondary
                  onClick={() => setPage((p) => p + 1)}
                  disabled={
                    page >= Math.max(1, Math.ceil((total || 0) / limit))
                  }
                >
                  Next
                </Secondary>
              </Pagination>
            </>
          )}
        </div>
      )}
    </Container>
  );
};

export default MyCourses;
