# 🚀 Hướng dẫn Deploy Smart Contract PZO và Point Token

## Bước 1: Chuẩn bị môi trường

### 1.1. Di chuyển vào thư mục contract

```bash
cd contract-project
```

### 1.2. Cài đặt dependencies (nếu chưa cài)

```bash
npm install
```

### 1.3. Tạo file .env trong thư mục contract-project

Tạo file `.env` với nội dung:

```env
# Private key của ví MetaMask (BỎ 0x ở đầu)
PRIVATE_KEY=your_private_key_here

# RPC URL của Pione Zero Chain
RPC_URL=https://rpc.zeroscan.org
```

**⚠️ LƯU Ý:**

- Lấy private key từ MetaMask: Settings → Security & Privacy → Show Private Key
- **KHÔNG BAO GIỜ** commit file .env lên Git
- Ví cần có đủ PZO token để trả gas fee

## Bước 2: Deploy Contract

### 2.1. Deploy PZO Token và Point Token

**⚠️ QUAN TRỌNG:** Đảm bảo bạn đã:

- Tạo file `.env` trong thư mục `contract-project` với PRIVATE_KEY hợp lệ
- Ví có đủ PZO token để trả gas fee

```bash
# Từ thư mục contract-project, chạy:
npx hardhat run scripts/deploy-tokens.js --network pzo
```

### 2.2. Lưu địa chỉ contract

Script sẽ in ra 2 địa chỉ contract:

```
✅ PZO Token deployed at: 0x...
✅ Point Token deployed at: 0x...
```

## Bước 3: Cập nhật file .env của Frontend

Mở file `f:/eduWallet/.env` và thêm địa chỉ contract vừa deploy:

```env
REACT_APP_BACKEND_URL=http://localhost:3003

# Blockchain Configuration
REACT_APP_PIONE_ZERO_RPC_URL=https://rpc.zeroscan.org

# Smart Contract Addresses - SAU KHI DEPLOY
REACT_APP_PZO_TOKEN_ADDRESS=0x... # Địa chỉ PZO Token
REACT_APP_POINT_TOKEN_ADDRESS=0x... # Địa chỉ Point Token
```

## Bước 4: Restart Frontend

```bash
# Quay lại thư mục root
cd ..

# Restart React dev server
npm start
```

## 🔍 Kiểm tra Deploy

### Xem contract trên Block Explorer

- Truy cập: https://zeroscan.org
- Dán địa chỉ contract để xem thông tin

### Test trong ứng dụng

1. Truy cập trang "Nạp Point"
2. Kết nối ví MetaMask
3. Kiểm tra số dư PZO và Point

## ⚠️ Troubleshooting

### Lỗi: "insufficient funds for gas"

- Đảm bảo ví có đủ PZO để trả phí gas
- Có thể claim test PZO từ faucet (nếu có)

### Lỗi: "invalid private key"

- Kiểm tra private key trong .env
- Đảm bảo bỏ ký tự "0x" ở đầu

### Lỗi: "contract address not found"

- Đảm bảo đã copy đúng địa chỉ contract
- Restart lại React dev server sau khi cập nhật .env

## 📚 Tài liệu tham khảo

- Hardhat Documentation: https://hardhat.org/docs
- Pione Zero Chain: https://zeroscan.org
- Ethers.js v5: https://docs.ethers.org/v5/
