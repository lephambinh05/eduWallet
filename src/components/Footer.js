import React from 'react';
import styled from 'styled-components';

const FooterBar = styled.footer`
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(83,52,131,0.03) 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #c3bfff;
  text-align: center;
  padding: 1.2rem 0 1rem 0;
  font-size: 1rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 -4px 32px 0 rgba(83,52,131,0.15);
`;

const Footer = () => (
  <FooterBar>
    EduWallet &copy; 2024 &mdash; <a href="https://github.com/your-github" style={{ color: '#533483', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">Github</a>
  </FooterBar>
);

export default Footer; 