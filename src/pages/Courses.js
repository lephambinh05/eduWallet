import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { partnerAPI } from "../config/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const Title = styled.h2`
  margin: 0;
  color: #0f172a;
`;

const Search = styled.input`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  width: 320px;
  @media (max-width: 600px) {
    width: 100%;
    margin-top: 8px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 6px 20px rgba(2, 6, 23, 0.04);
`;

const BuyButton = styled.button`
  background: #4f46e5;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
`;

const Courses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async (search = "") => {
    setLoading(true);
    try {
      const res = await partnerAPI.getPublicCourses({
        page: 1,
        limit: 100,
        q: search,
      });
      setCourses(res?.data?.data?.courses || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải khóa học");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const v = e.target.value;
    setQ(v);
    // simple immediate search
    load(v);
  };

  const handleBuy = async (courseId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await partnerAPI.purchaseCourse(courseId);
      toast.success("Mua khóa học thành công");
      // Optionally navigate to enrollments or open access link
    } catch (err) {
      console.error(err);
      toast.error("Mua thất bại");
    }
  };

  return (
    <Container>
      <Header>
        <Title>Khóa học</Title>
        <Search
          value={q}
          onChange={handleSearch}
          placeholder="Tìm kiếm khóa học..."
        />
      </Header>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <Grid>
          {courses.map((c) => (
            <Card key={c._id}>
              <div style={{ fontWeight: 700 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                {c.owner?.username || c.owner?.firstName}
              </div>
              <div style={{ marginTop: 8 }}>{c.description}</div>
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ fontWeight: 700 }}>{c.priceEdu} EDU</div>
                <BuyButton onClick={() => handleBuy(c._id)}>Mua</BuyButton>
              </div>
            </Card>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Courses;
