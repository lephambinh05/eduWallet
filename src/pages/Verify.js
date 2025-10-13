import React, { useState } from 'react';
import styled from 'styled-components';
// import demoData from '../data/demoData.json'; // Removed mock data
import { getCurrentUser } from '../utils/userUtils';
import { useWallet } from '../context/WalletContext';

const Container = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  border: 1px solid #667eea;
  margin-bottom: 1rem;
  font-size: 1rem;
  background: rgba(255,255,255,0.07);
  color: #fff;
`;

const Card = styled.div`
  background: rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 2rem;
  color: #fff;
  margin-top: 1.5rem;
`;

const Verify = () => {
  const [input, setInput] = useState('');
  const [found, setFound] = useState(null);
  // Removed mock data usage
  const learnPass = null;
  const user = getCurrentUser();
  const currentUser = getCurrentUser();
  const { account, isConnected } = useWallet();

  const handleVerify = (e) => {
    e.preventDefault();
    if (input.trim() === learnPass.id) {
      setFound({ 
        ...learnPass, 
        ownerName: currentUser?.name || user.name, 
        ownerWallet: isConnected && account ? `${account.slice(0, 6)}...${account.slice(-4)}` : (currentUser?.walletAddress || user.wallet || 'Chưa liên kết ví')
      });
    } else {
      setFound(false);
    }
  };

  return (
    <Container>
      <h2 style={{ color: '#667eea', marginBottom: 24 }}>Xác minh LearnPass NFT</h2>
      <form onSubmit={handleVerify}>
        <Input
          placeholder="Nhập mã NFT (ID) để xác minh..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">Xác minh</button>
      </form>
      {found === false && (
        <div style={{ color: 'red', marginTop: 16 }}>Không tìm thấy NFT với mã này.</div>
      )}
      {found && (
        <Card>
          <div><b>ID:</b> {found.id}</div>
          <div><b>Chủ sở hữu:</b> {found.ownerName} ({found.ownerWallet})</div>
          <div><b>Số lượng khóa học:</b> {found.metadata.courses.length}</div>
          <div><b>Hoạt động ngoại khoá:</b> {found.metadata.extracurricular.length}</div>
        </Card>
      )}
    </Container>
  );
};

export default Verify; 