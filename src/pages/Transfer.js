import React, { useState } from 'react';
import { getUserFromLocalStorage } from '../utils/userUtils';

function Transfer() {
  const [toUserId, setToUserId] = useState('');
  const [amount, setAmount] = useState('');
  const user = getUserFromLocalStorage();

  const handleTransfer = async () => {
    if (!toUserId || !amount) return alert("Điền đủ thông tin!");
    await fetch('http://localhost:3001/api/transfer', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromUserId: user.id || user.userId,
        toUserId,
        amount: Number(amount),
      }),
    });
    setAmount('');
    setToUserId('');
    alert("Đã gửi lệnh chuyển tiền! Chờ thông báo realtime.");
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", padding: 20, background: "#fff3", borderRadius: 12 }}>
      <h2>Chuyển tiền nội bộ</h2>
      <input
        type="text"
        value={toUserId}
        onChange={e => setToUserId(e.target.value)}
        placeholder="Nhập UserID người nhận"
        style={{ width: '100%', marginBottom: 12, padding: 8 }}
      />
      <input
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Số tiền"
        style={{ width: '100%', marginBottom: 12, padding: 8 }}
      />
      <button onClick={handleTransfer} style={{ width: '100%', padding: 10, background: '#533483', color: '#fff', border: 'none', borderRadius: 8 }}>
        Chuyển tiền
      </button>
    </div>
  );
}

export default Transfer;
