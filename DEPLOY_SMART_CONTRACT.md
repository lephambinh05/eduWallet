# 🚀 Hướng dẫn Deploy Smart Contract lên Pione Zerochain

## ❌ **Vấn đề hiện tại:**
Smart contract chưa được deploy! Cần deploy trước khi có thể tạo NFT.

## ✅ **Cách deploy Smart Contract:**

### **Bước 1: Chuẩn bị Environment**

#### **1.1. Tạo file .env trong contract-project:**
```bash
cd contract-project
cp env.example .env
```

#### **1.2. Điền thông tin vào .env:**
```bash
# .env file
RPC_URL=https://rpc.zeroscan.org
PRIVATE_KEY=0x1234567890abcdef...  # Private key từ MetaMask
```

**Lưu ý:** 
- ✅ **RPC_URL:** Đã có sẵn
- ⚠️ **PRIVATE_KEY:** Cần lấy từ MetaMask

#### **1.3. Lấy Private Key từ MetaMask:**
1. Mở MetaMask
2. Click vào 3 chấm (⋮) → Account details
3. Click "Export private key"
4. Nhập password MetaMask
5. Copy private key (bắt đầu bằng 0x...)

### **Bước 2: Cài đặt Dependencies**

```bash
cd contract-project
npm install
```

### **Bước 3: Compile Smart Contract**

```bash
npx hardhat compile
```

**Kết quả mong đợi:**
```
✅ Compiled 1 Solidity file successfully
```

### **Bước 4: Deploy Smart Contract**

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
📊 Initial counts:
   - Learning Records: 0
   - Badges: 0
   - Portfolios: 0
👤 Contract owner: 0x742d35Cc...
🎉 Deployment completed successfully!
```

### **Bước 5: Cập nhật Environment Variables**

#### **5.1. Cập nhật contract-project/.env:**
```bash
# Thêm vào .env
CONTRACT_ADDRESS=0x1234567890abcdef...  # Address vừa deploy
```

#### **5.2. Cập nhật backend/.env:**
```bash
# Thêm vào backend/.env
EDUWALLET_DATASTORE_ADDRESS=0x1234567890abcdef...  # Address vừa deploy
```

#### **5.3. Cập nhật src/.env:**
```bash
# Thêm vào src/.env
REACT_APP_PORTFOLIO_CONTRACT_ADDRESS=0x1234567890abcdef...  # Address vừa deploy
```

## 🔧 **Troubleshooting:**

### **Lỗi 1: "Invalid private key"**
```bash
# Kiểm tra private key format
# Phải bắt đầu bằng 0x và có 64 ký tự hex
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### **Lỗi 2: "Insufficient funds"**
```bash
# Cần có PZO tokens trong ví để trả gas fee
# Mua PZO tokens hoặc xin testnet tokens
```

### **Lỗi 3: "Network not found"**
```bash
# Kiểm tra hardhat.config.js
# Đảm bảo network "pzo" được cấu hình đúng
```

### **Lỗi 4: "Contract compilation failed"**
```bash
# Kiểm tra Solidity version
# Đảm bảo pragma solidity ^0.8.20;
```

## 🎯 **Sau khi Deploy thành công:**

### **1. Kiểm tra trên Blockchain Explorer:**
```bash
# Mở https://zeroscan.org
# Tìm kiếm contract address
# Xem thông tin contract
```

### **2. Test Smart Contract:**
```bash
# Test API
curl http://localhost:3001/api/eduwallet/contract-info

# Kết quả:
{
  "success": true,
  "data": {
    "contractAddress": "0x1234567890abcdef...",
    "network": "pioneZero",
    "chainId": "5080"
  }
}
```

### **3. Test Frontend:**
```bash
# Khởi động frontend
cd src
npm start

# Vào trang CreateNFT
# Thử tạo Portfolio NFT
```

## 🚨 **Lưu ý quan trọng:**

### **Bảo mật:**
- ⚠️ **KHÔNG chia sẻ** private key
- ⚠️ **KHÔNG commit** .env file vào git
- ⚠️ **Sử dụng testnet** cho development

### **Gas Fee:**
- 💰 **Cần PZO tokens** để deploy
- 💰 **Gas fee** sẽ được trừ từ ví
- 💰 **Testnet** thường có gas fee thấp

### **Network:**
- 🌐 **Pione Zerochain** (Chain ID: 5080)
- 🌐 **RPC URL:** https://rpc.zeroscan.org
- 🌐 **Explorer:** https://zeroscan.org

## 🎉 **Kết quả cuối cùng:**

Sau khi deploy thành công:
- ✅ **Smart contract** đã deploy trên Pione Zerochain
- ✅ **Contract address** đã có
- ✅ **Environment variables** đã cập nhật
- ✅ **Frontend** có thể kết nối với contract
- ✅ **Backend** có thể tương tác với contract
- ✅ **Có thể tạo Portfolio NFT** trên blockchain

## 🚀 **Bước tiếp theo:**

1. ✅ Deploy smart contract
2. ✅ Cập nhật environment variables
3. ✅ Khởi động backend
4. ✅ Khởi động frontend
5. ✅ Test tạo Portfolio NFT

**Hãy thử deploy và cho tôi biết kết quả!**
