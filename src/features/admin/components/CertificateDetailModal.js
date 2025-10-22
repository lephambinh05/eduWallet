import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaCertificate,
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
  FaHashtag,
  FaHistory,
  FaExclamationTriangle,
  FaSpinner,
  FaAward,
  FaGraduationCap
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
  max-width: 900px;
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

const CertIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
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
      case 'verified': return '#4CAF50';
      case 'pending': return '#FFC107';
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
        case 'revoked': return '#F44336';
        case 'created': return '#667eea';
        default: return '#999';
      }
    }};
    border: 3px solid #fff;
    box-shadow: 0 0 0 2px ${props => {
      switch(props.type) {
        case 'verified': return '#4CAF50';
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

const CertificateDetailModal = ({ certificate, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (activeTab === 'activities') {
      fetchActivities();
    }
  }, [activeTab]);

  const fetchActivities = async () => {
    try {
      // Mock activities for now
      setActivities([
        {
          type: 'created',
          action: 'Chứng chỉ được tạo',
          description: `Chứng chỉ ${certificate.certificateId} được cấp bởi ${certificate.issuerName}`,
          timestamp: certificate.issueDate,
          performedBy: 'System'
        },
        {
          type: 'verified',
          action: 'Đã xác thực',
          description: 'Chứng chỉ đã được xác thực trên blockchain',
          timestamp: certificate.verifiedAt || certificate.issueDate,
          performedBy: certificate.verifiedBy || 'Admin'
        }
      ]);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleVerify = async () => {
    if (!window.confirm('Bạn có chắc muốn xác thực chứng chỉ này?')) return;

    try {
      setLoading(true);
      await AdminService.verifyCertificate(certificate._id);
      toast.success('Xác thực chứng chỉ thành công!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error verifying certificate:', error);
      toast.error('Không thể xác thực chứng chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    const reason = window.prompt('Lý do thu hồi chứng chỉ:');
    if (!reason) return;

    try {
      setLoading(true);
      await AdminService.revokeCertificate(certificate._id, { reason });
      toast.success('Thu hồi chứng chỉ thành công!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error revoking certificate:', error);
      toast.error('Không thể thu hồi chứng chỉ');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch(certificate.status) {
      case 'verified': return <FaCheckCircle />;
      case 'pending': return <FaClock />;
      case 'revoked': return <FaBan />;
      case 'expired': return <FaExclamationTriangle />;
      default: return <FaCertificate />;
    }
  };

  const getStatusText = () => {
    switch(certificate.status) {
      case 'verified': return 'Đã xác thực';
      case 'pending': return 'Chờ xác thực';
      case 'revoked': return 'Đã thu hồi';
      case 'expired': return 'Hết hạn';
      default: return 'Không xác định';
    }
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
            <CertIcon>
              <FaCertificate />
            </CertIcon>
            <HeaderInfo>
              <h2>{certificate.courseName || 'Certificate Details'}</h2>
              <p>{certificate.certificateId || 'N/A'}</p>
              <StatusBadge status={certificate.status}>
                {getStatusIcon()}
                {getStatusText()}
              </StatusBadge>
            </HeaderInfo>
          </HeaderContent>
          <CloseButton onClick={onClose} disabled={loading}>
            <FaTimes />
          </CloseButton>
        </Header>

        <Tabs>
          <Tab active={activeTab === 'details'} onClick={() => setActiveTab('details')}>
            <FaBook />
            Chi tiết
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
          {activeTab === 'details' && (
            <>
              <Section>
                <SectionTitle>
                  <FaUser />
                  Thông tin sinh viên
                </SectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <label>Họ tên</label>
                    <p>{certificate.studentName || 'N/A'}</p>
                  </InfoItem>
                  <InfoItem>
                    <label>Địa chỉ ví</label>
                    <p>{certificate.studentAddress ? `${certificate.studentAddress.slice(0, 10)}...${certificate.studentAddress.slice(-8)}` : 'N/A'}</p>
                  </InfoItem>
                </InfoGrid>
              </Section>

              <Section>
                <SectionTitle>
                  <FaBook />
                  Thông tin khóa học
                </SectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <label>Tên khóa học</label>
                    <p>{certificate.courseName || 'N/A'}</p>
                  </InfoItem>
                  <InfoItem>
                    <label>Mã khóa học</label>
                    <p>{certificate.courseCode || 'N/A'}</p>
                  </InfoItem>
                  <InfoItem>
                    <label>Điểm số</label>
                    <p>
                      <FaStar />
                      {certificate.gradeOrScore || 'N/A'}
                    </p>
                  </InfoItem>
                  <InfoItem>
                    <label>Số tín chỉ</label>
                    <p>
                      <FaAward />
                      {certificate.credits || 0} tín chỉ
                    </p>
                  </InfoItem>
                  <InfoItem>
                    <label>Thời lượng</label>
                    <p>
                      <FaClock />
                      {certificate.duration || 0} giờ
                    </p>
                  </InfoItem>
                </InfoGrid>
                {certificate.courseDescription && (
                  <InfoItem style={{ marginTop: '1rem' }}>
                    <label>Mô tả</label>
                    <p>{certificate.courseDescription}</p>
                  </InfoItem>
                )}
              </Section>

              <Section>
                <SectionTitle>
                  <FaUniversity />
                  Cơ sở đào tạo
                </SectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <label>Tên cơ sở</label>
                    <p>{certificate.issuerName || 'N/A'}</p>
                  </InfoItem>
                  <InfoItem>
                    <label>Ngày cấp</label>
                    <p>
                      <FaCalendar />
                      {formatShortDate(certificate.issueDate)}
                    </p>
                  </InfoItem>
                  <InfoItem>
                    <label>Ngày hoàn thành</label>
                    <p>
                      <FaCalendar />
                      {formatShortDate(certificate.completionDate)}
                    </p>
                  </InfoItem>
                </InfoGrid>
              </Section>

              {certificate.skillsCovered && certificate.skillsCovered.length > 0 && (
                <Section>
                  <SectionTitle>
                    <FaGraduationCap />
                    Kỹ năng đạt được
                  </SectionTitle>
                  <SkillsGrid>
                    {certificate.skillsCovered.map((skill, index) => (
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
                    <p>{certificate.tokenId || 'Pending...'}</p>
                  </div>
                  <div>
                    <label>Transaction Hash</label>
                    <p>{certificate.transactionHash ? `${certificate.transactionHash.slice(0, 10)}...${certificate.transactionHash.slice(-8)}` : 'Pending...'}</p>
                  </div>
                  <div>
                    <label>Block Number</label>
                    <p>{certificate.blockNumber || 'Pending...'}</p>
                  </div>
                  <div>
                    <label>Contract Address</label>
                    <p>{certificate.contractAddress ? `${certificate.contractAddress.slice(0, 10)}...${certificate.contractAddress.slice(-8)}` : 'N/A'}</p>
                  </div>
                </BlockchainInfo>
                {certificate.transactionHash && (
                  <ViewOnBlockchain
                    href={`https://mumbai.polygonscan.com/tx/${certificate.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaExternalLinkAlt />
                    Xem trên PolygonScan
                  </ViewOnBlockchain>
                )}
              </BlockchainCard>

              {certificate.status === 'pending' && (
                <Alert type="warning">
                  <FaExclamationTriangle />
                  <div>
                    <strong>Chứng chỉ chưa được xác thực</strong>
                    <p>Chứng chỉ này đang chờ được xác thực trên blockchain.</p>
                  </div>
                </Alert>
              )}

              {certificate.status === 'revoked' && (
                <Alert type="error">
                  <FaBan />
                  <div>
                    <strong>Chứng chỉ đã bị thu hồi</strong>
                    <p>Chứng chỉ này không còn giá trị sử dụng.</p>
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
          {!certificate.isVerified && certificate.status === 'active' && (
            <ActionButton 
              className="verify" 
              onClick={handleVerify}
              disabled={loading}
            >
              {loading ? <FaSpinner className="spin" /> : <FaCheckCircle />}
              Xác thực
            </ActionButton>
          )}
          {certificate.status === 'active' && (
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

export default CertificateDetailModal;
