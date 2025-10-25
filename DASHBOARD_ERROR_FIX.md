# Dashboard Error Fix - "Failed to load dashboard data"

## 🔍 Vấn đề phát hiện

Khi truy cập trang Admin Dashboard, xuất hiện lỗi: **"Failed to load dashboard data"**

## 🐛 Nguyên nhân

Sau khi kiểm tra kỹ lưỡng, tôi đã xác định được nguyên nhân chính:

### **Backend thiếu file `.env` chứa JWT_SECRET**

1. **Token validation bị lỗi**: 
   - Khi dashboard gọi API `/api/admin/dashboard`, token được gửi kèm theo header Authorization
   - Backend middleware `authenticateToken` sử dụng `JWT_SECRET` để verify token
   - Do không có file `.env`, `process.env.JWT_SECRET` = `undefined`
   - JWT verification thất bại → Lỗi 401: "Invalid token"

2. **Chi tiết lỗi**:
   ```
   Error: Invalid token
   at authenticateToken (C:\...\backend\src\middleware\auth.js:54:19)
   ```

## ✅ Giải pháp đã thực hiện

### 1. Tạo file `.env` cho backend

**File**: `eduWallet/backend/.env`

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/eduwallet

# JWT Configuration (QUAN TRỌNG!)
JWT_SECRET=eduwallet_super_secret_jwt_key_2024_hackathon
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=eduwallet_refresh_secret_key_2024_hackathon
JWT_REFRESH_EXPIRE=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Restart Backend Server

Sau khi tạo file `.env`, bắt buộc phải **restart backend server** để load các biến môi trường:

```powershell
# Tìm process đang chạy trên port 5000
netstat -ano | findstr :5000

# Kill process (thay <PID> bằng ID thực tế)
Stop-Process -Id <PID> -Force

# Start lại backend
cd eduWallet\backend
node app-with-api.js
```

## 📋 Kiểm tra lại

### Xác nhận Backend đã chạy:
```powershell
# Check port 5000
netstat -ano | findstr :5000
```

### Test Admin API:
```powershell
# Test login và dashboard
cd eduWallet\backend
node test-dashboard-simple.js
```

### Test trên Frontend:
1. Mở browser, truy cập: `http://localhost:3000/admin/login`
2. Login với:
   - Email: `admin@example.com`
   - Password: `Admin123456`
3. Sau khi login thành công, click vào "Dashboard"
4. Dashboard data sẽ load thành công!

## 🔧 Cấu trúc File Quan trọng

```
eduWallet/
├── backend/
│   ├── .env              ← FILE MỚI TẠO (QUAN TRỌNG!)
│   ├── env.example       ← Template
│   ├── app-with-api.js   ← Main server file
│   └── src/
│       ├── middleware/
│       │   └── auth.js   ← JWT verification
│       ├── routes/
│       │   └── admin.js  ← Admin routes
│       └── controllers/
│           └── adminController.js
└── src/
    ├── features/admin/
    │   ├── pages/
    │   │   └── AdminDashboard.js
    │   ├── services/
    │   │   └── adminService.js
    │   └── context/
    │       └── AdminContext.js
    └── App.js
```

## 🎯 Tóm tắt

### Vấn đề:
- ❌ Backend thiếu file `.env`
- ❌ JWT_SECRET không được định nghĩa
- ❌ Token validation thất bại → 401 Unauthorized

### Giải pháp:
- ✅ Tạo file `eduWallet/backend/.env` với JWT_SECRET
- ✅ Restart backend server
- ✅ Dashboard load data thành công!

## 📝 Lưu ý

1. **Bảo mật**: Trong production, sử dụng JWT_SECRET phức tạp và lưu trong biến môi trường server
2. **Git**: Thêm `.env` vào `.gitignore` để không commit secrets
3. **Backup**: Lưu giữ bản copy của `.env` ở nơi an toàn

## 🚀 Next Steps

Nếu vẫn gặp lỗi, kiểm tra:
1. MongoDB có đang chạy không: `mongod --version`
2. Port 5000 có bị conflict không
3. Frontend `.env` có đúng URL không: `REACT_APP_API_URL=http://localhost:5000/api`
4. Browser console có log chi tiết lỗi gì
