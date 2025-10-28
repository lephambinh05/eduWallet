# ✅ Checklist Setup EduWallet - Từng bước chi tiết

## 🎯 **Mục tiêu:** Khắc phục tất cả lỗi và chạy được ứng dụng

---

## **BƯỚC 1: Chuẩn bị MetaMask** ⏱️ 5 phút

### ✅ **1.1. Lấy Private Key:**
- [ ] Mở MetaMask extension
- [ ] Click 3 chấm (⋮) → Account details
- [ ] Click "Export private key"
- [ ] Nhập password → Copy private key
- [ ] **Lưu private key an toàn!**

### ✅ **1.2. Thêm Pione Zerochain:**
- [ ] Click network dropdown trong MetaMask
- [ ] Click "Add network" → "Add a network manually"
- [ ] Điền thông tin:
  - Network Name: `Pione Zerochain`
  - RPC URL: `https://rpc.zeroscan.org`
  - Chain ID: `5080`
  - Currency Symbol: `PZO`
  - Block Explorer: `https://zeroscan.org`
- [ ] Click "Save"

### ✅ **1.3. Lấy PZO Tokens:**
- [ ] Chuyển sang network Pione Zerochain
- [ ] Copy địa chỉ ví
- [ ] Xin testnet tokens từ community hoặc mua PZO
- [ ] Kiểm tra balance (cần ít nhất 0.01 PZO)

---

## **BƯỚC 2: Tạo file .env** ⏱️ 2 phút

### ✅ **2.1. Tạo file .env trong thư mục gốc:**
```bash
# Frontend Environment Variables

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3003
REACT_APP_SOCKET_URL=http://localhost:3003

# Blockchain Configuration
REACT_APP_PIONE_ZERO_RPC_URL=https://rpc.zeroscan.org
REACT_APP_PIONE_CHAIN_RPC_URL=https://pione-chain.rpc.pione.tech

# Smart Contract Addresses (Sẽ cập nhật sau khi deploy)
REACT_APP_EDU_TOKEN_CONTRACT_ADDRESS=
REACT_APP_LEARN_PASS_NFT_CONTRACT_ADDRESS=
REACT_APP_CERTIFICATE_NFT_CONTRACT_ADDRESS=
REACT_APP_EDU_WALLET_FACTORY_CONTRACT_ADDRESS=
REACT_APP_EDU_WALLET_MARKETPLACE_CONTRACT_ADDRESS=
REACT_APP_PORTFOLIO_NFT_CONTRACT_ADDRESS=

# Point Token Contract
REACT_APP_POINT_TOKEN_CONTRACT_ADDRESS=
REACT_APP_PZO_TOKEN_CONTRACT_ADDRESS=

# EduWallet DataStore Contract
REACT_APP_EDUWALLET_DATASTORE_CONTRACT_ADDRESS=

# IPFS Configuration (Tùy chọn)
REACT_APP_PINATA_API_KEY=your_pinata_api_key
REACT_APP_PINATA_SECRET_KEY=your_pinata_secret_key

# Development
NODE_ENV=development
```

---

## **BƯỚC 3: Deploy Smart Contracts** ⏱️ 10 phút

### ✅ **3.1. Chuẩn bị contract-project:**
- [ ] `cd contract-project`
- [ ] Tạo file `.env` với nội dung:
  ```bash
  RPC_URL=https://rpc.zeroscan.org
  PRIVATE_KEY=0x1234567890abcdef...  # Private key từ MetaMask
  ```

### ✅ **3.2. Cài đặt và compile:**
- [ ] `npm install`
- [ ] `npx hardhat compile`

### ✅ **3.3. Deploy EduWallet DataStore:**
- [ ] `npx hardhat run scripts/deploy.js --network pzo`
- [ ] Copy contract address từ kết quả
- [ ] Cập nhật vào file .env: `REACT_APP_EDUWALLET_DATASTORE_CONTRACT_ADDRESS=0x...`

### ✅ **3.4. Deploy Token Contracts:**
- [ ] `npx hardhat run scripts/deploy-tokens.js --network pzo`
- [ ] Copy PZO Token address: `REACT_APP_PZO_TOKEN_CONTRACT_ADDRESS=0x...`
- [ ] Copy Point Token address: `REACT_APP_POINT_TOKEN_CONTRACT_ADDRESS=0x...`

---

## **BƯỚC 4: Khởi động Backend** ⏱️ 3 phút

### ✅ **4.1. Cài đặt và chạy backend:**
- [ ] `cd backend`
- [ ] `npm install`
- [ ] `npm start`
- [ ] Kiểm tra: http://localhost:3003/api/health

### ✅ **4.2. Cập nhật backend/.env:**
```bash
EDUWALLET_DATASTORE_ADDRESS=0x...  # Address vừa deploy
```

---

## **BƯỚC 5: Khởi động Frontend** ⏱️ 2 phút

### ✅ **5.1. Cài đặt và chạy frontend:**
- [ ] `cd ..` (về thư mục gốc)
- [ ] `npm install`
- [ ] `npm start`
- [ ] Mở: http://localhost:3000

---

## **BƯỚC 6: Kiểm tra** ⏱️ 5 phút

### ✅ **6.1. Kiểm tra console không có lỗi:**
- [ ] Mở Developer Tools (F12)
- [ ] Kiểm tra Console tab
- [ ] Không có lỗi React DOM warnings
- [ ] Không có lỗi contract connection

### ✅ **6.2. Test kết nối MetaMask:**
- [ ] Click "Connect Wallet" trong ứng dụng
- [ ] MetaMask popup xuất hiện
- [ ] Chọn account và approve
- [ ] Thấy địa chỉ ví hiển thị trong ứng dụng

### ✅ **6.3. Test tạo Portfolio NFT:**
- [ ] Vào trang CreateNFT
- [ ] Điền form thông tin
- [ ] Click "Tạo Portfolio NFT"
- [ ] MetaMask popup xuất hiện
- [ ] Approve transaction
- [ ] Thấy thông báo thành công

---

## **🎉 KẾT QUẢ MONG ĐỢI:**

Sau khi hoàn thành tất cả bước:
- ✅ Không còn lỗi React DOM warnings
- ✅ Không còn lỗi mockTransactionHash
- ✅ Backend chạy trên port 3003
- ✅ Smart contracts đã deploy và có addresses
- ✅ Frontend kết nối được với MetaMask
- ✅ Có thể tạo Portfolio NFT thành công
- ✅ Console không có lỗi

---

## **🚨 NẾU GẶP LỖI:**

### **Lỗi "Insufficient funds":**
- Kiểm tra balance PZO tokens
- Xin thêm testnet tokens

### **Lỗi "Invalid private key":**
- Kiểm tra private key format (0x + 64 ký tự hex)
- Copy lại private key từ MetaMask

### **Lỗi "Contract address undefined":**
- Kiểm tra file .env có contract addresses
- Đảm bảo đã deploy contracts thành công

### **Lỗi "Backend connection failed":**
- Kiểm tra backend có chạy không
- Kiểm tra port 3003 có bị chiếm không

---

## **📞 HỖ TRỢ:**

Nếu gặp vấn đề, hãy:
1. Kiểm tra lại từng bước trong checklist
2. Xem console errors chi tiết
3. Kiểm tra file .env có đúng format không
4. Đảm bảo MetaMask kết nối đúng network

**Chúc bạn thành công! 🚀**
