import React from 'react';
import styled from 'styled-components';
import demoData from '../data/demoData.json';
import { FaGraduationCap, FaCertificate } from 'react-icons/fa';
import { getCurrentUser } from '../utils/userUtils';
import { useWallet } from '../context/WalletContext';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 0;
`;

const NFTCard = styled.div`
  background: rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2rem;
  color: #fff;
`;

const NFTIcon = styled.div`
  width: 180px;
  height: 180px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
  color: #fff;
`;

const Meta = styled.div`
  flex: 1;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  color: #667eea;
  margin-bottom: 1rem;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  margin-bottom: 0.7rem;
  background: rgba(255,255,255,0.04);
  border-radius: 8px;
  padding: 0.7rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
`;

const CertIcon = styled.span`
  color: #667eea;
  font-size: 1.3rem;
  margin-right: 0.5rem;
`;

const LearnPass = () => {
  const currentUser = getCurrentUser();
  const { account, isConnected } = useWallet();
  
  // Tìm learnPass theo learnPassId của user
  let learnPass = null;
  if (currentUser && currentUser.learnPassId) {
    if (demoData.learnPass && demoData.learnPass.id === currentUser.learnPassId) {
      learnPass = demoData.learnPass;
    }
  }
  // Lấy certificates demo (có thể lọc theo user nếu có data thực)
  const certificates = demoData.certificates;

  if (!currentUser) {
    return <Container><div style={{color:'#fff',textAlign:'center',padding:'2rem'}}>Bạn chưa đăng nhập.</div></Container>;
  }

  if (!learnPass) {
    return <Container>
      <NFTCard>
        <NFTIcon><FaGraduationCap /></NFTIcon>
        <Meta>
          <h2>Bạn chưa có LearnPass NFT</h2>
          <div style={{color:'#c3bfff',marginBottom:8}}>Hãy hoàn thành khóa học để nhận LearnPass NFT đầu tiên!</div>
          <div>Chủ sở hữu: <b>{currentUser.name}</b> ({isConnected && account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Chưa liên kết ví'})</div>
        </Meta>
      </NFTCard>
    </Container>;
  }

  return (
    <Container>
      <NFTCard>
        <NFTIcon>
          <FaGraduationCap />
        </NFTIcon>
        <Meta>
          <h2>LearnPass NFT của {currentUser.name}</h2>
          <div style={{ fontSize: '1.1rem', color: '#c3bfff', marginBottom: 8 }}>ID: {learnPass.id}</div>
          <div>Chủ sở hữu: <b>{currentUser.name}</b> ({isConnected && account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Chưa liên kết ví'})</div>
        </Meta>
      </NFTCard>
      <Section>
        <SectionTitle>Khóa học & kỹ năng</SectionTitle>
        <List>
          {learnPass.metadata.courses.map((course, idx) => (
            <ListItem key={idx}>
              <CertIcon><FaCertificate /></CertIcon>
              <div>
                <b>{course.name}</b> - Điểm: {course.score} <br/>
                Kỹ năng: {course.skills.join(', ')}<br/>
                Ngày hoàn thành: {course.date} <br/>
                Tổ chức cấp: {course.issuer}
              </div>
            </ListItem>
          ))}
        </List>
      </Section>
      <Section>
        <SectionTitle>Hoạt động ngoại khoá</SectionTitle>
        <List>
          {learnPass.metadata.extracurricular.map((act, idx) => (
            <ListItem key={idx}>
              <span style={{ color: '#764ba2', fontSize: '1.2rem', marginRight: 8 }}>★</span>
              {act.name} ({act.date})
            </ListItem>
          ))}
        </List>
      </Section>
      <Section>
        <SectionTitle>Lịch sử tín chỉ</SectionTitle>
        <List>
          {learnPass.metadata.creditHistory.map((credit, idx) => (
            <ListItem key={idx}>
              <span style={{ color: '#4CAF50', fontSize: '1.2rem', marginRight: 8 }}>✔</span>
              {credit.type === 'course' ? 'Khóa học' : 'Khác'}: <b>{credit.name}</b> - {credit.credit} tín chỉ
            </ListItem>
          ))}
        </List>
      </Section>
      <Section>
        <SectionTitle>Chứng chỉ liên quan</SectionTitle>
        <List>
          {certificates.map(cert => (
            <ListItem key={cert.id}>
              <CertIcon><FaCertificate /></CertIcon>
              <b>{cert.title}</b> - {cert.issuer} ({cert.date})
            </ListItem>
          ))}
        </List>
      </Section>
    </Container>
  );
};

export default LearnPass; 