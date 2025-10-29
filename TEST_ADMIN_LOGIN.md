# 🔍 TEST ADMIN LOGIN - HƯỚNG DẪN KIỂM TRA

## ❌ VẤN ĐỀ ĐÃ PHÁT HIỆN

Sau khi login thành công, không tự động chuyển trang sang dashboard.

## 🔧 CÁC SỬA ĐỔI ĐÃ THỰC HIỆN

### 1. **Sửa AdminLogin.js**
- ✅ Thêm `setTimeout` 100ms trước khi navigate để đảm bảo state được update
- ✅ Không set `isLoading = false` nếu login thành công (để tránh re-render)

### 2. **Sửa AdminContext.js**
- ✅ Thêm `setIsLoading(false)` ngay sau khi update state
- ✅ Thêm error toast nếu login không thành công

### 3. **Sửa .env**
- ✅ Thêm `REACT_APP_API_URL=http://localhost:3003/api` để khớp với backend port

## 📋 CÁCH TEST

### Bước 1: Khởi động Backend
```bash
cd backend
npm start
```
Backend phải chạy ở: `http://localhost:3003`

### Bước 2: Khởi động Frontend
```bash
npm start
```
Frontend chạy ở: `http://localhost:3000`

### Bước 3: Test Login Flow

1. **Mở trình duyệt và vào:**
   ```
   http://localhost:3000/admin/login
   ```

2. **Mở DevTools Console (F12)** để xem logs

3. **Đăng nhập với tài khoản admin:**
   - Email: (email admin của bạn)
   - Password: (password admin của bạn)

4. **Kiểm tra Console logs theo thứ tự:**
   ```
   AdminLogin - Submitting form...
   AdminService.login - Raw response: ...
   AdminContext - API Response: ...
   AdminContext - User: ...
   AdminContext - Token: ...
   AdminContext - Saving to localStorage...
   AdminContext - Token saved successfully: true
   AdminContext - User saved successfully: true
   AdminContext - Login successful, state updated
   AdminLogin - Login result: {success: true, ...}
   AdminLogin - Login successful
   AdminLogin - Token saved: true
   AdminLogin - Navigating to dashboard...
   ```

5. **Kiểm tra localStorage:**
   - Mở DevTools > Application > Local Storage > http://localhost:3000
   - Phải có 2 keys:
     - `adminToken`: JWT token string
     - `adminUser`: JSON object với user info

6. **Kết quả mong đợi:**
   - ✅ Sau 100ms, tự động chuyển sang `/admin/dashboard`
   - ✅ Dashboard hiển thị stats
   - ✅ Sidebar hiển thị menu admin
   - ✅ Không bị redirect về login

## 🐛 TROUBLESHOOTING

### Vấn đề 1: Vẫn không chuyển trang
**Nguyên nhân có thể:**
- State chưa update kịp
- AdminRoute check `isAuthenticated()` trả về `false`

**Giải pháp:**
1. Kiểm tra console log xem state có update không
2. Kiểm tra `localStorage` có token và user không
3. Thử tăng timeout từ 100ms lên 200ms

### Vấn đề 2: Chuyển trang rồi nhưng bị redirect lại login
**Nguyên nhân:**
- `isAuthenticated()` hoặc `isAdmin()` trả về `false`
- State chưa được update từ localStorage

**Giải pháp:**
```javascript
// Trong AdminRoute.js, kiểm tra console log
AdminRoute - Check: {
  isLoading: false,
  isAuthenticated: true,  // Phải là true
  isAdmin: true,          // Phải là true
  hasToken: true,         // Phải là true
  hasUser: true,          // Phải là true
  userRole: 'admin'       // Phải là 'admin' hoặc 'super_admin'
}
```

### Vấn đề 3: API trả về 401 Unauthorized
**Nguyên nhân:**
- Backend không chạy
- Port không đúng
- Credentials sai

**Giải pháp:**
1. Kiểm tra backend đang chạy: `http://localhost:3003/health`
2. Kiểm tra .env có `REACT_APP_API_URL=http://localhost:3003/api`
3. Kiểm tra email/password đúng chưa
4. Chạy lại `node backend/check-admin.js` để verify admin user

### Vấn đề 4: Response structure không đúng
**Kiểm tra response từ API:**
```javascript
{
  success: true,
  message: "Login successful",
  data: {
    user: {
      _id: "...",
      email: "...",
      role: "admin",  // Phải là 'admin' hoặc 'super_admin'
      ...
    },
    accessToken: "eyJhbGc...",  // JWT token
    refreshToken: "..."
  }
}
```

## 🎯 CHECKLIST CUỐI CÙNG

- [ ] Backend đang chạy ở port 3003
- [ ] Frontend đang chạy ở port 3000
- [ ] File .env có `REACT_APP_API_URL=http://localhost:3003/api`
- [ ] Database có admin user (chạy `node backend/check-admin.js`)
- [ ] Console logs hiển thị "Login successful"
- [ ] localStorage có `adminToken` và `adminUser`
- [ ] Sau login, tự động chuyển sang `/admin/dashboard`
- [ ] Dashboard load được stats
- [ ] Không bị redirect về login page

## 📞 NẾU VẪN CÒN LỖI

Cung cấp cho tôi:
1. Screenshot console logs
2. Screenshot Network tab (XHR request `/api/auth/login`)
3. Screenshot localStorage
4. Mô tả chi tiết hành vi xảy ra
