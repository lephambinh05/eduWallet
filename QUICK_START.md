# 🚀 Quick Start Guide - EduWallet + Smart Contract

## ⚡ 5 phút để có hệ thống hoạt động

### Bước 1: Deploy Smart Contract (2 phút)

```bash
# 1. Vào thư mục contract
cd contract-project

# 2. Cài đặt và cấu hình
npm install
cp env.example .env

# 3. Chỉnh sửa .env - thêm private key của bạn
nano .env
# Thay đổi: PRIVATE_KEY=your_actual_private_key_here

# 4. Deploy
npm run compile
npm run deploy

# 5. Copy contract address từ output
# Ví dụ: CONTRACT_ADDRESS=0x1234567890abcdef...
```

### Bước 2: Cấu hình Backend (1 phút)

```bash
# 1. Vào thư mục backend
cd ../backend

# 2. Cấu hình environment
cp env.example .env
nano .env

# 3. Thêm vào .env:
# EDUWALLET_DATASTORE_ADDRESS=0x1234567890abcdef... (từ bước 1)
# BLOCKCHAIN_PRIVATE_KEY=your_actual_private_key_here
# BLOCKCHAIN_RPC_URL=https://rpc.zeroscan.org
# BLOCKCHAIN_CHAIN_ID=5080

# 4. Khởi động backend
npm install
npm start
```

### Bước 3: Test API (1 phút)

```bash
# Mở terminal mới và test:

# 1. Kiểm tra contract info
curl http://localhost:3001/api/eduwallet/contract-info

# 2. Kiểm tra counts
curl http://localhost:3001/api/eduwallet/counts

# 3. Kiểm tra owner
curl http://localhost:3001/api/eduwallet/owner
```

### Bước 4: Test Frontend (1 phút)

```bash
# 1. Vào thư mục frontend
cd ../src

# 2. Khởi động React app
npm install
npm start

# 3. Mở browser: http://localhost:3000
# 4. Đăng nhập và test các chức năng
```

## ✅ Checklist nhanh

- [ ] Smart contract deployed (có contract address)
- [ ] Backend khởi động không lỗi
- [ ] API `/api/eduwallet/contract-info` trả về data
- [ ] Frontend hiển thị được dữ liệu

## 🎯 Test nhanh với curl

```bash
# Test tạo learning record (cần token)
curl -X POST http://localhost:3001/api/eduwallet/learning-records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "studentName": "Test Student",
    "institution": "Test University", 
    "courseName": "Blockchain",
    "certificateHash": "0x123...",
    "score": 95,
    "studentAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
  }'
```

## 🆘 Nếu gặp lỗi

1. **Contract không deploy được**: Kiểm tra private key và network
2. **Backend không start**: Kiểm tra .env và dependencies
3. **API không response**: Kiểm tra contract address
4. **Frontend không load**: Kiểm tra backend đang chạy

## 📞 Hỗ trợ nhanh

```bash
# Kiểm tra logs
tail -f backend/logs/app.log

# Kiểm tra network
ping rpc.zeroscan.org

# Kiểm tra wallet balance
# (Sử dụng MetaMask hoặc blockchain explorer)
```

**🎉 Chúc mừng! Hệ thống đã sẵn sàng!**
