# 🔧 Hướng dẫn Fix CSP Errors - Development vs Production

## ⚠️ Vấn đề gặp phải

Khi test local, bạn gặp lỗi:

```
Connecting to 'http://localhost:3001/api/auth/register' violates CSP
```

## 🎯 Nguyên nhân

1. **Sử dụng sai environment** - Chạy production build để test local
2. **Hardcode URLs** - Một số file vẫn hardcode `localhost:3001` thay vì dùng `.env`
3. **CSP không match** - Production CSP không có localhost

## ✅ Đã fix

### 1. Fix hardcoded URLs

#### ❌ Before

```javascript
// src/pages/Transfer.js
await fetch('http://localhost:3001/api/transfer', {...})

// src/components/portfolio/PortfolioHistory.js
const base = "http://127.0.0.1:3001";
```

#### ✅ After

```javascript
// src/pages/Transfer.js
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
await fetch(`${BACKEND_URL}/api/transfer`, {...})

// src/components/portfolio/PortfolioHistory.js
const base = process.env.REACT_APP_BACKEND_URL ||
             process.env.REACT_APP_API_BASE_URL ||
             "http://localhost:5000";
```

### 2. Script generate CSP đúng theo environment

Script `generate-htaccess.js` tự động:

- Development → Thêm localhost:3001, localhost:5000 vào CSP
- Production → Chỉ có production URLs

## 🚀 Workflow đúng

### Development (Test Local)

```bash
# 1. Switch sang development environment
npm run env:dev

# 2. Start development server (KHÔNG dùng build)
npm start

# 3. Backend phải chạy trên port 5000
# cd backend && npm start
```

**Tại sao không dùng `npm run build`?**

- Build tạo static files → phải serve qua HTTP server → phức tạp
- Dev server có hot reload, debug tốt hơn
- CSP được apply bởi browser, không cần .htaccess local

### Production (Deploy lên Server)

```bash
# 1. Switch sang production environment
npm run env:prod

# 2. Build
npm run build

# 3. Deploy folder build/ lên server
# Server sẽ dùng .htaccess với CSP production
```

## 🔍 Check Environment hiện tại

```bash
# Check .env
cat .env | grep NODE_ENV
cat .env | grep REACT_APP_BACKEND_URL

# Hoặc trong code
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('BACKEND_URL:', process.env.REACT_APP_BACKEND_URL);
```

## 📋 Backend Setup

Backend cần chạy trên đúng port:

### backend/.env

```env
# Development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eduwallet
FRONTEND_URL=http://localhost:3000
```

### Start Backend

```bash
cd backend
npm start
# hoặc
node app-with-api.js
```

Verify backend đang chạy:

```bash
curl http://localhost:5000/health
```

## 🎨 Tổng hợp URLs

### Development

- Frontend: `http://localhost:3000` (React dev server)
- Backend: `http://localhost:5000` (Express server)
- CSP: Cho phép cả localhost:3001 và localhost:5000

### Production

- Frontend: `https://eduwallet.mojistudio.vn`
- Backend: `https://api-eduwallet.mojistudio.vn`
- CSP: Chỉ cho phép production URLs + WebSocket

## 🛠️ Troubleshooting

### Vẫn gặp CSP error trong development?

1. **Kiểm tra environment:**

   ```bash
   npm run env:dev
   cat .env | grep NODE_ENV
   # Phải là: NODE_ENV=development
   ```

2. **Khởi động lại dev server:**

   ```bash
   # Stop server (Ctrl+C)
   npm start
   ```

3. **Clear browser cache:**
   - Hard refresh: `Ctrl + Shift + R`
   - Hoặc: DevTools → Application → Clear storage

### Backend không chạy?

```bash
cd backend
cat .env | grep PORT
# Phải có: PORT=5000

# Start backend
npm start

# Check logs
tail -f logs/combined.log
```

### URLs không đúng?

Kiểm tra trong Browser DevTools Console:

```javascript
// Trong app
console.log("ENV:", {
  NODE_ENV: process.env.NODE_ENV,
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
});
```

## 📝 Quick Commands

```bash
# Development workflow
npm run env:dev          # Switch to dev
npm start                 # Start dev server (port 3000)

# Production workflow
npm run env:prod         # Switch to prod
npm run build            # Build for production
npm run generate:htaccess # Regenerate .htaccess

# Backend
cd backend
npm start                # Start backend (port 5000)

# Check status
npm run env:dev && cat .env | grep NODE_ENV
```

## ✨ Best Practice

1. ✅ **Development:** Dùng `npm start` (dev server)
2. ✅ **Production:** Dùng `npm run build` (static files)
3. ✅ **Không dùng build để test local** (trừ khi test production build)
4. ✅ **Luôn check environment** trước khi start
5. ✅ **Backend phải chạy** trước khi start frontend

## 🎉 Kết quả mong đợi

Sau khi fix:

- ✅ Không còn CSP errors
- ✅ Frontend kết nối được backend
- ✅ Development và Production tách biệt rõ ràng
- ✅ Tất cả URLs từ `.env`
- ✅ Dễ dàng switch giữa environments

---

**Lưu ý:** Nếu bạn muốn test production build trên local, cần:

1. Setup local HTTP server (Apache/Nginx)
2. Configure virtual host
3. Copy .htaccess vào document root
4. Nhưng đơn giản hơn là dùng `npm start` cho development!
