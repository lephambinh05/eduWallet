import { io } from 'socket.io-client';
const socket = io("http://localhost:3000"); // Sửa lại nếu server khác

export default socket;
