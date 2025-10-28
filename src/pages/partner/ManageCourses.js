import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { partnerAPI } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  margin: 0;
`;

const FormCard = styled.div`
  background: #fff;
  padding: 18px;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
  margin-bottom: 18px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 12px;
  align-items: start;
  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 6px;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  font-size: 0.95rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  font-size: 0.95rem;
  min-height: 140px;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
`;

const PrimaryButton = styled.button`
  background: #3772ff;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
`;

const SecondaryButton = styled.button`
  background: #f5f6fa;
  color: #333;
  padding: 8px 12px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  cursor: pointer;
`;

const CourseList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
`;

const CourseCard = styled.div`
  background: #fff;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
`;

const Meta = styled.div`
  color: #666;
  font-size: 0.85rem;
  margin-top: 8px;
`;

const Empty = styled.div`
  padding: 18px;
  color: #666;
`;

const ManageCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    link: "",
    priceEdu: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (user && user.role && user.role !== "partner") {
      navigate("/dashboard");
      return;
    }
    fetchCourses();
    // eslint-disable-next-line
  }, [user]);

  const fetchCourses = async () => {
    try {
      const res = await partnerAPI.getMyCourses();
      setCourses(res.data?.data?.courses || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách khóa học");
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.title.trim()) return "Tiêu đề không được để trống";
    if (!form.link.trim()) return "Link khóa học không được để trống";
    if (form.priceEdu === "" || isNaN(Number(form.priceEdu)))
      return "Giá phải là một số";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        link: form.link,
        priceEdu: Number(form.priceEdu),
      };

      const res = await partnerAPI.createCourse(payload);
      if (res?.data?.success) {
        toast.success("Lưu khóa học thành công");
        setForm({ title: "", description: "", link: "", priceEdu: "" });
        fetchCourses();
      } else {
        toast.error(res?.data?.message || "Lỗi khi tạo khóa học");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tạo khóa học");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Quản lý khóa học</Title>
      </Header>

      <FormCard>
        <form onSubmit={handleSubmit}>
          <Grid>
            <div>
              <Field>
                <Label>Tiêu đề</Label>
                <Input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Tiêu đề khóa học"
                />
              </Field>

              <Field style={{ marginTop: 12 }}>
                <Label>Mô tả</Label>
                <TextArea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Mô tả ngắn cho khóa học"
                />
              </Field>

              <Field style={{ marginTop: 12 }}>
                <Label>Link khóa học</Label>
                <Input
                  name="link"
                  value={form.link}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </Field>
            </div>

            <div>
              <Field>
                <Label>Giá (tính theo EDU)</Label>
                <Input
                  name="priceEdu"
                  value={form.priceEdu}
                  onChange={handleChange}
                  placeholder="VD: 10"
                />
              </Field>

              <Actions style={{ marginTop: 18 }}>
                <SecondaryButton
                  type="button"
                  onClick={() =>
                    setForm({
                      title: "",
                      description: "",
                      link: "",
                      priceEdu: "",
                    })
                  }
                >
                  Đặt lại
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Đang lưu..." : "Tạo khóa học"}
                </PrimaryButton>
              </Actions>
            </div>
          </Grid>
        </form>
      </FormCard>

      <div>
        <h3>Danh sách khóa học</h3>
        {courses.length === 0 ? (
          <Empty>Chưa có khóa học nào.</Empty>
        ) : (
          <CourseList>
            {courses.map((c) => (
              <CourseCard key={c._id}>
                <h4 style={{ margin: 0 }}>{c.title}</h4>
                <Meta>
                  {c.priceEdu} EDU •{" "}
                  {new Date(c.createdAt).toLocaleDateString()}
                </Meta>
                <p style={{ marginTop: 8 }}>{c.description}</p>
                <Meta>
                  Link:{" "}
                  <a href={c.link} target="_blank" rel="noreferrer">
                    {c.link}
                  </a>
                </Meta>
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <button
                    onClick={() => window.open(c.link, "_blank")}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "none",
                      background: "#eef2ff",
                      cursor: "pointer",
                    }}
                  >
                    Xem
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await partnerAPI.publishCourse(c._id, !c.isPublished);
                        toast.success(
                          `Khóa học ${!c.isPublished ? "đã xuất bản" : "đã ẩn"}`
                        );
                        fetchCourses();
                      } catch (err) {
                        console.error(err);
                        toast.error("Không thể thay đổi trạng thái xuất bản");
                      }
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "none",
                      background: "#4f46e5",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    {c.isPublished ? "Ẩn" : "Xuất bản"}
                  </button>
                </div>
              </CourseCard>
            ))}
          </CourseList>
        )}
      </div>
    </Container>
  );
};

export default ManageCourses;
