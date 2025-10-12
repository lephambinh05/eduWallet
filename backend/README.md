# EduWallet Backend API

## 📖 Overview

EduWallet Backend là một RESTful API được xây dựng bằng Node.js và Express, cung cấp các chức năng backend cho nền tảng NFT Learning Passport. API này tích hợp với blockchain (Pione Zero/Pione Chain) và MongoDB để quản lý người dùng, tổ chức giáo dục, LearnPass NFT và Certificate NFT.

## 🎯 Key Features

- **Authentication & Authorization**: JWT-based authentication với role-based access control
- **User Management**: Quản lý người dùng, đăng ký, xác thực email
- **Institution Management**: Quản lý tổ chức giáo dục và xác thực
- **LearnPass Management**: Tạo và quản lý LearnPass NFT
- **Certificate Management**: Phát hành và quản lý Certificate NFT
- **Blockchain Integration**: Tích hợp với smart contracts trên Pione Zero/Pione Chain
- **Marketplace**: Hệ thống trao đổi phần thưởng bằng EDU tokens
- **Real-time Communication**: Socket.IO cho thông báo real-time
- **File Upload**: Tích hợp Cloudinary cho upload file
- **Email Service**: Gửi email xác thực và thông báo
- **API Documentation**: Swagger/OpenAPI documentation
- **Logging & Monitoring**: Winston logging với file rotation
- **Security**: Helmet, CORS, rate limiting, input validation

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Blockchain    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Pione Chain) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   MongoDB       │
                       │   Database      │
                       └─────────────────┘
```

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB với Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Blockchain**: Ethers.js v6
- **Real-time**: Socket.IO
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **Validation**: Joi + express-validator
- **Security**: Helmet, CORS, bcryptjs
- **Logging**: Winston
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx

## 📁 Project Structure

```
backend/
├── 📁 src/
│   ├── 📁 config/                 # Configuration files
│   │   └── 📄 database.js         # MongoDB connection
│   ├── 📁 middleware/             # Custom middleware
│   │   ├── 📄 auth.js             # Authentication middleware
│   │   ├── 📄 errorHandler.js     # Error handling
│   │   ├── 📄 notFound.js         # 404 handler
│   │   └── 📄 validation.js       # Input validation
│   ├── 📁 models/                 # MongoDB models
│   │   ├── 📄 User.js             # User model
│   │   ├── 📄 Institution.js      # Institution model
│   │   ├── 📄 LearnPass.js        # LearnPass model
│   │   └── 📄 Certificate.js      # Certificate model
│   ├── 📁 routes/                 # API routes
│   │   ├── 📄 auth.js             # Authentication routes
│   │   ├── 📄 users.js            # User management
│   │   ├── 📄 institutions.js     # Institution management
│   │   ├── 📄 learnPass.js        # LearnPass management
│   │   ├── 📄 certificates.js     # Certificate management
│   │   ├── 📄 marketplace.js      # Marketplace routes
│   │   ├── 📄 blockchain.js       # Blockchain integration
│   │   └── 📄 admin.js            # Admin routes
│   ├── 📁 services/               # Business logic services
│   │   └── 📄 blockchainService.js # Blockchain service
│   ├── 📁 utils/                  # Utility functions
│   │   └── 📄 logger.js           # Winston logger
│   └── 📄 app.js                  # Main application file
├── 📁 logs/                       # Log files
├── 📄 Dockerfile                  # Docker configuration
├── 📄 docker-compose.yml          # Docker Compose setup
├── 📄 nginx.conf                  # Nginx configuration
├── 📄 mongo-init.js               # MongoDB initialization
├── 📄 healthcheck.js              # Health check script
├── 📄 package.json                # Dependencies
├── 📄 env.example                 # Environment variables template
└── 📄 README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB 7.0+
- Redis 7.0+ (optional, for caching)
- Docker & Docker Compose (for containerized deployment)
- MetaMask wallet (for blockchain interaction)
- Pione Zero/Pione Chain testnet tokens

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB and Redis:**
   ```bash
   # Using Docker Compose
   docker-compose up -d mongodb redis
   
   # Or start locally
   mongod
   redis-server
   ```

5. **Run the application:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

### Docker Deployment

1. **Build and start all services:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f backend
   ```

3. **Stop services:**
   ```bash
   docker-compose down
   ```

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
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

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 📚 API Documentation

API documentation is available at `/api-docs` when the server is running.

### Main Endpoints

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Institutions**: `/api/institutions/*`
- **LearnPass**: `/api/learnpass/*`
- **Certificates**: `/api/certificates/*`
- **Marketplace**: `/api/marketplace/*`
- **Blockchain**: `/api/blockchain/*`
- **Admin**: `/api/admin/*`

### Authentication

All protected endpoints require a Bearer token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Rate Limiting**: Configurable rate limits per endpoint
- **Input Validation**: Joi schema validation
- **CORS Protection**: Configurable CORS policies
- **Helmet**: Security headers
- **MongoDB Injection Protection**: express-mongo-sanitize
- **XSS Protection**: xss-clean
- **Parameter Pollution Protection**: hpp

## 📊 Monitoring & Logging

- **Winston Logger**: Structured logging with file rotation
- **Health Checks**: `/health` endpoint for monitoring
- **Error Tracking**: Comprehensive error handling and logging
- **Performance Monitoring**: Request/response logging
- **Blockchain Transaction Logging**: All blockchain interactions logged

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Production Deployment

1. **Set production environment variables**
2. **Build Docker image:**
   ```bash
   docker build -t eduwallet-backend .
   ```
3. **Deploy with Docker Compose:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment-specific Configurations

- **Development**: Hot reload, detailed logging
- **Production**: Optimized performance, security headers
- **Testing**: In-memory database, mock services

## 🔄 Blockchain Integration

The backend integrates with smart contracts on Pione Zero/Pione Chain:

- **EDU Token**: ERC-20 token for rewards
- **LearnPass NFT**: ERC-721 for learning passports
- **Certificate NFT**: ERC-721 for certificates
- **Factory Contract**: Central management contract
- **Marketplace Contract**: Reward exchange system

### Blockchain Operations

- User registration and LearnPass minting
- Certificate issuance and verification
- EDU token transfers and rewards
- Marketplace item purchases
- Real-time transaction monitoring

## 📈 Performance Optimization

- **Database Indexing**: Optimized MongoDB indexes
- **Connection Pooling**: MongoDB connection pooling
- **Caching**: Redis caching for frequently accessed data
- **Compression**: Gzip compression for responses
- **Rate Limiting**: Prevents abuse and ensures fair usage

## 🛠️ Development

### Code Style

- ESLint configuration for consistent code style
- Prettier for code formatting
- Husky for pre-commit hooks

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

- **Documentation**: Check `/api-docs` for API documentation
- **Issues**: GitHub Issues for bug reports
- **Email**: support@eduwallet.com

## 📄 License

This project is licensed under the MIT License.

---

**EduWallet Backend** - Powering the future of digital education on blockchain.
