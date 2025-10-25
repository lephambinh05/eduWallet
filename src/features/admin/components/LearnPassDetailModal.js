import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaGraduationCap,
  FaUser,
  FaUniversity,
  FaBook,
  FaCalendar,
  FaStar,
  FaClock,
  FaCheckCircle,
  FaBan,
  FaExternalLinkAlt,
  FaCube,
  FaHistory,
  FaExclamationTriangle,
  FaSpinner,
  FaAward,
  FaPause,
  FaPlay,
  FaEnvelope,
  FaHashtag,
  FaChartLine,
  FaTrophy
} from 'react-icons/fa';
import AdminService from '../services/adminService';
import toast from 'react-hot-toast';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  overflow-y: auto;
`;

const Modal = styled(motion.div)`
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const LPIcon = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
`;

const HeaderInfo = styled.div`
  h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
  }

  p {
    margin: 0;
    opacity: 0.9;
    font-size: 0.95rem;
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusBadge = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${props => {
    switch(props.status) {
      case 'active': return '#4CAF50';
      case 'suspended': return '#FFC107';
      case 'revoked': return '#F44336';
      case 'expired': return '#9E9E9E';
      default: return '#667eea';
    }
  }};
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  margin-right: 0.5rem;
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  background: #f8f9fa;
`;

const Tab = styled.button`
  flex: 1;
  padding: 1rem;
  border: none;
  background: ${props => props.active ? '#fff' : 'transparent'};
  border-bottom: 3px solid ${props => props.active ? '#667eea' : 'transparent'};
  color: ${props => props.active ? '#667eea' : '#666'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: #fff;
    color: #667eea;
  }
`;

const Content = styled.div`
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
`;

const Section = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #667eea;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const InfoItem = styled.div`
  label {
    display: block;
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 0.5rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  p {
    margin: 0;
    font-size: 1rem;
    color: #333;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      color: #667eea;
    }
  }
`;

const ProgressCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
`;

const ProgressStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const ProgressStat = styled.div`
  text-align: center;

  h4 {
    font-size: 2rem;
    margin: 0 0 0.5rem 0;
    font-weight: bold;
  }

  p {
    margin: 0;
    opacity: 0.9;
    font-size: 0.9rem;
  }

  svg {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
`;

const ProgressBar = styled.div`
  margin-top: 1.5rem;
  
  label {
    display: block;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    opacity: 0.9;
  }
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 10px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.percent}%;
  background: #fff;
  border-radius: 10px;
  transition: width 0.5s ease;
`;

const ProgressText = styled.span`
  display: block;
  text-align: right;
  font-size: 1rem;
  font-weight: 700;
  margin-top: 0.5rem;
`;

const CoursesGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const CourseCard = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid ${props => props.completed ? '#4CAF50' : '#FFC107'};
  display: flex;
  justify-content: space-between;
  align-items: center;

  h4 {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    margin: 0;
    color: #666;
    font-size: 0.85rem;
  }
`;

const CourseBadge = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.completed ? '#4CAF50' : '#FFC107'};
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SkillsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const SkillTag = styled.span`
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BlockchainCard = styled.div`
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
`;

const BlockchainInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;

  div {
    label {
      display: block;
      font-size: 0.8rem;
      opacity: 0.8;
      margin-bottom: 0.5rem;
    }

    p {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      word-break: break-all;
    }
  }
`;

const ViewOnBlockchain = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const Timeline = styled.div`
  position: relative;
  padding-left: 2rem;

  &::before {
    content: '';
    position: absolute;
    left: 0.5rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e0e0e0;
  }
`;

const TimelineItem = styled.div`
  position: relative;
  margin-bottom: 1.5rem;

  &::before {
    content: '';
    position: absolute;
    left: -1.6rem;
    top: 0.3rem;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => {
      switch(props.type) {
        case 'verified': return '#4CAF50';
        case 'suspended': return '#FFC107';
        case 'revoked': return '#F44336';
        case 'created': return '#667eea';
        default: return '#999';
      }
    }};
    border: 3px solid #fff;
    box-shadow: 0 0 0 2px ${props => {
      switch(props.type) {
        case 'verified': return '#4CAF50';
        case 'suspended': return '#FFC107';
        case 'revoked': return '#F44336';
        case 'created': return '#667eea';
        default: return '#999';
      }
    }};
  }
`;

const TimelineContent = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid ${props => {
    switch(props.type) {
      case 'verified': return '#4CAF50';
      case 'suspended': return '#FFC107';
      case 'revoked': return '#F44336';
      case 'created': return '#667eea';
      default: return '#999';
    }
  }};

  h4 {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
  }

  time {
    display: block;
    margin-top: 0.5rem;
    color: #999;
    font-size: 0.85rem;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 2px solid #e0e0e0;
  background: #f8f9fa;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.verify {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: #fff;
  }

  &.suspend {
    background: linear-gradient(135deg, #FFC107 0%, #FFB300 100%);
    color: #fff;
  }

  &.reactivate {
    background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
    color: #fff;
  }

  &.revoke {
    background: linear-gradient(135deg, #F44336 0%, #E53935 100%);
    color: #fff;
  }

  &.close {
    background: #fff;
    color: #333;
    border: 2px solid #e0e0e0;
  }
`;

const Alert = styled.div`
  padding: 1rem;
  background: ${props => {
    switch(props.type) {
      case 'warning': return '#FFF3CD';
      case 'error': return '#F8D7DA';
      case 'info': return '#D1ECF1';
      default: return '#D4EDDA';
    }
  }};
  color: ${props => {
    switch(props.type) {
      case 'warning': return '#856404';
      case 'error': return '#721C24';
      case 'info': return '#0C5460';
      default: return '#155724';
    }
  }};
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: start;
  gap: 0.5rem;

  svg {
    flex-shrink: 0;
    margin-top: 0.1rem;
  }
`;

const LearnPassDetailModal = ({ learnPass, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (activeTab === 'activities') {
      fetchActivities();
    }
  }, [activeTab]);

  const fetchActivities = async () => {
    try {
      // Use actual activities from learnPass or mock
      if (learnPass.activities && learnPass.activities.length > 0) {
        setActivities(learnPass.activities);
      } else {
        // Mock activities
        setActivities([
          {
            type: 'created',
            action: 'LearnPass được tạo',
            description: `LearnPass được khởi tạo cho sinh viên ${learnPass.name}`,
            timestamp: learnPass.createdAt,
            performedBy: 'System'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleVerify = async () => {
    if (!window.confirm('Bạn có chắc muốn xác thực LearnPass này?')) return;

    try {
      setLoading(true);
      await AdminService.verifyLearnPass(learnPass._id);
      toast.success('Xác thực LearnPass thành công!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error verifying learnpass:', error);
      toast.error('Không thể xác thực LearnPass');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    const reason = window.prompt('Lý do tạm dừng LearnPass:');
    if (!reason) return;

    try {
      setLoading(true);
      await AdminService.suspendLearnPass(learnPass._id, { reason });
      toast.success('Tạm dừng LearnPass thành công!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error suspending learnpass:', error);
      toast.error('Không thể tạm dừng LearnPass');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!window.confirm('Bạn có chắc muốn kích hoạt lại LearnPass này?')) return;

    try {
      setLoading(true);
      await AdminService.reactivateLearnPass(learnPass._id);
      toast.success('Kích hoạt LearnPass thành công!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error reactivating learnpass:', error);
      toast.error('Không thể kích hoạt LearnPass');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    const reason = window.prompt('Lý do thu hồi LearnPass:');
    if (!reason) return;

    try {
      setLoading(true);
      await AdminService.revokeLearnPass(learnPass._id, { reason });
      toast.success('Thu hồi LearnPass thành công!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error revoking learnpass:', error);
      toast.error('Không thể thu hồi LearnPass');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch(learnPass.status) {
      case 'active': return <FaCheckCircle />;
      case 'suspended': return <FaPause />;
      case 'revoked': return <FaBan />;
      case 'expired': return <FaExclamationTriangle />;
      default: return <FaGraduationCap />;
    }
  };

  const getStatusText = () => {
    switch(learnPass.status) {
      case 'active': return 'Hoạt động';
      case 'suspended': return 'Tạm dừng';
      case 'revoked': return 'Đã thu hồi';
      case 'expired': return 'Hết hạn';
      default: return 'Không xác định';
    }
  };

  const calculateProgress = () => {
    if (!learnPass.academicProgress) return 0;
    const { totalCourses, completedCourses } = learnPass.academicProgress;
    if (!totalCourses) return 0;
    return Math.round((completedCourses / totalCourses) * 100);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('vi-VN');
  };

  const formatShortDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <Modal
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Header>
          <HeaderContent>
            <LPIcon>
              <FaGraduationCap />
            </LPIcon>
            <HeaderInfo>
              <h2>{learnPass.name || 'LearnPass Details'}</h2>
              <p>Mã SV: {learnPass.studentId || 'N/A'}</p>
              <div>
                <StatusBadge status={learnPass.status}>
                  {getStatusIcon()}
                  {getStatusText()}
                </StatusBadge>
                {learnPass.isVerified && (
                  <StatusBadge status="active">
                    <FaCheckCircle />
                    Đã xác thực
                  </StatusBadge>
                )}
              </div>
            </HeaderInfo>
          </HeaderContent>
          <CloseButton onClick={onClose} disabled={loading}>
            <FaTimes />
          </CloseButton>
        </Header>

        <Tabs>
          <Tab active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
            <FaUser />
            Hồ sơ
          </Tab>
          <Tab active={activeTab === 'academic'} onClick={() => setActiveTab('academic')}>
            <FaChartLine />
            Học tập
          </Tab>
          <Tab active={activeTab === 'blockchain'} onClick={() => setActiveTab('blockchain')}>
            <FaCube />
            Blockchain
          </Tab>
          <Tab active={activeTab === 'activities'} onClick={() => setActiveTab('activities')}>
            <FaHistory />
            Lịch sử
          </Tab>
        </Tabs>

        <Content>
          {activeTab === 'profile' && (
            <>
              <Section>
                <SectionTitle>
                  <FaUser />
                  Thông tin sinh viên
                </SectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <label>Họ tên</label>
                    <p>{learnPass.name || 'N/A'}</p>
                  </InfoItem>
                  <InfoItem>
                    <label>Mã sinh viên</label>
                    <p>
                      <FaHashtag />
                      {learnPass.studentId || 'N/A'}
                    </p>
                  </InfoItem>
                  <InfoItem>
                    <label>Email</label>
                    <p>
                      <FaEnvelope />
                      {learnPass.email || 'N/A'}
                    </p>
                  </InfoItem>
                  <InfoItem>
                    <label>Token ID</label>
                    <p>#{learnPass.tokenId || 'N/A'}</p>
                  </InfoItem>
                </InfoGrid>
              </Section>

              <Section>
                <SectionTitle>
                  <FaUniversity />
                  Cơ sở đào tạo
                </SectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <label>Tên cơ sở</label>
                    <p>{learnPass.institutionName || 'N/A'}</p>
                  </InfoItem>
                  <InfoItem>
                    <label>Ngày tạo</label>
                    <p>
                      <FaCalendar />
                      {formatShortDate(learnPass.createdAt)}
                    </p>
                  </InfoItem>
                  {learnPass.verifiedAt && (
                    <InfoItem>
                      <label>Ngày xác thực</label>
                      <p>
                        <FaCheckCircle />
                        {formatShortDate(learnPass.verifiedAt)}
                      </p>
                    </InfoItem>
                  )}
                </InfoGrid>
              </Section>
            </>
          )}

          {activeTab === 'academic' && (
            <>
              <ProgressCard>
                <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaTrophy />
                  Tổng quan học tập
                </h3>
                <ProgressStats>
                  <ProgressStat>
                    <FaBook />
                    <h4>{learnPass.academicProgress?.completedCourses || 0}/{learnPass.academicProgress?.totalCourses || 0}</h4>
                    <p>Khóa học</p>
                  </ProgressStat>
                  <ProgressStat>
                    <FaAward />
                    <h4>{learnPass.academicProgress?.acquiredSkills || 0}/{learnPass.academicProgress?.totalSkills || 0}</h4>
                    <p>Kỹ năng</p>
                  </ProgressStat>
                  <ProgressStat>
                    <FaStar />
                    <h4>{learnPass.academicProgress?.gpa || '0.0'}</h4>
                    <p>GPA</p>
                  </ProgressStat>
                  <ProgressStat>
                    <FaTrophy />
                    <h4>{learnPass.academicProgress?.totalCredits || 0}</h4>
                    <p>Tín chỉ</p>
                  </ProgressStat>
                </ProgressStats>
                <ProgressBar>
                  <label>Tiến độ hoàn thành</label>
                  <ProgressTrack>
                    <ProgressFill percent={calculateProgress()} />
                  </ProgressTrack>
                  <ProgressText>{calculateProgress()}%</ProgressText>
                </ProgressBar>
              </ProgressCard>

              <Section>
                <SectionTitle>
                  <FaBook />
                  Khóa học
                </SectionTitle>
                <CoursesGrid>
                  {learnPass.courses && learnPass.courses.length > 0 ? (
                    learnPass.courses.map((course, index) => (
                      <CourseCard key={index} completed={course.completed}>
                        <div>
                          <h4>
                            <FaBook />
                            {course.name || course.courseName || 'Khóa học'}
                          </h4>
                          <p>{course.code || course.courseCode || 'N/A'} • {course.credits || 0} tín chỉ</p>
                        </div>
                        <CourseBadge completed={course.completed}>
                          {course.completed ? <FaCheckCircle /> : <FaClock />}
                          {course.completed ? 'Hoàn thành' : 'Đang học'}
                        </CourseBadge>
                      </CourseCard>
                    ))
                  ) : (
                    <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>
                      Chưa có khóa học nào
                    </p>
                  )}
                </CoursesGrid>
              </Section>

              {learnPass.skills && learnPass.skills.length > 0 && (
                <Section>
                  <SectionTitle>
                    <FaAward />
                    Kỹ năng đạt được
                  </SectionTitle>
                  <SkillsGrid>
                    {learnPass.skills.map((skill, index) => (
                      <SkillTag key={index}>
                        {skill.name || skill}
                      </SkillTag>
                    ))}
                  </SkillsGrid>
                </Section>
              )}
            </>
          )}

          {activeTab === 'blockchain' && (
            <>
              <BlockchainCard>
                <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaCube />
                  Thông tin Blockchain
                </h3>
                <BlockchainInfo>
                  <div>
                    <label>Token ID</label>
                    <p>{learnPass.tokenId || 'Pending...'}</p>
                  </div>
                  <div>
                    <label>Transaction Hash</label>
                    <p>{learnPass.transactionHash ? `${learnPass.transactionHash.slice(0, 10)}...${learnPass.transactionHash.slice(-8)}` : 'Pending...'}</p>
                  </div>
                  <div>
                    <label>Block Number</label>
                    <p>{learnPass.blockNumber || 'Pending...'}</p>
                  </div>
                  <div>
                    <label>Contract Address</label>
                    <p>{learnPass.contractAddress ? `${learnPass.contractAddress.slice(0, 10)}...${learnPass.contractAddress.slice(-8)}` : 'N/A'}</p>
                  </div>
                </BlockchainInfo>
                {learnPass.transactionHash && (
                  <ViewOnBlockchain
                    href={`https://mumbai.polygonscan.com/tx/${learnPass.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaExternalLinkAlt />
                    Xem trên PolygonScan
                  </ViewOnBlockchain>
                )}
              </BlockchainCard>

              {!learnPass.isVerified && (
                <Alert type="warning">
                  <FaExclamationTriangle />
                  <div>
                    <strong>LearnPass chưa được xác thực</strong>
                    <p>LearnPass này đang chờ được xác thực trên blockchain.</p>
                  </div>
                </Alert>
              )}

              {learnPass.status === 'revoked' && (
                <Alert type="error">
                  <FaBan />
                  <div>
                    <strong>LearnPass đã bị thu hồi</strong>
                    <p>LearnPass này không còn giá trị sử dụng.</p>
                  </div>
                </Alert>
              )}
            </>
          )}

          {activeTab === 'activities' && (
            <Timeline>
              {activities.map((activity, index) => (
                <TimelineItem key={index} type={activity.type}>
                  <TimelineContent type={activity.type}>
                    <h4>{activity.action}</h4>
                    <p>{activity.description}</p>
                    <time>{formatDate(activity.timestamp)}</time>
                    {activity.performedBy && (
                      <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
                        Bởi: {activity.performedBy}
                      </p>
                    )}
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          )}
        </Content>

        <Actions>
          {!learnPass.isVerified && (
            <ActionButton 
              className="verify" 
              onClick={handleVerify}
              disabled={loading}
            >
              {loading ? <FaSpinner className="spin" /> : <FaCheckCircle />}
              Xác thực
            </ActionButton>
          )}
          {learnPass.status === 'active' && (
            <ActionButton 
              className="suspend" 
              onClick={handleSuspend}
              disabled={loading}
            >
              {loading ? <FaSpinner className="spin" /> : <FaPause />}
              Tạm dừng
            </ActionButton>
          )}
          {learnPass.status === 'suspended' && (
            <ActionButton 
              className="reactivate" 
              onClick={handleReactivate}
              disabled={loading}
            >
              {loading ? <FaSpinner className="spin" /> : <FaPlay />}
              Kích hoạt
            </ActionButton>
          )}
          {(learnPass.status === 'active' || learnPass.status === 'suspended') && (
            <ActionButton 
              className="revoke" 
              onClick={handleRevoke}
              disabled={loading}
            >
              {loading ? <FaSpinner className="spin" /> : <FaBan />}
              Thu hồi
            </ActionButton>
          )}
          <ActionButton className="close" onClick={onClose}>
            <FaTimes />
            Đóng
          </ActionButton>
        </Actions>
      </Modal>
    </Overlay>
  );
};

export default LearnPassDetailModal;
