# Hướng dẫn tích hợp Backend với Frontend EduWallet

## 📋 Tổng quan

Tài liệu này hướng dẫn cách tích hợp backend Node.js với frontend React của EduWallet, bao gồm cấu hình API, authentication, blockchain integration và deployment.

## 🔗 Kết nối Backend - Frontend

### 1. Cấu hình API

Frontend đã được cấu hình để kết nối với backend Node.js thông qua:

- **API Base URL**: `http://localhost:3001` (development)
- **Socket.IO**: Real-time communication
- **JWT Authentication**: Token-based auth với refresh token

### 2. Cấu trúc tích hợp

```
Frontend (React)          Backend (Node.js)
├── src/config/api.js  ←→  src/routes/*.js
├── src/context/       ←→  src/middleware/auth.js
├── src/utils/socket.js ←→  Socket.IO server
└── Blockchain         ←→  src/services/blockchainService.js
```

## 🚀 Cài đặt và Chạy

### Backend Setup

```bash
# 1. Cài đặt dependencies
cd backend
npm install

# 2. Cấu hình environment
cp env.example .env
# Chỉnh sửa .env với thông tin của bạn

# 3. Chạy MongoDB và Redis
docker-compose up -d mongodb redis

# 4. Chạy backend
npm run dev
```

### Frontend Setup

```bash
# 1. Cài đặt dependencies
npm install

# 2. Cấu hình environment
cp env.example .env
# Chỉnh sửa .env với thông tin của bạn

# 3. Chạy frontend
npm start
```

## 🔧 Cấu hình Environment

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=3001
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/eduwallet

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRE=30d

# Blockchain
BLOCKCHAIN_NETWORK=pioneZero
BLOCKCHAIN_RPC_URL=https://rpc.zeroscan.org
BLOCKCHAIN_CHAIN_ID=5080
BLOCKCHAIN_PRIVATE_KEY=your_private_key

# Contract Addresses
EDU_TOKEN_ADDRESS=0x...
LEARNPASS_NFT_ADDRESS=0x...
CERTIFICATE_NFT_ADDRESS=0x...
FACTORY_ADDRESS=0x...
MARKETPLACE_ADDRESS=0x...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@eduwallet.com

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_SOCKET_URL=http://localhost:3001

# Blockchain Configuration
REACT_APP_DEFAULT_NETWORK=pioneZero
REACT_APP_BLOCKCHAIN_RPC_URL=https://rpc.zeroscan.org
REACT_APP_BLOCKCHAIN_CHAIN_ID=5080

# Contract Addresses (Pione Zero)
REACT_APP_EDU_TOKEN_ADDRESS=0x...
REACT_APP_LEARNPASS_NFT_ADDRESS=0x...
REACT_APP_CERTIFICATE_NFT_ADDRESS=0x...
REACT_APP_FACTORY_ADDRESS=0x...
REACT_APP_MARKETPLACE_ADDRESS=0x...

# Feature Flags
REACT_APP_ENABLE_MARKETPLACE=true
REACT_APP_ENABLE_REWARDS=true
REACT_APP_ENABLE_VERIFICATION=true
```

## 🔐 Authentication Flow

### 1. Đăng ký người dùng

```javascript
// Frontend
import { useAuth } from '../context/AuthContext';

const { register } = useAuth();

const handleRegister = async (userData) => {
  const result = await register(userData);
  if (result.success) {
    // User registered successfully
    // JWT tokens stored automatically
  }
};
```

### 2. Đăng nhập

```javascript
// Frontend
const { login } = useAuth();

const handleLogin = async (credentials) => {
  const result = await login(credentials);
  if (result.success) {
    // User logged in successfully
    // Redirect to dashboard
  }
};
```

### 3. Protected Routes

```javascript
// Frontend
import ProtectedRoute from '../components/ProtectedRoute';

<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

## 🌐 Blockchain Integration

### 1. Wallet Connection

```javascript
// Frontend
import { useWallet } from '../context/WalletContext';

const { connectWallet, currentNetwork, BLOCKCHAIN_NETWORKS } = useWallet();

const handleConnectWallet = async () => {
  await connectWallet();
  // Wallet connected to Pione Zero/Pione Chain
};
```

### 2. Smart Contract Interaction

```javascript
// Frontend
import { blockchainAPI } from '../config/api';

// Register user on blockchain
const registerUser = async (userData) => {
  const response = await blockchainAPI.registerUser(userData);
  return response.data;
};

// Issue certificate
const issueCertificate = async (certificateData) => {
  const response = await blockchainAPI.issueCertificate(certificateData);
  return response.data;
};
```

## 📡 Real-time Communication

### Socket.IO Integration

```javascript
// Frontend
import socket, { connectSocket } from '../utils/socket';

// Connect socket when user logs in
useEffect(() => {
  if (user) {
    connectSocket(user);
  }
}, [user]);

// Listen for real-time events
socket.on('learnpass-updated', (data) => {
  // Handle LearnPass update
});

socket.on('certificate-received', (data) => {
  // Handle new certificate
});
```

## 🗄️ Database Integration

### User Management

```javascript
// Frontend
import { userAPI } from '../config/api';

// Get user profile
const getUserProfile = async () => {
  const response = await userAPI.getProfile();
  return response.data;
};

// Update user
const updateUser = async (userId, data) => {
  const response = await userAPI.updateUser(userId, data);
  return response.data;
};
```

### LearnPass Management

```javascript
// Frontend
import { learnPassAPI } from '../config/api';

// Get LearnPass
const getLearnPass = async (id) => {
  const response = await learnPassAPI.getLearnPassById(id);
  return response.data;
};

// Create LearnPass
const createLearnPass = async (data) => {
  const response = await learnPassAPI.createLearnPass(data);
  return response.data;
};
```

## 🛒 Marketplace Integration

```javascript
// Frontend
import { marketplaceAPI } from '../config/api';

// Get marketplace items
const getMarketplaceItems = async () => {
  const response = await marketplaceAPI.getItems();
  return response.data;
};

// Purchase item
const purchaseItem = async (itemId) => {
  const response = await marketplaceAPI.purchaseItem(itemId);
  return response.data;
};
```

## 🚀 Deployment

### Development

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm start
```

### Production với Docker

```bash
# Backend
cd backend
docker-compose up -d

# Frontend
npm run build
# Deploy build folder to your hosting service
```

## 🔍 API Documentation

Backend API documentation có sẵn tại:
- **Development**: `http://localhost:3001/api-docs`
- **Swagger UI**: Interactive API documentation

### Main Endpoints

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Institutions**: `/api/institutions/*`
- **LearnPass**: `/api/learnpass/*`
- **Certificates**: `/api/certificates/*`
- **Marketplace**: `/api/marketplace/*`
- **Blockchain**: `/api/blockchain/*`
- **Admin**: `/api/admin/*`

## 🐛 Troubleshooting

### Common Issues

1. **CORS Error**
   - Kiểm tra `CORS_ORIGIN` trong backend .env
   - Đảm bảo frontend URL được whitelist

2. **Authentication Failed**
   - Kiểm tra JWT_SECRET trong backend
   - Verify token expiration settings

3. **Blockchain Connection Failed**
   - Kiểm tra RPC URL và Chain ID
   - Verify contract addresses

4. **Database Connection Failed**
   - Kiểm tra MongoDB connection string
   - Ensure MongoDB is running

### Debug Mode

```env
# Frontend
REACT_APP_DEBUG=true

# Backend
NODE_ENV=development
LOG_LEVEL=debug
```

## 📊 Monitoring

### Health Checks

- **Backend**: `http://localhost:3001/health`
- **Database**: MongoDB connection status
- **Blockchain**: Network connectivity

### Logs

- **Backend**: `backend/logs/` directory
- **Frontend**: Browser console
- **Docker**: `docker-compose logs -f`

## 🔄 Data Flow

```
User Action → Frontend → API Call → Backend → Database
                ↓
Blockchain Transaction → Smart Contract → Event → Socket.IO → Frontend Update
```

## 📝 Next Steps

1. **Deploy Smart Contracts** lên Pione Zero/Pione Chain
2. **Update Contract Addresses** trong environment files
3. **Configure Email Service** cho verification
4. **Set up File Storage** (Cloudinary) cho uploads
5. **Deploy to Production** với proper SSL certificates

## 🆘 Support

- **API Documentation**: `/api-docs`
- **GitHub Issues**: Bug reports và feature requests
- **Email**: support@eduwallet.com

---

**EduWallet Integration Guide** - Kết nối backend và frontend một cách seamless.
