import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import { partnerAPI } from "../../config/api";
import toast from "react-hot-toast";

const Container = styled.div`
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
`;

const Title = styled.h2`
  margin: 0;
  color: #ffffff;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 18px;
  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 14px;
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 6px 20px rgba(2, 6, 23, 0.06);
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 90px;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 6px;
`;

const MainCard = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 6px 20px rgba(2, 6, 23, 0.06);
  min-height: 220px;
`;

const RightCol = styled.div``;

const RecentList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const RecentItem = styled.li`
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CTA = styled.a`
  display: block;
  text-align: center;
  margin-top: 12px;
  padding: 12px 16px;
  background: #6d28d9;
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
`;

const PartnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.role && user.role !== "partner") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [coursesRes, salesRes] = await Promise.all([
        partnerAPI.getMyCourses(),
        partnerAPI.getMySales({ page: 1, limit: 1000 }),
      ]);

      const data = coursesRes?.data?.data?.courses || [];
      const sales = salesRes?.data?.data?.sales || [];
      setCourses(data);
      setSales(sales);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const total = courses.length;
    // revenue based on sales totals
    const revenue = (sales || []).reduce(
      (s, p) => s + (Number(p.total) || 0),
      0
    );
    const avg = total ? Math.round(revenue / total) : 0;
    const published = courses.filter((c) => c.isPublished).length || 0;
    return { total, revenue, avg, published };
  }, [courses, sales]);

  const revenueSeries = useMemo(() => {
    const days = 30;
    const now = new Date();
    const series = Array.from({ length: days }).map((_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (days - 1 - i));
      d.setHours(0, 0, 0, 0);
      return { t: d.getTime(), value: 0 };
    });

    // aggregate sales totals per day
    (sales || []).forEach((p) => {
      const t = new Date(p.createdAt).setHours(0, 0, 0, 0);
      const idx = series.findIndex((s) => s.t === t);
      if (idx >= 0) series[idx].value += Number(p.total) || 0;
    });

    return series.map((s) => s.value);
  }, [sales]);

  const chartPoints = useMemo(() => {
    const w = 600;
    const h = 180;
    const vals = revenueSeries;
    const max = Math.max(...vals, 1);
    const step = w / Math.max(1, vals.length - 1);
    const points = vals.map((v, i) => {
      const x = i * step;
      const y = h - (v / max) * (h - 20);
      return `${x},${y}`;
    });
    const area = `0,${h} ${points.join(" ")} ${w},${h}`;
    return { points: points.join(" "), area, w, h };
  }, [revenueSeries]);

  if (user && user.role && user.role !== "partner") return null;

  return (
    <Container>
      <Header>
        <Title>Partner CRM Dashboard</Title>
      </Header>

      <StatGrid>
        <StatCard>
          <StatValue>{loading ? "—" : metrics.total}</StatValue>
          <StatLabel>Tổng số khóa học</StatLabel>
        </StatCard>

        <StatCard>
          <StatValue>{loading ? "—" : `${metrics.revenue} EDU`}</StatValue>
          <StatLabel>Tổng doanh thu (tiềm năng)</StatLabel>
        </StatCard>

        <StatCard>
          <StatValue>{loading ? "—" : `${metrics.avg} EDU`}</StatValue>
          <StatLabel>Giá trung bình / khóa</StatLabel>
        </StatCard>

        <StatCard>
          <StatValue>{loading ? "—" : metrics.published}</StatValue>
          <StatLabel>Đã xuất bản</StatLabel>
        </StatCard>
      </StatGrid>

      <Layout>
        <MainCard>
          <h3>Doanh thu theo ngày (30 ngày)</h3>
          <svg
            width="100%"
            height="220"
            viewBox={`0 0 ${chartPoints.w} ${chartPoints.h}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2"
              points={chartPoints.points}
            />
            <polygon fill="url(#g1)" points={chartPoints.area} />
          </svg>
        </MainCard>

        <RightCol>
          <MainCard>
            <h3>Khóa học mới</h3>
            {loading ? (
              <p>Đang tải...</p>
            ) : courses.length === 0 ? (
              <p>
                Chưa có khóa học. <Link to="/partner/courses">Tạo ngay</Link>
              </p>
            ) : (
              <RecentList>
                {courses.slice(0, 6).map((c) => (
                  <RecentItem key={c._id}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{c.title}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700 }}>{c.priceEdu} EDU</div>
                      <div style={{ fontSize: 12 }}>
                        <a href={c.link} target="_blank" rel="noreferrer">
                          Xem
                        </a>
                      </div>
                    </div>
                  </RecentItem>
                ))}
              </RecentList>
            )}

            <CTA href="/partner/courses">Tạo khóa học mới</CTA>
          </MainCard>
        </RightCol>
      </Layout>
    </Container>
  );
};

export default PartnerDashboard;
