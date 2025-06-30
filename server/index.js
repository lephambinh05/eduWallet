const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

let onlineUsers = {};

io.on('connection', (socket) => {
  socket.on('user-online', (userId) => {
    onlineUsers[userId] = socket.id;
  });
  socket.on('disconnect', () => {
    for (let [uid, sid] of Object.entries(onlineUsers)) {
      if (sid === socket.id) delete onlineUsers[uid];
    }
  });
});

app.post('/api/transfer', (req, res) => {
  const { fromUserId, toUserId, amount } = req.body;
  // Không kiểm tra số dư, demo thôi
  if (onlineUsers[toUserId]) {
    io.to(onlineUsers[toUserId]).emit('receive-money', {
      from: fromUserId,
      amount,
      message: `Bạn vừa nhận ${amount} từ user ${fromUserId}`,
    });
  }
  if (onlineUsers[fromUserId]) {
    io.to(onlineUsers[fromUserId]).emit('transfer-success', {
      to: toUserId,
      amount,
      message: `Bạn đã chuyển ${amount} cho user ${toUserId} thành công`,
    });
  }
  res.json({ status: 'success' });
});

server.listen(3001, () => console.log('Server running at http://localhost:3000'));
