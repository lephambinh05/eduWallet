# 🔧 Cấu hình Environment Variables - EduWallet

## 📋 Tổng quan

Dự án EduWallet sử dụng Environment Variables để quản lý tất cả các thông tin kết nối và cấu hình, bao gồm:

- Backend API URLs
- Blockchain RPC URLs
- Smart Contract Addresses
- IPFS/Pinata Configuration
- Content Security Policy (CSP)

## 📁 Các file Environment

```
.env                  # File chính (production mặc định)
.env.development     # Môi trường development (local)
.env.production      # Môi trường production (server)
env.example          # Template mẫu
```

## 🔐 Biến Environment quan trọng

### 1. Backend Connection

```env
# URL của Backend API
REACT_APP_BACKEND_URL=https://api-eduwallet.mojistudio.vn

# URL của Frontend
REACT_APP_FRONTEND_URL=https://eduwallet.mojistudio.vn

# Base URL cho API calls
REACT_APP_API_BASE_URL=https://api-eduwallet.mojistudio.vn/api

# WebSocket URL
REACT_APP_SOCKET_URL=https://api-eduwallet.mojistudio.vn
```

**Tác động:**

- `REACT_APP_BACKEND_URL` → Sử dụng trong `src/config/api.js`
- Tự động được thêm vào CSP `connect-src` directive
- WebSocket URL tự động convert sang `wss://`

### 2. Blockchain Configuration

```env
# RPC URL của Pione Zero Chain
REACT_APP_PIONE_ZERO_RPC_URL=https://rpc.zeroscan.org

# Chain ID
REACT_APP_CHAIN_ID=5080

# Network Name
REACT_APP_NETWORK_NAME=pionezero
```

**Tác động:**

- Sử dụng trong `src/config/blockchain.js`
- Cấu hình kết nối với blockchain network

### 3. Smart Contract Addresses

```env
# Token Contracts
REACT_APP_PZO_TOKEN_ADDRESS=0x8DCdD7AdCa0005E505E0A78E8712fBb4f0AFC370
REACT_APP_POINT_TOKEN_ADDRESS=0x19fa269A44De59395326264Db934C73eE70FF03e

# NFT Contract
REACT_APP_PORTFOLIO_NFT_ADDRESS=0xA50a542B08CeEA9A0AAf89497288890d38aA0971
```

**Tác động:**

- Sử dụng trong các service files (`pointService.js`, `portfolioNFTService.js`)
- Không cần rebuild app khi thay đổi contract addresses (chỉ cần restart)

### 4. IPFS Configuration

```env
# Pinata API Keys
REACT_APP_PINATA_API_KEY=your_api_key
REACT_APP_PINATA_SECRET_KEY=your_secret_key
REACT_APP_PINATA_JWT=your_jwt_token
```

**Tác động:**

- Sử dụng trong `src/services/ipfsService.js`
- Upload NFT metadata và images lên IPFS

## 🚀 Workflow sử dụng

### Development (Local)

1. **Sử dụng `.env.development`:**

   ```bash
   # React tự động load .env.development khi chạy npm start
   npm start
   ```

2. **CSP sẽ bao gồm localhost:**
   - `http://localhost:3001`
   - `http://localhost:5000`
   - `ws://localhost:3001`
   - `ws://localhost:5000`

### Production (Server)

1. **Cập nhật `.env` hoặc `.env.production`:**

   ```env
   NODE_ENV=production
   REACT_APP_BACKEND_URL=https://api-eduwallet.mojistudio.vn
   ```

2. **Build project:**

   ```bash
   npm run build
   ```

3. **Script tự động chạy:**

   - `prebuild` → Generate `.htaccess` từ `.env`
   - `build` → Build React app
   - `postbuild` → Generate `.htaccess` lại để đảm bảo sync

4. **Deploy:**
   - Upload folder `build/` lên server
   - File `.htaccess` đã có CSP phù hợp với URLs trong `.env`

## 🔒 Content Security Policy (CSP)

CSP được tự động generate từ environment variables:

### Cách hoạt động

1. Script `scripts/generate-htaccess.js` đọc file `.env`
2. Lấy `REACT_APP_BACKEND_URL` và `REACT_APP_FRONTEND_URL`
3. Generate CSP directives tự động:

```javascript
// Ví dụ với REACT_APP_BACKEND_URL=https://api-eduwallet.mojistudio.vn

connect-src 'self'
            https://api-eduwallet.mojistudio.vn
            wss://api-eduwallet.mojistudio.vn
```

### Fixed Resources (luôn có trong CSP)

```
style-src:
  - 'self' 'unsafe-inline'
  - https://fonts.googleapis.com
  - https://cdnjs.cloudflare.com

font-src:
  - 'self' data:
  - https://fonts.gstatic.com
  - https://cdnjs.cloudflare.com
```

## 🛠️ Troubleshooting

### ❌ Lỗi: CSP block requests

**Nguyên nhân:** URLs trong `.env` không khớp với URLs thực tế

**Giải pháp:**

1. Kiểm tra `.env`:

   ```bash
   cat .env | grep REACT_APP_BACKEND_URL
   ```

2. Chạy lại generate script:

   ```bash
   npm run generate:htaccess
   ```

3. Rebuild:
   ```bash
   npm run build
   ```

### ❌ Lỗi: Environment variables undefined

**Nguyên nhân:** Biến không bắt đầu với `REACT_APP_`

**Giải pháp:** Create React App chỉ expose variables có prefix `REACT_APP_`:

```env
✅ REACT_APP_BACKEND_URL=...
❌ BACKEND_URL=...
```

### ❌ Lỗi: Changes không apply sau build

**Nguyên nhân:** Browser cache hoặc file `.env` không được đọc

**Giải pháp:**

1. Clear build folder:

   ```bash
   rm -rf build
   npm run build
   ```

2. Hard refresh browser (Ctrl + Shift + R)

3. Check environment variables được load:
   ```javascript
   console.log(process.env.REACT_APP_BACKEND_URL);
   ```

## 📝 Best Practices

### ✅ DO

1. **Luôn sử dụng prefix `REACT_APP_`** cho frontend variables
2. **Không commit secrets** vào git (API keys, private keys)
3. **Sử dụng `.env.example`** như template
4. **Chạy `npm run generate:htaccess`** sau khi update `.env`
5. **Test CSP** bằng Browser DevTools sau deploy

### ❌ DON'T

1. ❌ Hardcode URLs trong source code
2. ❌ Commit file `.env` lên git
3. ❌ Sử dụng different URLs giữa `.env` và hardcoded
4. ❌ Quên rebuild sau khi thay đổi environment variables

## 🔄 Migration từ hardcoded URLs

### Before (Hardcoded)

```javascript
// src/config/api.js
const API_BASE_URL = "https://api-eduwallet.mojistudio.vn";
```

```apache
# .htaccess
Header set Content-Security-Policy "connect-src 'self' https://api-eduwallet.mojistudio.vn;"
```

### After (Environment Variables)

```env
# .env
REACT_APP_BACKEND_URL=https://api-eduwallet.mojistudio.vn
```

```javascript
// src/config/api.js
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
```

```bash
# Build tự động generate .htaccess với CSP đúng
npm run build
```

## 📚 Tham khảo

- [Create React App - Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Script Generate .htaccess](./HTACCESS_GUIDE.md)

## 💡 Tips

### Kiểm tra environment variables đang được load

Tạo file `src/test-env.js`:

```javascript
console.log("REACT_APP_BACKEND_URL:", process.env.REACT_APP_BACKEND_URL);
console.log("REACT_APP_FRONTEND_URL:", process.env.REACT_APP_FRONTEND_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);
```

Import trong `src/index.js`:

```javascript
import "./test-env";
```

### Xem CSP đã được áp dụng

```bash
# Trong Browser DevTools
Network → Document → Headers → Response Headers → Content-Security-Policy
```

### Generate .htaccess với environment khác

```bash
# Development
NODE_ENV=development npm run generate:htaccess

# Production
NODE_ENV=production npm run generate:htaccess
```

## 🤝 Liên hệ hỗ trợ

Nếu gặp vấn đề với cấu hình environment variables, vui lòng:

1. Check logs: `npm run build`
2. Kiểm tra file đã generate: `deployment/eduwallet-frontend/.htaccess`
3. Tạo issue với thông tin chi tiết
