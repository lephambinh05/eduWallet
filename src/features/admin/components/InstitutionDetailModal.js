import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaUniversity, 
  FaEnvelope, 
  FaPhone, 
  FaGlobe,
  FaMapMarkerAlt,
  FaCalendar,
  FaCheckCircle,
  FaTimesCircle,
  FaUserShield,
  FaCertificate,
  FaUsers,
  FaIdCard,
  FaInfoCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import AdminService from '../services/adminService';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const Modal = styled(motion.div)`
  background: white;
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
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: start;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const HeaderLeft = styled.div`
  display: flex;
  gap: 1rem;
  align-items: start;
  flex: 1;
`;

const InstitutionLogo = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: ${props => props.logo ? `url(${props.logo})` : 'rgba(255, 255, 255, 0.2)'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.3);
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const InstitutionName = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
`;

const InstitutionId = styled.div`
  font-family: monospace;
  opacity: 0.9;
  font-size: 0.95rem;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-top: 0.5rem;
  background: ${props => {
    if (props.status === 'verified') return 'rgba(16, 185, 129, 0.2)';
    if (props.status === 'pending') return 'rgba(245, 158, 11, 0.2)';
    if (props.status === 'rejected') return 'rgba(239, 68, 68, 0.2)';
    return 'rgba(107, 114, 128, 0.2)';
  }};
  border: 2px solid ${props => {
    if (props.status === 'verified') return '#10b981';
    if (props.status === 'pending') return '#f59e0b';
    if (props.status === 'rejected') return '#ef4444';
    return '#6b7280';
  }};
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }

  svg {
    font-size: 1.25rem;
  }
`;

const Content = styled.div`
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
`;

const Tab = styled.button`
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  color: ${props => props.active ? '#667eea' : '#6b7280'};
  font-weight: 600;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    color: #667eea;
  }

  ${props => props.active && `
    &:after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  `}
`;

const Section = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1f2937;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;

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
    color: #6b7280;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    color: #1f2937;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      color: #9ca3af;
    }
  }
`;

const DescriptionBox = styled.div`
  background: #f9fafb;
  border-left: 4px solid #667eea;
  padding: 1rem;
  border-radius: 8px;
  color: #374151;
  line-height: 1.6;
`;

const TypeBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: capitalize;
`;

const Footer = styled.div`
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: #f9fafb;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => props.variant === 'approve' && `
    background: #10b981;
    color: white;
    &:hover {
      background: #059669;
      transform: translateY(-2px);
    }
  `}

  ${props => props.variant === 'reject' && `
    background: #ef4444;
    color: white;
    &:hover {
      background: #dc2626;
      transform: translateY(-2px);
    }
  `}

  ${props => props.variant === 'secondary' && `
    background: #6b7280;
    color: white;
    &:hover {
      background: #4b5563;
      transform: translateY(-2px);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const VerificationInfo = styled.div`
  background: ${props => props.verified ? '#d1fae5' : '#fef3c7'};
  border: 2px solid ${props => props.verified ? '#10b981' : '#f59e0b'};
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: start;
  gap: 1rem;
  margin-top: 1rem;

  svg {
    font-size: 1.5rem;
    color: ${props => props.verified ? '#059669' : '#d97706'};
    flex-shrink: 0;
  }

  .info {
    flex: 1;

    .title {
      font-weight: 600;
      color: ${props => props.verified ? '#065f46' : '#92400e'};
      margin-bottom: 0.25rem;
    }

    .details {
      font-size: 0.9rem;
      color: ${props => props.verified ? '#047857' : '#b45309'};
    }
  }
`;

const InstitutionDetailModal = ({ institution, isOpen, onClose, onInstitutionUpdated }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && institution) {
      setActiveTab('details');
    }
  }, [isOpen, institution]);

  if (!isOpen || !institution) return null;

  const handleApprove = async () => {
    setLoading(true);
    try {
      const response = await AdminService.approveInstitution(institution._id);
      
      if (response.success) {
        toast.success('Institution approved successfully');
        onInstitutionUpdated?.();
        onClose();
      }
    } catch (error) {
      console.error('Error approving institution:', error);
      toast.error(error.response?.data?.message || 'Failed to approve institution');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const confirmed = window.confirm('Are you sure you want to reject this institution?');
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await AdminService.rejectInstitution(institution._id);
      
      if (response.success) {
        toast.success('Institution rejected');
        onInstitutionUpdated?.();
        onClose();
      }
    } catch (error) {
      console.error('Error rejecting institution:', error);
      toast.error(error.response?.data?.message || 'Failed to reject institution');
    } finally {
      setLoading(false);
    }
  };

  const getStatus = () => {
    if (institution.rejectedAt) return 'rejected';
    if (institution.isVerified) return 'verified';
    return 'pending';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const status = getStatus();

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <Modal
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Header>
            <HeaderLeft>
              <InstitutionLogo logo={institution.logo}>
                {!institution.logo && institution.name?.charAt(0)}
              </InstitutionLogo>
              <HeaderInfo>
                <InstitutionName>{institution.name}</InstitutionName>
                <InstitutionId>{institution.institutionId}</InstitutionId>
                <StatusBadge status={status}>{status}</StatusBadge>
              </HeaderInfo>
            </HeaderLeft>
            <CloseButton onClick={onClose}>
              <FaTimes />
            </CloseButton>
          </Header>

          <Content>
            <TabContainer>
              <Tab active={activeTab === 'details'} onClick={() => setActiveTab('details')}>
                Details
              </Tab>
              <Tab active={activeTab === 'verification'} onClick={() => setActiveTab('verification')}>
                Verification
              </Tab>
            </TabContainer>

            {activeTab === 'details' && (
              <>
                <Section>
                  <SectionTitle>
                    <FaInfoCircle />
                    Basic Information
                  </SectionTitle>
                  <InfoGrid>
                    <InfoItem>
                      <label>Institution Type</label>
                      <div className="value">
                        <TypeBadge>{institution.type?.replace('_', ' ')}</TypeBadge>
                      </div>
                    </InfoItem>
                    <InfoItem>
                      <label>Education Level</label>
                      <div className="value">
                        <TypeBadge>{institution.level?.replace('_', ' ')}</TypeBadge>
                      </div>
                    </InfoItem>
                    <InfoItem>
                      <label>Email</label>
                      <div className="value">
                        <FaEnvelope />
                        {institution.email}
                      </div>
                    </InfoItem>
                    {institution.phone && (
                      <InfoItem>
                        <label>Phone</label>
                        <div className="value">
                          <FaPhone />
                          {institution.phone}
                        </div>
                      </InfoItem>
                    )}
                    {institution.website && (
                      <InfoItem>
                        <label>Website</label>
                        <div className="value">
                          <FaGlobe />
                          <a href={institution.website} target="_blank" rel="noopener noreferrer">
                            {institution.website}
                          </a>
                        </div>
                      </InfoItem>
                    )}
                    <InfoItem>
                      <label>Registration Date</label>
                      <div className="value">
                        <FaCalendar />
                        {formatDate(institution.createdAt)}
                      </div>
                    </InfoItem>
                  </InfoGrid>
                </Section>

                {institution.description && (
                  <Section>
                    <SectionTitle>
                      <FaUniversity />
                      Description
                    </SectionTitle>
                    <DescriptionBox>{institution.description}</DescriptionBox>
                  </Section>
                )}

                {institution.address && (
                  <Section>
                    <SectionTitle>
                      <FaMapMarkerAlt />
                      Address
                    </SectionTitle>
                    <InfoGrid>
                      {institution.address.street && (
                        <InfoItem>
                          <label>Street</label>
                          <div className="value">{institution.address.street}</div>
                        </InfoItem>
                      )}
                      {institution.address.city && (
                        <InfoItem>
                          <label>City</label>
                          <div className="value">{institution.address.city}</div>
                        </InfoItem>
                      )}
                      {institution.address.state && (
                        <InfoItem>
                          <label>State/Province</label>
                          <div className="value">{institution.address.state}</div>
                        </InfoItem>
                      )}
                      {institution.address.country && (
                        <InfoItem>
                          <label>Country</label>
                          <div className="value">{institution.address.country}</div>
                        </InfoItem>
                      )}
                      {institution.address.postalCode && (
                        <InfoItem>
                          <label>Postal Code</label>
                          <div className="value">{institution.address.postalCode}</div>
                        </InfoItem>
                      )}
                    </InfoGrid>
                  </Section>
                )}
              </>
            )}

            {activeTab === 'verification' && (
              <>
                <Section>
                  <SectionTitle>
                    <FaUserShield />
                    Verification Status
                  </SectionTitle>
                  
                  {institution.isVerified && (
                    <VerificationInfo verified={true}>
                      <FaCheckCircle />
                      <div className="info">
                        <div className="title">Verified Institution</div>
                        <div className="details">
                          Verified on {formatDate(institution.verifiedAt)}
                        </div>
                      </div>
                    </VerificationInfo>
                  )}

                  {!institution.isVerified && !institution.rejectedAt && (
                    <VerificationInfo verified={false}>
                      <FaInfoCircle />
                      <div className="info">
                        <div className="title">Pending Verification</div>
                        <div className="details">
                          This institution is awaiting approval. Please review all details carefully.
                        </div>
                      </div>
                    </VerificationInfo>
                  )}

                  {institution.rejectedAt && (
                    <VerificationInfo verified={false}>
                      <FaTimesCircle />
                      <div className="info">
                        <div className="title">Verification Rejected</div>
                        <div className="details">
                          Rejected on {formatDate(institution.rejectedAt)}
                        </div>
                      </div>
                    </VerificationInfo>
                  )}
                </Section>

                <Section>
                  <SectionTitle>
                    <FaIdCard />
                    Registration Details
                  </SectionTitle>
                  <InfoGrid>
                    <InfoItem>
                      <label>Registration Number</label>
                      <div className="value">
                        {institution.registrationNumber || 'Not provided'}
                      </div>
                    </InfoItem>
                    <InfoItem>
                      <label>Tax ID</label>
                      <div className="value">
                        {institution.taxId || 'Not provided'}
                      </div>
                    </InfoItem>
                    <InfoItem>
                      <label>Accreditation Status</label>
                      <div className="value">
                        {institution.accreditation?.isAccredited ? (
                          <TypeBadge>Accredited</TypeBadge>
                        ) : (
                          <TypeBadge>Not Accredited</TypeBadge>
                        )}
                      </div>
                    </InfoItem>
                  </InfoGrid>
                </Section>
              </>
            )}
          </Content>

          <Footer>
            {status === 'pending' && (
              <>
                <Button
                  variant="approve"
                  onClick={handleApprove}
                  disabled={loading}
                >
                  <FaCheckCircle />
                  Approve Institution
                </Button>
                <Button
                  variant="reject"
                  onClick={handleReject}
                  disabled={loading}
                >
                  <FaTimesCircle />
                  Reject
                </Button>
              </>
            )}
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </Footer>
        </Modal>
      </Overlay>
    </AnimatePresence>
  );
};

export default InstitutionDetailModal;
