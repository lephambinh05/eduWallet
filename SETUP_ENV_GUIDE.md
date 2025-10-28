# 🔧 Hướng dẫn cấu hình Environment Variables

## ❌ **Vấn đề hiện tại:**
- Contract addresses chưa được cấu hình
- Backend không chạy (port 3003)
- Point Service không thể kết nối với smart contract

## ✅ **Cách khắc phục:**

### **Bước 0: Lấy các thông tin cần thiết**

#### **0.1. Lấy Private Key từ MetaMask:**
1. Mở MetaMask extension
2. Click vào 3 chấm (⋮) → **Account details**
3. Click **"Export private key"**
4. Nhập password MetaMask
5. Copy private key (bắt đầu bằng `0x...`)
6. **⚠️ Lưu ý:** Không chia sẻ private key này với ai!

#### **0.2. Lấy PZO Tokens (để trả gas fee):**

**Cách 1: Thêm Pione Zerochain vào MetaMask:**
1. Mở MetaMask extension
2. Click vào network dropdown (hiện tại đang hiển thị "Ethereum Mainnet")
3. Click **"Add network"**
4. Click **"Add a network manually"**
5. Điền thông tin:
   - **Network Name:** Pione Zerochain
   - **RPC URL:** https://rpc.zeroscan.org
   - **Chain ID:** 5080
   - **Currency Symbol:** PZO
   - **Block Explorer URL:** https://zeroscan.org
6. Click **"Save"**

**Cách 2: Lấy PZO Tokens:**
1. Chuyển sang network **Pione Zerochain** trong MetaMask
2. Copy địa chỉ ví của bạn
3. Xin testnet tokens từ:
   - **Faucet:** https://faucet.pione.tech (nếu có)
   - **Discord/Telegram:** Hỏi trong community Pione
   - **Mua PZO tokens:** Từ các sàn giao dịch hỗ trợ

**Cách 3: Kiểm tra balance:**
1. Mở MetaMask
2. Chuyển sang network **Pione Zerochain**
3. Xem balance PZO tokens
4. Cần ít nhất 0.01 PZO để deploy contracts

#### **0.3. Lấy IPFS API Keys (tùy chọn):**

**Option A: Sử dụng Pinata (Khuyến nghị):**
1. Đăng ký tài khoản tại: https://pinata.cloud
2. Vào **API Keys** → **New Key**
3. Copy **API Key** và **Secret Key**

**Option B: Sử dụng Infura:**
1. Đăng ký tài khoản tại: https://infura.io
2. Tạo project mới
3. Copy **Project ID** và **Project Secret**

### **Bước 1: Tạo file .env**

Tạo file `.env` trong thư mục gốc của dự án với nội dung:

```bash
# Frontend Environment Variables

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3003
REACT_APP_SOCKET_URL=http://localhost:3003

# Blockchain Configuration
REACT_APP_PIONE_ZERO_RPC_URL=https://rpc.zeroscan.org
REACT_APP_PIONE_CHAIN_RPC_URL=https://pione-chain.rpc.pione.tech

# Smart Contract Addresses (Cần deploy và cập nhật)
REACT_APP_EDU_TOKEN_CONTRACT_ADDRESS=
REACT_APP_LEARN_PASS_NFT_CONTRACT_ADDRESS=
REACT_APP_CERTIFICATE_NFT_CONTRACT_ADDRESS=
REACT_APP_EDU_WALLET_FACTORY_CONTRACT_ADDRESS=
REACT_APP_EDU_WALLET_MARKETPLACE_CONTRACT_ADDRESS=
REACT_APP_PORTFOLIO_NFT_CONTRACT_ADDRESS=

# Point Token Contract (Cần deploy)
REACT_APP_POINT_TOKEN_CONTRACT_ADDRESS=
REACT_APP_PZO_TOKEN_CONTRACT_ADDRESS=

# EduWallet DataStore Contract (Cần deploy)
REACT_APP_EDUWALLET_DATASTORE_CONTRACT_ADDRESS=

# IPFS Configuration
REACT_APP_INFURA_PROJECT_ID=your_infura_project_id
REACT_APP_INFURA_PROJECT_SECRET=your_infura_project_secret

# Pinata Configuration (Recommended for IPFS)
REACT_APP_PINATA_API_KEY=your_pinata_api_key
REACT_APP_PINATA_SECRET_KEY=your_pinata_secret_key

# Development
NODE_ENV=development
```

### **Bước 2: Deploy Smart Contracts**

#### **2.1. Chuẩn bị contract-project:**
```bash
cd contract-project
```

#### **2.2. Tạo file .env trong contract-project:**
```bash
# Tạo file .env
RPC_URL=https://rpc.zeroscan.org
PRIVATE_KEY=0x1234567890abcdef...  # Private key từ MetaMask
```

#### **2.3. Cài đặt dependencies:**
```bash
npm install
```

#### **2.4. Compile contracts:**
```bash
npx hardhat compile
```

#### **2.5. Deploy EduWallet DataStore:**
```bash
npx hardhat run scripts/deploy.js --network pzo
```

**Kết quả mong đợi:**
```
🚀 Starting EduWallet deployment...
📚 Deploying EduWalletDataStore contract...
✅ Deployed EduWallet contract at: 0x1234567890abcdef...
📋 Contract address: 0x1234567890abcdef...
🔗 Add this to your .env file: CONTRACT_ADDRESS=0x1234567890abcdef...
```

#### **2.6. Deploy Token Contracts:**
```bash
npx hardhat run scripts/deploy-tokens.js --network pzo
```

**Kết quả mong đợi:**
```
🚀 Starting PZO and Point Token deployment...
📚 Deploying PZO Token...
✅ PZO Token deployed at: 0x1234567890abcdef...
🎯 Deploying Point Token...
✅ Point Token deployed at: 0x1234567890abcdef...
```

#### **2.7. Cập nhật .env với contract addresses:**
```bash
# Thêm các addresses vừa deploy vào .env (thư mục gốc)
REACT_APP_EDUWALLET_DATASTORE_CONTRACT_ADDRESS=0x1234567890abcdef...
REACT_APP_POINT_TOKEN_CONTRACT_ADDRESS=0x1234567890abcdef...
REACT_APP_PZO_TOKEN_CONTRACT_ADDRESS=0x1234567890abcdef...
```

### **Bước 3: Khởi động Backend**

```bash
cd backend
npm install
npm start
```

### **Bước 4: Khởi động Frontend**

```bash
npm install
npm start
```

## 🚨 **Lỗi đã sửa:**

### **1. React DOM Warnings:**
- ✅ Sửa prop `isOpen` → `$isOpen` trong styled-components
- ✅ Sửa prop `active` → `$active` trong styled-components
- ✅ Sửa prop `sidebarOpen` → `$sidebarOpen` trong styled-components

### **2. Mock Transaction Hash:**
- ✅ Sửa `mockTransactionHash` → `tx.hash` trong NFTMintingModal.js
- ✅ Sửa `mockTransactionHash` → `tx.hash` trong LearnPassNFTModal.js

## 🎯 **Kết quả mong đợi:**

Sau khi hoàn thành các bước trên:
- ✅ Không còn React DOM warnings
- ✅ Backend chạy trên port 3003
- ✅ Smart contracts đã deploy và có addresses
- ✅ Point Service có thể kết nối với contracts
- ✅ Frontend hoạt động bình thường

## 🔍 **Kiểm tra:**

### **1. Kiểm tra Backend:**
```bash
curl http://localhost:3003/api/health
```

### **2. Kiểm tra Contract:**
```bash
curl http://localhost:3003/api/eduwallet/contract-info
```

### **3. Kiểm tra Frontend:**
- Mở http://localhost:3000
- Kiểm tra console không có lỗi
- Thử kết nối MetaMask
- Thử tạo Portfolio NFT

## 🔧 **Troubleshooting:**

### **Lỗi 1: "Insufficient funds"**
```bash
# Kiểm tra balance PZO tokens
# Cần ít nhất 0.01 PZO để deploy contracts
# Xin testnet tokens hoặc mua PZO tokens
```

### **Lỗi 2: "Invalid private key"**
```bash
# Kiểm tra private key format
# Phải bắt đầu bằng 0x và có 64 ký tự hex
# Ví dụ: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### **Lỗi 3: "Network not found"**
```bash
# Kiểm tra hardhat.config.js
# Đảm bảo network "pzo" được cấu hình đúng
# Kiểm tra RPC_URL trong .env
```

### **Lỗi 4: "Contract compilation failed"**
```bash
# Kiểm tra Solidity version
# Đảm bảo pragma solidity ^0.8.20;
# Chạy: npx hardhat clean && npx hardhat compile
```

### **Lỗi 5: "Backend connection failed"**
```bash
# Kiểm tra backend có chạy không
# Chạy: cd backend && npm start
# Kiểm tra port 3003 có bị chiếm không
```

### **Lỗi 6: "Contract address undefined"**
```bash
# Kiểm tra file .env có contract addresses không
# Đảm bảo đã deploy contracts thành công
# Kiểm tra tên biến môi trường có đúng không
```

## 📝 **Lưu ý quan trọng:**

### **Bảo mật:**
- ⚠️ **KHÔNG chia sẻ** private key với ai
- ⚠️ **KHÔNG commit** file .env vào git
- ⚠️ **Sử dụng testnet** cho development
- ⚠️ **Backup private key** ở nơi an toàn

### **Gas Fee:**
- 💰 **Cần PZO tokens** để deploy contracts
- 💰 **Gas fee** sẽ được trừ từ ví
- 💰 **Testnet** thường có gas fee thấp
- 💰 **Ước tính:** 0.001-0.01 PZO per contract

### **Network:**
- 🌐 **Pione Zerochain** (Chain ID: 5080)
- 🌐 **RPC URL:** https://rpc.zeroscan.org
- 🌐 **Explorer:** https://zeroscan.org
- 🌐 **Currency:** PZO

### **Thứ tự thực hiện:**
1. ✅ Lấy private key từ MetaMask
2. ✅ Thêm Pione Zerochain vào MetaMask
3. ✅ Lấy PZO tokens
4. ✅ Tạo file .env
5. ✅ Deploy smart contracts
6. ✅ Cập nhật contract addresses
7. ✅ Khởi động backend
8. ✅ Khởi động frontend
9. ✅ Test ứng dụng
