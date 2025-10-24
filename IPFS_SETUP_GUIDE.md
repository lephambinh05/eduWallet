# 🌐 IPFS Integration Setup Guide

## ✅ Đã hoàn thành

- ✅ Tích hợp Pinata API vào `ipfsService.js`
- ✅ Cập nhật upload functions để dùng IPFS thật
- ✅ Cập nhật retrieve functions để đọc từ IPFS gateways
- ✅ Cập nhật `portfolioNFTService.js` để đọc blockchain thật
- ✅ Thêm fallback để dùng mock nếu không có API keys

## 🔑 Bước 1: Lấy Pinata API Keys

### 1.1 Đăng ký tài khoản

1. Truy cập: https://app.pinata.cloud/
2. Đăng ký tài khoản miễn phí (1GB storage free)
3. Xác nhận email

### 1.2 Tạo API Keys

1. Đăng nhập vào Pinata Dashboard
2. Vào **API Keys** (menu bên trái)
3. Click **New Key**
4. Cấu hình quyền:
   - ✅ `pinFileToIPFS` - Upload files
   - ✅ `pinJSONToIPFS` - Upload JSON data
   - ✅ `unpin` (optional) - Xóa files
5. Đặt tên key: `eduWallet-Portfolio-NFT`
6. Click **Create Key**
7. **QUAN TRỌNG**: Copy và lưu lại:
   - `API Key`
   - `API Secret`
   - `JWT` (optional, dùng cho authentication nâng cao)

## 📝 Bước 2: Cập nhật .env

Mở file `.env` và thêm Pinata credentials:

```bash
# IPFS Configuration (Pinata)
REACT_APP_PINATA_API_KEY=your_pinata_api_key_here
REACT_APP_PINATA_SECRET_KEY=your_pinata_secret_key_here
REACT_APP_PINATA_JWT=your_pinata_jwt_here  # Optional
```

**Ví dụ:**

```bash
REACT_APP_PINATA_API_KEY=abc123def456ghi789jkl012
REACT_APP_PINATA_SECRET_KEY=xyz789abc123def456ghi789jkl012mno345
```

## 🔄 Bước 3: Restart Frontend

Sau khi cập nhật `.env`, restart frontend để load API keys:

```powershell
# Stop frontend (Ctrl+C)
npm start
```

## ✨ Tính năng mới

### 1. Upload Portfolio lên IPFS thật

- Data được upload lên Pinata (IPFS pinning service)
- Nhận real IPFS hash (không phải mock)
- Hash được lưu vào blockchain

### 2. Retrieve Portfolio từ IPFS thật

- Đọc data từ IPFS gateway
- Thử nhiều gateways để đảm bảo reliability:
  - Pinata Gateway (nhanh nhất)
  - IPFS.io
  - Cloudflare IPFS
  - Dweb.link
- Fallback về database nếu IPFS fail

### 3. Đọc thông tin từ Blockchain thật

- `getPortfolioSummary()` - Đọc info từ smart contract
- `getCompletePortfolio()` - Kết hợp blockchain + IPFS
- `getAllOwnerTokens()` - Lấy tất cả NFTs của user

## 🎯 Flow hoạt động mới

### Mint NFT:

1. User chọn data cần mint
2. Upload portfolio data lên Pinata → Nhận `ipfsHash1`
3. Tạo NFT metadata với ipfsHash1
4. Upload metadata lên Pinata → Nhận `ipfsHash2`
5. Gọi contract `mintPortfolio()` với:
   - Student info
   - GPA
   - `ipfsHash1` (portfolio data)
   - `ipfs://ipfsHash2` (metadata URI)
6. Nhận tokenId từ blockchain

### View Portfolio:

1. Tìm NFT bằng tokenId hoặc owner address
2. Gọi contract `getPortfolioInfo(tokenId)`
3. Nhận IPFS hash từ blockchain
4. Fetch data từ IPFS gateway
5. Hiển thị portfolio data

## 🧪 Test IPFS Integration

### Test 1: Kiểm tra API keys

```javascript
// Mở browser console (F12)
console.log(process.env.REACT_APP_PINATA_API_KEY); // Should show your key
```

### Test 2: Mint NFT với IPFS thật

1. Vào trang Portfolio NFT
2. Click "Mint Portfolio NFT"
3. Chọn data và mint
4. Kiểm tra console logs:
   - ✅ "📤 Uploading portfolio data to Pinata..."
   - ✅ "✅ Portfolio data uploaded to IPFS: Qm..."
   - ✅ "📤 Uploading NFT metadata to Pinata..."
   - ✅ "✅ NFT metadata uploaded to IPFS: Qm..."

### Test 3: View NFT data

1. Copy IPFS hash từ mint transaction
2. Truy cập: `https://gateway.pinata.cloud/ipfs/{your-hash}`
3. Sẽ thấy portfolio data JSON

## 🔍 Verify trên Pinata Dashboard

1. Vào https://app.pinata.cloud/pinmanager
2. Sẽ thấy files vừa upload:
   - `portfolio-{address}-{timestamp}.json`
   - `metadata-{timestamp}.json`
3. Click vào file để xem nội dung
4. Copy IPFS hash để test

## ⚠️ Fallback Behavior

Nếu **KHÔNG có Pinata API keys**:

- ✅ Vẫn hoạt động bình thường
- ⚠️ Sử dụng mock IPFS hash
- ⚠️ View Portfolio fallback về database

Nếu **CÓ Pinata API keys**:

- ✅ Upload thật lên IPFS
- ✅ Lưu hash thật vào blockchain
- ✅ Đọc data từ IPFS thật
- ✅ Fallback về database nếu IPFS gateway fail

## 📊 IPFS Gateways

Code tự động thử nhiều gateways:

1. **Pinata Gateway** (khuyến nghị)

   - URL: `https://gateway.pinata.cloud/ipfs/{hash}`
   - Nhanh, ổn định
   - Dedicated cho Pinata users

2. **IPFS.io** (public)

   - URL: `https://ipfs.io/ipfs/{hash}`
   - Miễn phí nhưng có thể chậm

3. **Cloudflare IPFS** (nhanh)

   - URL: `https://cloudflare-ipfs.com/ipfs/{hash}`
   - CDN toàn cầu

4. **Dweb.link** (backup)
   - URL: `https://dweb.link/ipfs/{hash}`
   - Stable backup option

## 🎓 Lợi ích của IPFS

### So với database thông thường:

- ✅ **Decentralized**: Không phụ thuộc server trung tâm
- ✅ **Immutable**: Data không thể bị sửa đổi
- ✅ **Permanent**: Data tồn tại vĩnh viễn
- ✅ **Verifiable**: Hash đảm bảo tính toàn vẹn
- ✅ **Accessible**: Ai cũng có thể verify

### Phù hợp cho:

- 📜 Chứng chỉ, bảng điểm
- 🎓 Portfolio học tập
- 🏆 Achievement badges
- 📊 Academic records

## 🚀 Next Steps

1. ✅ Setup Pinata API keys
2. ✅ Test mint NFT với IPFS thật
3. ✅ Verify data trên blockchain explorer
4. ✅ View portfolio từ IPFS
5. 🔄 (Optional) Add file upload cho images
6. 🔄 (Optional) Integrate with other IPFS services (Infura, NFT.storage)

## 📚 Resources

- [Pinata Documentation](https://docs.pinata.cloud/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [ERC721 Metadata Standard](https://eips.ethereum.org/EIPS/eip-721)

---

**Hoàn thành bởi:** GitHub Copilot
**Ngày:** 2025-10-24
