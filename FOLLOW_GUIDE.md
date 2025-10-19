# Hướng dẫn Follow Hoạt động EduWallet + Smart Contract

## 🎯 Tổng quan
Hướng dẫn này sẽ đưa bạn qua từng bước để deploy smart contract và tích hợp với backend eduWallet.

## 📋 Yêu cầu hệ thống
- Node.js >= 18.0.0
- npm >= 8.0.0
- Git
- Ví blockchain (MetaMask hoặc tương tự)
- Private key của ví

## 🚀 Bước 1: Deploy Smart Contract

### 1.1 Chuẩn bị môi trường
```bash
# Vào thư mục contract project
cd contract-project

# Cài đặt dependencies
npm install
```

### 1.2 Cấu hình environment
```bash
# Tạo file .env từ template
cp env.example .env

# Chỉnh sửa file .env với thông tin của bạn
nano .env
```

**Nội dung file .env:**
```env
# Pione zerochain RPC URL
RPC_URL=https://rpc.zeroscan.org

# Private key của ví (lấy từ ví của bạn)
PRIVATE_KEY=your_private_key_here

# Contract address sau khi deploy (sẽ được tạo tự động)
CONTRACT_ADDRESS=
```

### 1.3 Compile và Deploy
```bash
# Compile smart contract
npm run compile

# Deploy lên PZO network
npm run deploy
```

**Kết quả mong đợi:**
```
🚀 Starting EduWallet deployment...
📚 Deploying EduWalletDataStore contract...
✅ Deployed EduWallet contract at: 0x1234567890abcdef...
📋 Contract address: 0x1234567890abcdef...
🔗 Add this to your .env file: CONTRACT_ADDRESS=0x1234567890abcdef...
📊 Initial counts:
   - Learning Records: 0
   - Badges: 0
   - Portfolios: 0
👤 Contract owner: 0x...
🎉 Deployment completed successfully!
```

### 1.4 Cập nhật contract address
```bash
# Copy contract address vào .env
echo "CONTRACT_ADDRESS=0x1234567890abcdef..." >> .env
```

## 🔧 Bước 2: Cấu hình Backend

### 2.1 Cập nhật backend environment
```bash
# Vào thư mục backend
cd ../backend

# Tạo file .env từ template
cp env.example .env

# Chỉnh sửa file .env
nano .env
```

**Thêm vào file .env:**
```env
# Contract Addresses
EDUWALLET_DATASTORE_ADDRESS=0x1234567890abcdef...

# Private Key for Blockchain Operations (Server Wallet)
BLOCKCHAIN_PRIVATE_KEY=your_private_key_here

# Blockchain Configuration
BLOCKCHAIN_NETWORK=pioneZero
BLOCKCHAIN_RPC_URL=https://rpc.zeroscan.org
BLOCKCHAIN_CHAIN_ID=5080
```

### 2.2 Cài đặt dependencies
```bash
npm install
```

### 2.3 Khởi động backend
```bash
# Khởi động server
npm start
```

**Kết quả mong đợi:**
```
Server running on port 3001
Blockchain service initialized
EduWalletDataStore contract initialized
```

## 🧪 Bước 3: Test API Endpoints

### 3.1 Test Contract Info
```bash
# Lấy thông tin contract
curl http://localhost:3001/api/eduwallet/contract-info
```

**Response mong đợi:**
```json
{
  "success": true,
  "data": {
    "contractAddress": "0x1234567890abcdef...",
    "network": "pioneZero",
    "chainId": "5080",
    "rpcUrl": "https://rpc.zeroscan.org",
    "counts": {
      "records": "0",
      "badges": "0",
      "portfolios": "0"
    },
    "owner": "0x..."
  }
}
```

### 3.2 Test Learning Records

#### Tạo học bạ mới (cần authentication)
```bash
# Đăng nhập để lấy token (giả sử có endpoint login)
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' | jq -r '.token')

# Thêm học bạ mới
curl -X POST http://localhost:3001/api/eduwallet/learning-records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "studentName": "Nguyen Van A",
    "institution": "HUST",
    "courseName": "Blockchain Development",
    "certificateHash": "0x1234567890abcdef...",
    "score": 95,
    "studentAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
  }'
```

#### Lấy thông tin học bạ
```bash
# Lấy học bạ theo ID
curl http://localhost:3001/api/eduwallet/learning-records/1

# Lấy học bạ của sinh viên
curl http://localhost:3001/api/eduwallet/students/0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6/records
```

### 3.3 Test Badges

#### Tạo badge mới
```bash
curl -X POST http://localhost:3001/api/eduwallet/badges \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Blockchain Expert",
    "description": "Completed advanced blockchain course with excellence",
    "imageHash": "0xabcdef1234567890...",
    "studentAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
  }'
```

#### Lấy thông tin badge
```bash
# Lấy badge theo ID
curl http://localhost:3001/api/eduwallet/badges/1

# Lấy badge của sinh viên
curl http://localhost:3001/api/eduwallet/students/0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6/badges
```

### 3.4 Test Portfolios

#### Tạo portfolio mới
```bash
curl -X POST http://localhost:3001/api/eduwallet/portfolios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "EduWallet DApp",
    "description": "A decentralized application for managing educational credentials",
    "projectHash": "0x9876543210fedcba...",
    "skills": ["Solidity", "React", "Node.js", "Blockchain"]
  }'
```

#### Lấy thông tin portfolio
```bash
# Lấy portfolio theo ID
curl http://localhost:3001/api/eduwallet/portfolios/1

# Lấy portfolio của sinh viên
curl http://localhost:3001/api/eduwallet/students/0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6/portfolios
```

### 3.5 Test Authorization

#### Ủy quyền issuer mới (admin only)
```bash
curl -X POST http://localhost:3001/api/eduwallet/authorize-issuer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "issuerAddress": "0x1234567890abcdef...",
    "authorized": true
  }'
```

#### Kiểm tra quyền issuer
```bash
curl http://localhost:3001/api/eduwallet/check-issuer/0x1234567890abcdef...
```

## 🔍 Bước 4: Verify trên Blockchain

### 4.1 Kiểm tra transaction trên blockchain explorer
1. Mở browser và truy cập: https://zeroscan.org
2. Tìm kiếm contract address: `0x1234567890abcdef...`
3. Xem các transactions và events

### 4.2 Kiểm tra events
Trong contract explorer, bạn sẽ thấy các events:
- `LearningRecordAdded`
- `BadgeEarned`
- `PortfolioCreated`
- `IssuerAuthorized`

## 🐛 Bước 5: Troubleshooting

### 5.1 Lỗi thường gặp

#### "Contract not deployed"
```bash
# Kiểm tra contract address trong .env
echo $EDUWALLET_DATASTORE_ADDRESS

# Kiểm tra network connection
curl -X POST https://rpc.zeroscan.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

#### "Insufficient funds"
```bash
# Kiểm tra balance của wallet
curl -X POST https://rpc.zeroscan.org \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"eth_getBalance",
    "params":["0xYOUR_WALLET_ADDRESS","latest"],
    "id":1
  }'
```

#### "Invalid private key"
```bash
# Kiểm tra format private key (phải có 0x prefix)
echo $PRIVATE_KEY | wc -c  # Phải là 66 ký tự (0x + 64 hex)
```

### 5.2 Debug logs
```bash
# Xem logs của backend
tail -f logs/app.log

# Xem blockchain service logs
grep "blockchain" logs/app.log
```

## 📊 Bước 6: Monitor và Analytics

### 6.1 Kiểm tra counts
```bash
curl http://localhost:3001/api/eduwallet/counts
```

### 6.2 Kiểm tra owner
```bash
curl http://localhost:3001/api/eduwallet/owner
```

## 🎉 Bước 7: Test Frontend Integration

### 7.1 Khởi động frontend
```bash
# Vào thư mục frontend
cd ../src

# Khởi động React app
npm start
```

### 7.2 Test trên UI
1. Mở browser: http://localhost:3000
2. Đăng nhập với tài khoản có quyền institution/admin
3. Thử tạo learning record, badge, portfolio
4. Kiểm tra dữ liệu hiển thị trên UI

## 📝 Checklist hoàn thành

- [ ] Smart contract deployed thành công
- [ ] Contract address được cập nhật trong backend .env
- [ ] Backend khởi động không lỗi
- [ ] API endpoints trả về đúng response
- [ ] Có thể tạo learning records
- [ ] Có thể tạo badges
- [ ] Có thể tạo portfolios
- [ ] Authorization hoạt động đúng
- [ ] Frontend hiển thị dữ liệu từ blockchain
- [ ] Events được emit trên blockchain

## 🆘 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Logs của backend: `logs/app.log`
2. Network connection: `ping rpc.zeroscan.org`
3. Wallet balance: Có đủ gas để thực hiện transactions
4. Contract address: Đúng format và đã deploy

**Happy coding! 🚀**
