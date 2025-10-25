import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import {
  FaGraduationCap,
  FaCertificate,
  FaMedal,
  FaCopy,
  FaFilter,
} from "react-icons/fa";
import { getCurrentUser } from "../utils/userUtils";
// import portfolioDataFromDB from '../data/portfolioData.json'; // Removed to fix webpack warning
import toast from "react-hot-toast";

const Container = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: #e0e0e0;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: #a259ff;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
`;

const FilterSection = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
`;

const FilterTitle = styled.h3`
  color: #fff;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 0.8rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 1rem;
  outline: none;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const FilterSelect = styled.select`
  padding: 0.8rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 1rem;
  outline: none;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
  }

  option {
    background: #1a1a2e;
    color: #fff;
  }
`;

const PortfolioGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
`;

const PortfolioCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  position: relative;
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const CardIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: ${(props) =>
    props.gradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
`;

const CardInfo = styled.div`
  flex: 1;
`;

const CardTitle = styled.h3`
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const CardIssuer = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const CardDate = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
`;

const CardContent = styled.div`
  margin-bottom: 1rem;
`;

const CardDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const SkillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const SkillTag = styled.span`
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ScoreBadge = styled.div`
  background: ${(props) => {
    if (props.score >= 90) return "rgba(76, 175, 80, 0.2)";
    if (props.score >= 80) return "rgba(255, 193, 7, 0.2)";
    return "rgba(255, 107, 107, 0.2)";
  }};
  color: ${(props) => {
    if (props.score >= 90) return "#4CAF50";
    if (props.score >= 80) return "#ffc107";
    return "#ff6b6b";
  }};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.7);
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 1rem;
`;

const Portfolio = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const loadPortfolioData = async () => {
      const user = getCurrentUser();
      if (user) {
        setCurrentUser(user);

        // Try to load from API first
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_BASE_URL}/api/portfolio/email/${user.email}`
          );
          const apiData = await response.json();

          if (apiData.success) {
            setPortfolioData(apiData.data);
            setFilteredData(apiData.data.courses || []);
            return;
          }
        } catch (error) {
          console.warn("Failed to load from API:", error.message);
        }

        // Show empty portfolio for users without data
        const emptyData = {
          courses: [],
          certificates: [],
          badges: [],
          statistics: {
            gpa: 0,
            totalCourses: 0,
            totalCertificates: 0,
            totalBadges: 0,
            completionRate: 0,
          },
        };
        setPortfolioData(emptyData);
        setFilteredData([]);
      }
    };

    loadPortfolioData();
  }, []);

  useEffect(() => {
    if (!portfolioData) return;

    let data = [];

    // Combine all data types
    if (filterType === "all" || filterType === "course") {
      data = [
        ...data,
        ...(portfolioData.courses || []).map((item) => ({
          ...item,
          type: "course",
        })),
      ];
    }
    if (filterType === "all" || filterType === "certificate") {
      data = [
        ...data,
        ...(portfolioData.certificates || []).map((item) => ({
          ...item,
          type: "certificate",
        })),
      ];
    }
    if (filterType === "all" || filterType === "badge") {
      data = [
        ...data,
        ...(portfolioData.badges || []).map((item) => ({
          ...item,
          type: "badge",
        })),
      ];
    }

    // Apply search filter
    if (searchTerm) {
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.issuer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.skills?.some((skill) =>
            skill.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply category filter
    if (filterCategory !== "all") {
      data = data.filter((item) => item.category === filterCategory);
    }

    setFilteredData(data);
  }, [portfolioData, searchTerm, filterCategory, filterType]);

  const getCardGradient = (type, category) => {
    if (type === "course") {
      return "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)";
    } else if (type === "certificate") {
      return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    } else if (type === "badge") {
      return "linear-gradient(135deg, #ffd700 0%, #ffb347 100%)";
    }
    return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  };

  const getCardIcon = (type) => {
    switch (type) {
      case "course":
        return <FaGraduationCap />;
      case "certificate":
        return <FaCertificate />;
      case "badge":
        return <FaMedal />;
      default:
        return <FaGraduationCap />;
    }
  };

  const handleCopyVerification = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("Đã sao chép link xác thực!");
  };

  if (!currentUser) {
    return (
      <Container>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2 style={{ color: "#fff" }}>Vui lòng đăng nhập để xem Portfolio</h2>
        </div>
      </Container>
    );
  }

  const categories = [
    ...new Set([
      "all",
      ...(portfolioData?.courses?.map((item) => item.category) || []),
      ...(portfolioData?.certificates?.map((item) => item.category) || []),
      ...(portfolioData?.badges?.map((item) => item.category) || []),
    ]),
  ];

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <FaGraduationCap />
          Portfolio
        </Title>
        <Subtitle>
          Bộ sưu tập chứng chỉ, LearnPass và huy hiệu của{" "}
          {currentUser.firstName} {currentUser.lastName}
        </Subtitle>
      </Header>

      {portfolioData && (
        <>
          <StatsGrid>
            <StatCard>
              <StatNumber>{portfolioData.courses?.length || 0}</StatNumber>
              <StatLabel>Khóa học</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{portfolioData.certificates?.length || 0}</StatNumber>
              <StatLabel>Chứng chỉ</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{portfolioData.badges?.length || 0}</StatNumber>
              <StatLabel>Huy hiệu</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{portfolioData.statistics?.gpa || "N/A"}</StatNumber>
              <StatLabel>GPA</StatLabel>
            </StatCard>
          </StatsGrid>

          <FilterSection>
            <FilterTitle>
              <FaFilter />
              Bộ lọc
            </FilterTitle>
            <FilterRow>
              <SearchInput
                type="text"
                placeholder="Tìm kiếm theo tên, issuer hoặc kỹ năng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FilterSelect
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Tất cả loại</option>
                <option value="course">Khóa học</option>
                <option value="certificate">Chứng chỉ</option>
                <option value="badge">Huy hiệu</option>
              </FilterSelect>
              <FilterSelect
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "Tất cả danh mục" : category}
                  </option>
                ))}
              </FilterSelect>
            </FilterRow>
          </FilterSection>

          {filteredData.length > 0 ? (
            <PortfolioGrid>
              {filteredData.map((item, index) => (
                <PortfolioCard
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <CardHeader>
                    <CardIcon
                      gradient={getCardGradient(item.type, item.category)}
                    >
                      {getCardIcon(item.type)}
                    </CardIcon>
                    <CardInfo>
                      <CardTitle>{item.name}</CardTitle>
                      <CardIssuer>{item.issuer}</CardIssuer>
                      <CardDate>
                        {item.issueDate
                          ? new Date(item.issueDate).toLocaleDateString("vi-VN")
                          : "N/A"}
                      </CardDate>
                    </CardInfo>
                  </CardHeader>

                  <CardContent>
                    <CardDescription>{item.description}</CardDescription>

                    {item.skills && (
                      <SkillsContainer>
                        {item.skills.map((skill, skillIndex) => (
                          <SkillTag key={skillIndex}>{skill}</SkillTag>
                        ))}
                      </SkillsContainer>
                    )}
                  </CardContent>

                  <CardFooter>
                    {item.score && (
                      <ScoreBadge score={item.score}>{item.score}%</ScoreBadge>
                    )}

                    {item.verificationUrl && (
                      <ActionButton
                        onClick={() =>
                          handleCopyVerification(item.verificationUrl)
                        }
                      >
                        <FaCopy />
                        Copy Link
                      </ActionButton>
                    )}
                  </CardFooter>
                </PortfolioCard>
              ))}
            </PortfolioGrid>
          ) : (
            <EmptyState>
              <EmptyIcon>
                <FaGraduationCap />
              </EmptyIcon>
              <h3 style={{ color: "#fff", marginBottom: "1rem" }}>
                Không tìm thấy kết quả
              </h3>
              <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </EmptyState>
          )}
        </>
      )}
    </Container>
  );
};

export default Portfolio;
