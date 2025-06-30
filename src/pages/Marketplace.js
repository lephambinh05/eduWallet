import React, { useState } from 'react';
import styled from 'styled-components';
import demoData from '../data/demoData.json';
import { useWallet } from '../context/WalletContext';
import toast from 'react-hot-toast';
import { FaStore, FaCoins } from 'react-icons/fa';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 0;
`;

const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
`;

const ItemCard = styled.div`
  background: linear-gradient(135deg, rgba(76,175,80,0.12) 0%, rgba(76,175,80,0.05) 100%);
  border-radius: 16px;
  padding: 2rem 1.5rem;
  min-width: 220px;
  max-width: 260px;
  text-align: center;
  color: #fff;
  box-shadow: 0 4px 24px rgba(76,175,80,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(76,175,80,0.15);
  }
`;

const ItemIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 16px;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
  box-shadow: 0 2px 8px rgba(76,175,80,0.15);
`;

const BalanceInfo = styled.div`
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #fff;
`;

const Marketplace = () => {
  const { marketplace } = demoData;
  const { isConnected, account } = useWallet();
  const [userBalance, setUserBalance] = useState(50); // Demo balance: 50 EDU tokens

  const handleExchange = (item) => {
    if (!isConnected) {
      toast.error('Vui lòng kết nối ví trước!');
      return;
    }

    if (userBalance < item.price) {
      toast.error(`Số dư không đủ! Cần ${item.price} EDU, hiện có ${userBalance} EDU`);
      return;
    }

    // Demo transaction
    setUserBalance(prev => prev - item.price);
    toast.success(`Đổi thưởng thành công! Đã trừ ${item.price} EDU token`);
    toast.success(`Voucher "${item.title}" đã được gửi đến ví của bạn!`);
  };

  return (
    <Container>
      <h2 style={{ color: '#667eea', marginBottom: 24 }}>Marketplace - Đổi thưởng</h2>
      
      {isConnected && (
        <BalanceInfo>
          <div style={{ fontSize: '1.1rem', marginBottom: 8 }}>
            <strong>Số dư EDU Token:</strong> {userBalance} EDU
          </div>
          <div style={{ fontSize: '0.9rem', color: '#c3bfff' }}>
            Ví: {account?.slice(0, 6)}...{account?.slice(-4)}
          </div>
        </BalanceInfo>
      )}

      {!isConnected && (
        <BalanceInfo>
          <div style={{ color: '#ff6b6b' }}>
            Vui lòng kết nối ví để xem số dư và đổi thưởng
          </div>
        </BalanceInfo>
      )}

      <Grid>
        {marketplace.map(item => (
          <ItemCard key={item.id}>
            <ItemIcon>
              <FaStore />
            </ItemIcon>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>{item.title}</div>
            <div style={{ color: '#c3bfff', marginBottom: 8 }}>{item.description}</div>
            <div style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <FaCoins /> Giá: <b>{item.price} {item.currency}</b>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={() => handleExchange(item)}
              disabled={!isConnected || userBalance < item.price}
            >
              {!isConnected ? 'Kết nối ví' : 
               userBalance < item.price ? 'Số dư không đủ' : 'Đổi thưởng'}
            </button>
          </ItemCard>
        ))}
      </Grid>
    </Container>
  );
};

export default Marketplace; 