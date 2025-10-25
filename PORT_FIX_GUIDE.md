# Port Configuration Fix - Backend Connection Issue

## ❌ Vấn đề

Khi register hoặc login, gặp lỗi:
```
net::ERR_CONNECTION_REFUSED
POST http://localhost:3003/api/auth/register
```

**Nguyên nhân:** Frontend đang gọi backend ở port **3003** nhưng backend đang chạy ở port **5000**.

---

## ✅ Giải pháp đã áp dụng

### 1. Tạo file `.env` với cấu hình đúng

**File:** `eduWallet/.env` (đã tạo)

```env
# Backend API Configuration
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_BASE_URL=http://localhost:5000

# Frontend Port
PORT=3000
```

### 2. Cập nhật `src/config/api.js`

**Trước:**
```javascript
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3003';
```

**Sau:**
```javascript
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
```

### 3. Cập nhật `env.example`

Template file đã được cập nhật với port đúng (5000).

---

## 🚀 Cách khắc phục

### Bước 1: Restart Backend

```powershell
# Terminal 1: Backend
cd c:\Workspace\Hackathon_Pione\eduWallet\backend
npm start
```

**Kiểm tra console thấy:**
```
✅ Server running on port 5000
✅ MongoDB connected successfully
```

### Bước 2: Restart Frontend

```powershell
# Terminal 2: Frontend
cd c:\Workspace\Hackathon_Pione\eduWallet

# Stop current server (Ctrl+C nếu đang chạy)

# Start lại để load .env mới
npm start
```

**Quan trọng:** Phải **restart** frontend để load biến môi trường từ file `.env` mới tạo!

### Bước 3: Test lại

#### Test User Registration:
1. Mở `http://localhost:3000/register`
2. Điền thông tin và register
3. **Mở F12 Network tab** → Thấy request gọi `http://localhost:5000/api/auth/register` ✅

#### Test Admin Login:
1. Mở `http://localhost:3000/admin/login`
2. Login với `admin@example.com` / `Admin123456`
3. **Mở F12 Network tab** → Thấy request gọi `http://localhost:5000/api/auth/login` ✅

---

## 📝 Files đã sửa

1. ✅ `eduWallet/.env` - **Tạo mới** với config đúng
2. ✅ `eduWallet/env.example` - Cập nhật port 3003 → 5000
3. ✅ `eduWallet/src/config/api.js` - Cập nhật default port 3003 → 5000
4. ✅ `eduWallet/src/features/admin/services/adminService.js` - Đã đúng port 5000

---

## 🔍 Kiểm tra các file khác còn dùng port 3003

Các files sau **VẪN CÒN** hardcode port 3003, nhưng sẽ sử dụng biến môi trường từ `.env` nếu có:

```javascript
// Những file này sẽ tự động dùng port 5000 từ .env
src/services/portfolioNFTService.js
src/services/ipfsService.js
src/components/portfolio/PortfolioMintingModal.js
src/components/portfolio/PortfolioHistory.js
src/pages/Portfolio.js
```

**Lý do không cần fix thủ công:**
- Tất cả đều dùng pattern: `process.env.REACT_APP_API_BASE_URL || 'http://localhost:3003'`
- Khi có `.env`, sẽ ưu tiên dùng `process.env.REACT_APP_API_BASE_URL=http://localhost:5000`
- Fallback `3003` chỉ chạy khi **KHÔNG CÓ** `.env`

---

## ⚠️ Lưu ý quan trọng

### 1. Phải restart frontend sau khi tạo/sửa `.env`

Create React App chỉ load biến môi trường khi **khởi động**, không tự reload.

```bash
# Sai: Chỉ save .env mà không restart
❌ Sửa .env → Save → Vẫn dùng port cũ

# Đúng: Phải restart
✅ Sửa .env → Save → Ctrl+C → npm start → Dùng port mới
```

### 2. File `.env` không được commit lên Git

File `.env` đã có trong `.gitignore`, chỉ commit `env.example`.

### 3. Backend phải chạy trước Frontend

```bash
# Thứ tự đúng:
1. Start backend (port 5000)
2. Start frontend (port 3000)
3. Test features
```

---

## 🎯 Kết quả mong đợi

Sau khi restart, tất cả requests sẽ gọi đúng port:

```
✅ User Registration → http://localhost:5000/api/auth/register
✅ User Login → http://localhost:5000/api/auth/login
✅ Admin Login → http://localhost:5000/api/auth/login
✅ Portfolio API → http://localhost:5000/api/portfolio/...
✅ Admin Dashboard → http://localhost:5000/api/admin/dashboard
```

---

## 🛠️ Troubleshooting

### Vẫn gặp ERR_CONNECTION_REFUSED?

**Kiểm tra:**

1. **Backend có chạy không?**
   ```powershell
   # Check process listening on port 5000
   netstat -ano | findstr :5000
   ```
   
2. **Frontend đã load .env chưa?**
   ```javascript
   // Thêm vào console để debug
   console.log('API Base URL:', process.env.REACT_APP_API_BASE_URL);
   ```
   → Phải thấy: `http://localhost:5000`

3. **Backend đang chạy port nào?**
   ```javascript
   // Check backend/src/app.js hoặc backend/app-with-api.js
   const PORT = process.env.PORT || 5000;
   ```

### Backend chạy nhưng vẫn 404?

- Check route trong backend có đúng không
- Example: `/api/auth/register` phải match với backend route

---

**Fixed By:** Development Team  
**Date:** December 2024  
**Status:** ✅ Resolved - Requires Frontend Restart
