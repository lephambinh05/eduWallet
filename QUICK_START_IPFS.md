# 🚀 Quick Start: Mint Portfolio NFT với IPFS

## Option 1: Với Pinata (IPFS thật) - Khuyến nghị

### 1. Lấy Pinata API Keys (2 phút)

```
1. Vào: https://app.pinata.cloud/register
2. Đăng ký email
3. Vào API Keys → New Key
4. Copy: API Key và API Secret
```

### 2. Cập nhật .env

```bash
# Mở file .env và thêm:
REACT_APP_PINATA_API_KEY=paste_your_key_here
REACT_APP_PINATA_SECRET_KEY=paste_your_secret_here
```

### 3. Restart Frontend

```powershell
# Ctrl+C để stop, sau đó:
npm start
```

### 4. Mint NFT

```
1. Vào: http://localhost:3000
2. Click "Portfolio NFT"
3. Click "Mint Portfolio NFT"
4. Chọn data → Mint
5. Confirm MetaMask transaction
6. ✅ Done! NFT với IPFS thật
```

### 5. Xem NFT

```
Option 1: Trên Pinata
- Vào: https://app.pinata.cloud/pinmanager
- Xem files vừa upload

Option 2: Trên ZeroScan
- Copy transaction hash
- Vào: https://zeroscan.org/tx/{hash}

Option 3: Trên IPFS Gateway
- Copy IPFS hash từ console
- Vào: https://gateway.pinata.cloud/ipfs/{hash}
```

---

## Option 2: Không có Pinata (Mock mode)

### Cách hoạt động:

- ✅ Mint NFT vẫn thành công
- ⚠️ IPFS hash là mock (không phải thật)
- ⚠️ Data lưu trong database, không lên IPFS
- ✅ Phù hợp cho demo/testing

### Không cần làm gì:

1. Chỉ cần mint NFT như bình thường
2. System tự động dùng mock mode
3. Console log sẽ hiển thị: "⚠️ Pinata API keys not configured, using mock"

---

## 🔍 Check nếu IPFS đang hoạt động

### Kiểm tra console logs khi mint:

**Với Pinata (thật):**

```
📤 Uploading portfolio data to Pinata...
✅ Portfolio data uploaded to IPFS: QmXXX...
🔗 IPFS URL: https://gateway.pinata.cloud/ipfs/QmXXX...
```

**Mock mode:**

```
⚠️ Pinata API keys not configured, using mock IPFS hash
✅ Portfolio data uploaded to IPFS (mock): Qmxyz...
```

---

## ⚡ Troubleshooting

### Lỗi: "Pinata upload failed"

```
Kiểm tra:
- API keys đúng chưa?
- Internet connection OK?
- Pinata account còn dung lượng? (1GB free)
```

### Lỗi: "Failed to retrieve from IPFS"

```
Hệ thống tự động fallback về database
→ Không ảnh hưởng user experience
```

### NFT mint thành công nhưng không thấy data

```
1. Check transaction trên ZeroScan
2. Copy IPFS hash từ event logs
3. Thử truy cập: https://gateway.pinata.cloud/ipfs/{hash}
4. Nếu 404 → có thể IPFS chưa propagate (đợi 1-2 phút)
```

---

## 📊 Kiểm tra NFT đã mint

### Method 1: Browser Console

```javascript
// Mở Console (F12), paste code:
const service = new (
  await import("./src/services/portfolioNFTService.js")
).default();
await service.initialize(provider, signer);

// Lấy all NFTs của bạn:
const tokens = await service.getAllOwnerTokens(YOUR_ADDRESS);
console.log("My NFTs:", tokens);

// Xem chi tiết NFT:
const portfolio = await service.getCompletePortfolio(tokenId);
console.log(portfolio);
```

### Method 2: View Portfolio Page

```
1. Vào Portfolio NFT page
2. Click "View Portfolio"
3. Nhập token ID hoặc wallet address
4. Click Search
5. ✅ Xem full portfolio data
```

### Method 3: ZeroScan Explorer

```
1. Vào: https://zeroscan.org/address/{contract-address}
2. Click "Token Transfers" tab
3. Tìm transaction mint của bạn
4. Click vào để xem details
```

---

## 🎯 Expected Results

### Khi mint với Pinata:

- ✅ 2 files trên Pinata: portfolio data + metadata
- ✅ Transaction trên blockchain với IPFS hash
- ✅ NFT có thể view từ IPFS gateway
- ✅ Data immutable và verifiable

### Khi mint mock mode:

- ✅ Transaction trên blockchain thành công
- ⚠️ IPFS hash không trỏ đến data thật
- ⚠️ View portfolio lấy từ database
- ✅ Vẫn demo được flow

---

## 💡 Tips

### Tối ưu chi phí:

- Pinata free: 1GB storage, 100k files
- Đủ cho ~1000 portfolio NFTs
- Nếu hết → upgrade hoặc dùng mock

### Testing:

- Test với mock trước khi setup Pinata
- Khi chắc chắn flow OK → setup Pinata

### Production:

- Nên dùng Pinata hoặc NFT.storage
- Enable pinning để data permanent
- Backup IPFS hashes vào database

---

**Ready to mint! 🚀**

Bắt đầu với Option 1 (Pinata) để trải nghiệm full IPFS!
