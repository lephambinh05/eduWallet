import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaSync,
  FaTrash,
  FaEye,
  FaCheck,
  FaTimes,
  FaGraduationCap,
  FaLink,
  FaCog,
  FaDownload,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { partnerAPI } from "../../config/api";
import toast from "react-hot-toast";

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #a259ff 0%, #3772ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
  }
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background: ${(props) =>
    props.$variant === "primary"
      ? "linear-gradient(135deg, #a259ff 0%, #3772ff 100%)"
      : props.$variant === "success"
      ? "linear-gradient(135deg, #00c853 0%, #00e676 100%)"
      : "rgba(162, 89, 255, 0.1)"};
  color: white;
  border: ${(props) =>
    props.$variant === "outline"
      ? "1px solid rgba(162, 89, 255, 0.3)"
      : "none"};
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px
      ${(props) =>
        props.$variant === "success"
          ? "rgba(0, 200, 83, 0.3)"
          : "rgba(162, 89, 255, 0.3)"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const Section = styled.div`
  background: rgba(20, 20, 40, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(120, 80, 220, 0.2);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SourceList = styled.div`
  display: grid;
  gap: 1rem;
`;

const SourceCard = styled(motion.div)`
  background: rgba(162, 89, 255, 0.05);
  border: 1px solid rgba(162, 89, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SourceInfo = styled.div`
  flex: 1;
  min-width: 250px;
`;

const SourceName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
`;

const SourceUrl = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  word-break: break-all;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SourceActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) =>
    props.$variant === "danger"
      ? "rgba(255, 59, 48, 0.1)"
      : props.$variant === "success"
      ? "rgba(0, 200, 83, 0.1)"
      : "rgba(162, 89, 255, 0.1)"};
  border: 1px solid
    ${(props) =>
      props.$variant === "danger"
        ? "rgba(255, 59, 48, 0.3)"
        : props.$variant === "success"
        ? "rgba(0, 200, 83, 0.3)"
        : "rgba(162, 89, 255, 0.3)"};
  border-radius: 8px;
  color: ${(props) =>
    props.$variant === "danger"
      ? "#ff3b30"
      : props.$variant === "success"
      ? "#00c853"
      : "#a259ff"};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
    background: ${(props) =>
      props.$variant === "danger"
        ? "rgba(255, 59, 48, 0.2)"
        : props.$variant === "success"
        ? "rgba(0, 200, 83, 0.2)"
        : "rgba(162, 89, 255, 0.2)"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CourseCard = styled(motion.div)`
  background: rgba(162, 89, 255, 0.05);
  border: 1px solid rgba(162, 89, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(162, 89, 255, 0.4);
    box-shadow: 0 8px 24px rgba(162, 89, 255, 0.2);
  }
`;

const CourseTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
`;

const CourseDescription = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CourseFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const CourseStatus = styled.span`
  padding: 0.25rem 0.75rem;
  background: ${(props) =>
    props.$published ? "rgba(0, 200, 83, 0.2)" : "rgba(255, 159, 10, 0.2)"};
  color: ${(props) => (props.$published ? "#00c853" : "#ff9f0a")};
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background: rgba(20, 20, 40, 0.98);
  border: 1px solid rgba(120, 80, 220, 0.3);
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(162, 89, 255, 0.05);
  border: 1px solid rgba(162, 89, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #a259ff;
    box-shadow: 0 0 0 3px rgba(162, 89, 255, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.6);

  svg {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.3;
  }

  p {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }
`;

const PartnerCourses = () => {
  const [sources, setSources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sourcesRes, coursesRes] = await Promise.all([
        partnerAPI.getPartnerSources(),
        partnerAPI.getMyCourses(),
      ]);

      console.log("🔍 Sources Response:", sourcesRes);
      console.log("� Full Response Data:", sourcesRes.data);
      console.log("�📦 Sources Data:", sourcesRes.data?.data?.sources);
      console.log("📝 Courses Data:", coursesRes.data?.data?.courses);

      setSources(sourcesRes.data?.data?.sources || []);
      setCourses(coursesRes.data?.data?.courses || []);

      console.log(
        "✅ State updated - Sources count:",
        sourcesRes.data?.data?.sources?.length
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSource = () => {
    setEditingSource(null);
    setFormData({ name: "", domain: "" });
    setShowSourceModal(true);
  };

  const handleEditSource = (source) => {
    setEditingSource(source);
    setFormData({
      name: source.name,
      domain: source.domain,
    });
    setShowSourceModal(true);
  };

  const handleSaveSource = async () => {
    try {
      if (!formData.name || !formData.domain) {
        toast.error("Vui lòng điền đầy đủ thông tin");
        return;
      }

      if (editingSource) {
        await partnerAPI.updatePartnerSource(editingSource._id, formData);
        toast.success("Cập nhật nguồn thành công");
      } else {
        await partnerAPI.createPartnerSource(formData);
        toast.success("Thêm nguồn thành công");
      }

      setShowSourceModal(false);
      fetchData();
    } catch (error) {
      console.error("Error saving source:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDeleteSource = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa nguồn này?")) return;

    try {
      await partnerAPI.deletePartnerSource(id);
      toast.success("Xóa nguồn thành công");
      fetchData();
    } catch (error) {
      console.error("Error deleting source:", error);
      toast.error("Không thể xóa nguồn");
    }
  };

  const handleSyncCourses = async (sourceId) => {
    try {
      setSyncing(true);
      const response = await partnerAPI.syncCoursesFromSource(sourceId);
      toast.success(
        `Đã đồng bộ ${response.data.synced || 0} khóa học thành công`
      );
      fetchData();
    } catch (error) {
      console.error("Error syncing courses:", error);
      toast.error(
        error.response?.data?.message || "Không thể đồng bộ khóa học"
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleTogglePublish = async (courseId, currentStatus) => {
    try {
      await partnerAPI.toggleCoursePublish(courseId, !currentStatus);
      toast.success(currentStatus ? "Đã ẩn khóa học" : "Đã xuất bản khóa học");
      fetchData();
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast.error("Không thể thay đổi trạng thái");
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: "center", padding: "3rem", color: "white" }}>
          <FaSync className="fa-spin" size={40} />
          <p style={{ marginTop: "1rem" }}>Đang tải...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FaGraduationCap />
          Quản lý Khóa học
        </Title>
        <ButtonGroup>
          <Button $variant="success" onClick={handleAddSource}>
            <FaPlus />
            Thêm Nguồn API
          </Button>
        </ButtonGroup>
      </Header>

      {/* Partner Sources Section */}
      <Section>
        <SectionTitle>
          <FaLink />
          Nguồn API Đối tác
        </SectionTitle>

        {sources.length === 0 ? (
          <EmptyState>
            <FaLink />
            <p>Chưa có nguồn API nào</p>
          </EmptyState>
        ) : (
          <SourceList>
            {sources.map((source) => (
              <SourceCard
                key={source._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SourceInfo>
                  <SourceName>{source.name}</SourceName>
                  <SourceUrl>
                    <FaExternalLinkAlt size={12} />
                    {source.domain}
                  </SourceUrl>
                </SourceInfo>
                <SourceActions>
                  <IconButton
                    $variant="success"
                    onClick={() => handleSyncCourses(source._id)}
                    disabled={syncing}
                    title="Đồng bộ khóa học"
                  >
                    <FaDownload />
                  </IconButton>
                  <IconButton
                    onClick={() => handleEditSource(source)}
                    title="Chỉnh sửa"
                  >
                    <FaCog />
                  </IconButton>
                  <IconButton
                    $variant="danger"
                    onClick={() => handleDeleteSource(source._id)}
                    title="Xóa"
                  >
                    <FaTrash />
                  </IconButton>
                </SourceActions>
              </SourceCard>
            ))}
          </SourceList>
        )}
      </Section>

      {/* Courses Section */}
      <Section>
        <SectionTitle>
          <FaGraduationCap />
          Danh sách Khóa học ({courses.length})
        </SectionTitle>

        {courses.length === 0 ? (
          <EmptyState>
            <FaGraduationCap />
            <p>Chưa có khóa học nào</p>
            <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
              Thêm nguồn API và đồng bộ để lấy khóa học từ web đối tác
            </p>
          </EmptyState>
        ) : (
          <CourseGrid>
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <CourseTitle>{course.title}</CourseTitle>
                <CourseDescription>{course.description}</CourseDescription>
                <CourseFooter>
                  <CourseStatus $published={course.published}>
                    {course.published ? "Đã xuất bản" : "Nháp"}
                  </CourseStatus>
                  <SourceActions>
                    <IconButton
                      $variant={course.published ? "danger" : "success"}
                      onClick={() =>
                        handleTogglePublish(course._id, course.published)
                      }
                      title={course.published ? "Ẩn khóa học" : "Xuất bản"}
                    >
                      {course.published ? <FaTimes /> : <FaCheck />}
                    </IconButton>
                    <IconButton
                      onClick={() => window.open(course.url, "_blank")}
                      title="Xem chi tiết"
                    >
                      <FaEye />
                    </IconButton>
                  </SourceActions>
                </CourseFooter>
              </CourseCard>
            ))}
          </CourseGrid>
        )}
      </Section>

      {/* Add/Edit Source Modal */}
      <AnimatePresence>
        {showSourceModal && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSourceModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalTitle>
                {editingSource ? "Chỉnh sửa Nguồn API" : "Thêm Nguồn API Mới"}
              </ModalTitle>

              <FormGroup>
                <Label>Tên nguồn *</Label>
                <Input
                  type="text"
                  placeholder="VD: Website Partner 1"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label>Domain *</Label>
                <Input
                  type="text"
                  placeholder="VD: partner-website.com"
                  value={formData.domain}
                  onChange={(e) =>
                    setFormData({ ...formData, domain: e.target.value })
                  }
                />
                <small
                  style={{
                    color: "rgba(255, 255, 255, 0.5)",
                    fontSize: "0.85rem",
                    marginTop: "0.5rem",
                    display: "block",
                  }}
                >
                  Chỉ cần nhập domain, hệ thống sẽ tự động tạo API endpoints
                </small>
              </FormGroup>

              <ModalActions>
                <Button
                  $variant="outline"
                  onClick={() => setShowSourceModal(false)}
                  style={{ flex: 1 }}
                >
                  <FaTimes />
                  Hủy
                </Button>
                <Button
                  $variant="primary"
                  onClick={handleSaveSource}
                  style={{ flex: 1 }}
                >
                  <FaCheck />
                  {editingSource ? "Cập nhật" : "Thêm"}
                </Button>
              </ModalActions>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default PartnerCourses;
