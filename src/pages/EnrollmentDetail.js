import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { useParams, Link } from "react-router-dom";
import { userAPI } from "../config/api";
import toast from "react-hot-toast";
import { FaExternalLinkAlt, FaCopy } from "react-icons/fa";

const Container = styled.div`
  padding: 20px;
  max-width: 1100px;
  margin: 0 auto;
`;

const Back = styled(Link)`
  display: inline-block;
  color: #374151;
  margin-bottom: 14px;
  text-decoration: none;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 18px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 10px 30px rgba(2, 6, 23, 0.06);
`;

const Header = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
`;

const CourseTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
`;

const Small = styled.div`
  color: #6b7280;
  font-size: 0.9rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 12px;
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  background: linear-gradient(90deg, #f8fafc, #ffffff);
  border-radius: 10px;
  padding: 12px;
  text-align: center;
`;

const StatLabel = styled.div`
  color: #6b7280;
  font-size: 0.85rem;
`;

const StatValue = styled.div`
  font-weight: 700;
  margin-top: 6px;
`;

const ProgressWrap = styled.div`
  margin-top: 18px;
`;

const ProgressBarOuter = styled.div`
  width: 100%;
  background: #f3f4f6;
  height: 14px;
  border-radius: 8px;
  overflow: hidden;
`;

const ProgressBarInner = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #6ee7b7, #3b82f6);
  width: ${(p) => p.percent}%;
  transition: width 600ms ease;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 14px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  background: #111827;
  color: white;
  border: none;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  gap: 8px;
  align-items: center;
`;

const Secondary = styled.button`
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  gap: 8px;
  align-items: center;
`;

const RightColumn = styled.div``;

// Small SVG circular progress ring
function ProgressRing({ percent = 0, size = 120, stroke = 10 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (percent / 100) * circumference;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="g1" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#eef2ff"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="url(#g1)"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${dash} ${circumference - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size * 0.18}
        fill="#0f172a"
        fontWeight={700}
      >
        {Math.round(percent)}%
      </text>
    </svg>
  );
}

// Simple bar chart: takes array of numbers 0-100
function BarChart({ values = [], height = 120 }) {
  const max = Math.max(...values, 100);
  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${values.length * 28} ${height}`}
    >
      {values.map((v, i) => {
        const w = 18;
        const gap = 10;
        const x = i * (w + gap) + 6;
        const h = (v / max) * (height - 10);
        return (
          <g key={i}>
            <rect
              x={x}
              y={height - h - 12}
              width={w}
              height={h}
              rx={4}
              fill={v >= 100 ? "#10b981" : "#3b82f6"}
            />
            <text
              x={x + w / 2}
              y={height - 2}
              fontSize={10}
              textAnchor="middle"
              fill="#374151"
            >
              {Math.round(v)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function formatTime(s) {
  if (!s) return "0s";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function mapStatus(status) {
  switch ((status || "").toString()) {
    case "in_progress":
      return "Đang học";
    case "completed":
      return "Đã hoàn thành";
    case "expired":
      return "Hết hạn";
    default:
      // fallback: capitalize and replace underscore
      return String(status || "-")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

export default function EnrollmentDetail() {
  const { id } = useParams();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await userAPI.getEnrollment(id);
        if (cancelled) return;
        setEnrollment(res.data.data.enrollment);
      } catch (err) {
        console.error(err);
        toast.error(
          err?.response?.data?.message || err.message || "Lỗi load enrollment"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => (cancelled = true);
  }, [id]);

  const { percent, points, time, student, item, seller } = useMemo(() => {
    if (!enrollment)
      return {
        percent: null,
        points: null,
        time: null,
        student: null,
        item: null,
        seller: null,
      };
    return {
      // do not fallback to 0; treat missing as null so UI can show 'no data'
      percent:
        enrollment.progressPercent != null ? enrollment.progressPercent : null,
      points: enrollment.totalPoints != null ? enrollment.totalPoints : null,
      time:
        enrollment.timeSpentSeconds != null
          ? enrollment.timeSpentSeconds
          : null,
      student: enrollment.user,
      item: enrollment.itemId,
      seller: enrollment.seller,
    };
  }, [enrollment]);

  const moduleProgress = useMemo(() => {
    // Only use explicit per-module data when provided in metadata.
    // Do NOT synthesize fallback data here.
    const meta = enrollment?.metadata || {};
    if (Array.isArray(meta.progressByModule) && meta.progressByModule.length) {
      return meta.progressByModule.map((v) =>
        Math.max(0, Math.min(100, Number(v) || 0))
      );
    }
    return null;
  }, [enrollment]);

  if (loading) return <Container>Đang tải...</Container>;
  if (!enrollment) return <Container>Không tìm thấy enrollment</Container>;

  return (
    <Container>
      <Back to="/my-courses">← Quay lại</Back>
      <Grid>
        <div>
          <Card>
            <Header>
              <CourseTitle>
                {enrollment.courseTitle || item?.title || "Khóa học"}
              </CourseTitle>
            </Header>

            <Small>
              Người học:{" "}
              {student?.username || student?.email || enrollment.user} • Người
              bán: {seller?.username || seller?.email || enrollment.seller}
            </Small>

            <StatsGrid>
              <StatCard>
                <StatLabel>Trạng thái</StatLabel>
                <StatValue>{mapStatus(enrollment.status)}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Tổng điểm</StatLabel>
                <StatValue>{points}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Thời gian</StatLabel>
                <StatValue>{formatTime(time)}</StatValue>
              </StatCard>
            </StatsGrid>

            <ProgressWrap>
              {percent == null ? (
                <Small>Không có dữ liệu tiến trình</Small>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>Tiến trình học</div>
                      <Small>{Math.round(percent)}% hoàn thành</Small>
                    </div>
                    <ProgressBarOuter>
                      <ProgressBarInner
                        percent={Math.max(0, Math.min(100, percent))}
                      />
                    </ProgressBarOuter>
                  </div>

                  <div style={{ width: 120, textAlign: "center" }}>
                    <ProgressRing percent={percent} size={100} stroke={10} />
                  </div>
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>
                  Tiến độ theo chương
                </div>
                <Card style={{ padding: 12 }}>
                  {moduleProgress && moduleProgress.length ? (
                    <BarChart values={moduleProgress} height={110} />
                  ) : (
                    <Small>Không có dữ liệu tiến độ theo chương</Small>
                  )}
                </Card>
              </div>
            </ProgressWrap>

            <Actions>
              {enrollment.accessLink ? (
                <>
                  <a
                    href={enrollment.accessLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button>
                      <FaExternalLinkAlt /> Mở khóa học
                    </Button>
                  </a>
                  <Secondary
                    onClick={() => {
                      navigator.clipboard?.writeText(enrollment.accessLink);
                      toast.success("Đã sao chép link truy cập");
                    }}
                  >
                    <FaCopy /> Sao chép link
                  </Secondary>
                </>
              ) : (
                <Secondary disabled>Không có link</Secondary>
              )}
            </Actions>
          </Card>
        </div>

        <RightColumn>
          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  Thông tin đăng ký
                </div>
                <div style={{ fontWeight: 700, marginTop: 6 }}>
                  {enrollment._id}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Ngày mua</div>
              <div style={{ marginTop: 6 }}>
                {new Date(enrollment.createdAt).toLocaleString()}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Lần truy cập cuối
              </div>
              <div style={{ marginTop: 6 }}>
                {enrollment.lastAccessed
                  ? new Date(enrollment.lastAccessed).toLocaleString()
                  : "-"}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Hoàn thành</div>
              <div style={{ marginTop: 6 }}>
                {enrollment.completedAt
                  ? new Date(enrollment.completedAt).toLocaleString()
                  : "Chưa hoàn thành"}
              </div>
            </div>
          </Card>
        </RightColumn>
      </Grid>
    </Container>
  );
}
