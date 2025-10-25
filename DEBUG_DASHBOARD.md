# Debug Dashboard - "Failed to load dashboard data"

## 🔍 Tình trạng hiện tại

✅ Dashboard hiển thị (authentication OK)
❌ Lỗi "Failed to load dashboard data" khi load dữ liệu

## 🛠️ Các thay đổi đã thực hiện

### 1. **Cải thiện Error Handling trong AdminDashboard.js**

- Thêm nhiều console.log để track request/response
- Tách riêng việc fetch activities (không fail toàn bộ dashboard nếu activities lỗi)
- Hiển thị lỗi chi tiết hơn trong toast message

### 2. **Thêm Logging trong adminService.js**

- Log API base URL
- Log request và response details

## 📋 Các bước Debug

### Bước 1: Kiểm tra Browser Console

1. Mở trình duyệt và truy cập: `http://localhost:3000/admin/login`
2. Login với:
   - Email: `admin@example.com`
   - Password: `Admin123456`
3. Click vào "Dashboard"
4. **Mở Developer Tools (F12) → Console tab**
5. Xem các log messages:

```javascript
// Các log cần chú ý:
AdminDashboard - Component mounted
AdminDashboard - Token exists: true
AdminDashboard - Fetching dashboard data...
AdminService.getDashboardStats - Making request to /admin/dashboard
AdminService.getDashboardStats - API Base URL: http://localhost:5000/api
```

### Bước 2: Kiểm tra Network Tab

1. Trong Developer Tools, chuyển sang **Network tab**
2. Reload trang dashboard
3. Tìm request đến `/admin/dashboard`
4. Kiểm tra:
   - **Request Headers**: Có `Authorization: Bearer <token>` không?
   - **Response Status**: 200, 401, 500?
   - **Response Body**: Dữ liệu có đúng format không?

### Bước 3: Kiểm tra Backend

Backend đang chạy trên process **27308** tại port **5000**.

Kiểm tra backend logs trong terminal để xem:
- Request có đến backend không?
- Có lỗi gì trong quá trình xử lý không?

### Bước 4: Test API trực tiếp

Chạy test script để verify API:

```powershell
cd C:\Workspace\Hackathon_Pione\eduWallet\backend
node quick-test.js
```

## 🎯 Các vấn đề có thể gặp

### Vấn đề 1: Token không hợp lệ

**Triệu chứng:**
- Response status: 401 Unauthorized
- Error: "Invalid token" hoặc "Token expired"

**Nguyên nhân:**
- Token được tạo TRƯỚC khi có file `.env` (với JWT_SECRET khác)
- Token đã expire

**Giải pháp:**
1. Logout khỏi admin
2. Login lại (token mới sẽ được tạo với JWT_SECRET đúng)

```javascript
// Hoặc clear localStorage trong console:
localStorage.removeItem('adminToken');
localStorage.removeItem('adminUser');
// Sau đó login lại
```

### Vấn đề 2: CORS Error

**Triệu chứng:**
- Console error: "CORS policy: No 'Access-Control-Allow-Origin'"
- Request bị block

**Giải pháp:**
Kiểm tra backend `.env`:
```env
CORS_ORIGIN=http://localhost:3000
```

### Vấn đề 3: API Response Structure không đúng

**Triệu chứng:**
- Stats không hiển thị
- Console log: "Invalid response structure"

**Kiểm tra:**
Response từ `/admin/dashboard` phải có structure:
```json
{
  "success": true,
  "data": {
    "stats": {
      "overview": { ... },
      "usersByRole": { ... },
      "recentUsers": [ ... ]
    }
  }
}
```

Frontend expect:
```javascript
statsResponse.data.stats
```

### Vấn đề 4: Backend không load file .env

**Triệu chứng:**
- JWT_SECRET vẫn undefined
- Token validation fails

**Giải pháp:**
```powershell
# Kill backend process
Stop-Process -Id 27308 -Force

# Restart backend
cd eduWallet\backend
node app-with-api.js
```

## 📝 Checklist

- [ ] Backend đang chạy trên port 5000
- [ ] MongoDB đang chạy
- [ ] File `backend/.env` tồn tại với JWT_SECRET
- [ ] Frontend `.env` có `REACT_APP_API_URL=http://localhost:5000/api`
- [ ] Đã login lại sau khi thay đổi JWT_SECRET
- [ ] Browser console không có CORS error
- [ ] Network tab shows request to `/admin/dashboard` with status 200
- [ ] Response có đúng structure

## 🔧 Quick Fixes

### Fix 1: Restart Everything

```powershell
# 1. Stop backend
Stop-Process -Id 27308 -Force

# 2. Start backend
cd eduWallet\backend
node app-with-api.js

# 3. Clear browser cache và reload frontend
# Hoặc hard refresh: Ctrl+Shift+R
```

### Fix 2: Clear Auth State

```javascript
// Trong browser console:
localStorage.clear();
// Reload page và login lại
```

### Fix 3: Check API Directly

```powershell
# Test với curl (hoặc Postman)
# 1. Login
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"Admin123456\"}"

# Copy token từ response

# 2. Get Dashboard
curl -X GET http://localhost:5000/api/admin/dashboard ^
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

## 📊 Expected Output

Khi mọi thứ hoạt động đúng, browser console sẽ hiển thị:

```
AdminDashboard - Component mounted
AdminDashboard - Token exists: true
AdminDashboard - User exists: true
AdminDashboard - Fetching dashboard data...
AdminDashboard - Token before request: eyJhbGciOiJIUzI1NiIsI...
AdminService.getDashboardStats - Making request to /admin/dashboard
AdminService.getDashboardStats - API Base URL: http://localhost:5000/api
AdminAPI Request: GET /admin/dashboard with token
AdminService.getDashboardStats - Response received: {...}
AdminDashboard - Stats response: {...}
AdminDashboard - Stats response.data: {...}
AdminDashboard - Stats response.data.stats: {...}
AdminDashboard - Stats set successfully
```

Dashboard sẽ hiển thị:
- Total Users
- Active Users  
- New This Month
- Blocked Users
- Recent activities (hoặc empty nếu không có)

## 🆘 Nếu vẫn lỗi

Gửi cho tôi output của:

1. **Browser Console** (toàn bộ logs khi vào dashboard)
2. **Network Tab** (request details của `/admin/dashboard`)
3. **Backend Terminal** (logs khi request đến)
4. **Output của quick-test.js**

Tôi sẽ phân tích và tìm nguyên nhân chính xác!
