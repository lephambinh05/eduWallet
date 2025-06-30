import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 0;
  color: #fff;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const About = () => (
  <Container>
    <h2 style={{ color: '#667eea', marginBottom: 24 }}>Về EduWallet</h2>
    <Section>
      <b>EduWallet</b> là nền tảng quản lý danh tính học tập số dựa trên blockchain, giúp sinh viên lưu trữ, xác minh chứng chỉ, nhận phần thưởng và giao dịch marketplace một cách minh bạch, bảo mật.
    </Section>
    <Section>
      <b>Công nghệ sử dụng:</b>
      <ul>
        <li>Blockchain: Polygon Mumbai</li>
        <li>Smart Contract: Solidity (ERC-721 NFT)</li>
        <li>Frontend: ReactJS, Styled-components</li>
        <li>Backend: Node.js (demo: data cứng)</li>
        <li>IPFS: Lưu trữ metadata NFT</li>
      </ul>
    </Section>
    <Section>
      <b>Mục tiêu:</b>
      <ul>
        <li>Đơn giản hóa quản lý chứng chỉ học tập</li>
        <li>Minh bạch, xác minh phi tập trung</li>
        <li>Khuyến khích học tập qua phần thưởng, badge</li>
        <li>Kết nối sinh viên với nhà tuyển dụng và đối tác</li>
      </ul>
    </Section>
    <Section>
      <b>Team Hackathon:</b>
      <ul>
        <li>Nguyễn Văn A - Blockchain Dev</li>
        <li>Trần Thị B - Frontend</li>
        <li>Lê Văn C - UI/UX</li>
        <li>Phạm Thị D - Backend</li>
      </ul>
    </Section>
  </Container>
);

export default About; 