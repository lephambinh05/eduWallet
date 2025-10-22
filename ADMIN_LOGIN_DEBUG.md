# Admin Login Debug Guide

## 🐛 Vấn đề: Login thành công nhưng không redirect

### Debug Steps:

1. **Mở Console (F12) trước khi login**

2. **Login với admin credentials:**
   - Email: `admin@example.com`
   - Password: `Admin123456`

3. **Kiểm tra Console logs theo thứ tự:**

```
Bước 1: AdminContext - API Response: {success: true, data: {...}}
Bước 2: AdminContext - User role: admin (hoặc super_admin)
Bước 3: AdminContext - Login successful, returning success
Bước 4: Login result: {success: true, user: {...}}
Bước 5: Navigating to dashboard...
```

### ✅ Nếu thấy TẤT CẢ logs trên → Vấn đề ở navigation

**Giải pháp đã áp dụng:** Thêm `setTimeout` 100ms trước khi navigate

### ❌ Nếu KHÔNG thấy log "Navigating to dashboard..."

**Có thể:**
1. `result.success` là `undefined` hoặc `false`
2. Backend response format không đúng

**Check:**
```javascript
// Console log sẽ show:
Login result: {success: false, ...}  // ← Lỗi ở đây
```

### ❌ Nếu thấy "AdminContext - Response not successful"

**Nguyên nhân:** Backend không trả `response.success = true`

**Fix:** Check backend response format trong `backend/src/routes/auth.js`

---

## 🔧 Các vấn đề phổ biến:

### 1. Backend response format sai

**Expected:**
```json
{
  "success": true,
  "data": {
    "user": { "username": "admin", "role": "admin" },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

**Check backend log:**
```bash
# Terminal backend sẽ show request
POST /api/auth/login 200 77ms
```

### 2. User role không phải admin

**Error log:**
```
AdminContext - User role: student  ← Lỗi
Access denied. Admin privileges required.
```

**Fix:** Đảm bảo user có role `admin` hoặc `super_admin`

### 3. Navigation bị block bởi useEffect

**Symptom:** Thấy "Navigating to dashboard..." nhưng không redirect

**Reason:** `useEffect` auto-redirect đang conflict

**Fix:** Đã thêm `setTimeout` delay 100ms

### 4. AdminRoute redirect về login

**Symptom:** Redirect tới dashboard rồi bị đá về login ngay

**Reason:** `isAuthenticated()` return false

**Check:**
```javascript
// Trong AdminRoute.js
console.log('Is Authenticated:', isAuthenticated());
console.log('Is Admin:', isAdmin());
console.log('Token:', localStorage.getItem('adminToken'));
```

---

## 🧪 Quick Test Script

Copy đoạn này vào Console để test:

```javascript
// Test 1: Check localStorage
console.log('Admin Token:', localStorage.getItem('adminToken'));
console.log('Admin User:', JSON.parse(localStorage.getItem('adminUser') || '{}'));

// Test 2: Manual navigate
window.location.href = '/admin/dashboard';

// Test 3: Check AdminContext
// (Chỉ chạy được nếu đang ở trang admin)
```

---

## 📊 Expected Console Output (Success Case)

```
AdminContext - API Response: {success: true, message: "Login successful", data: {…}}
AdminContext - User role: admin
AdminContext - Login successful, returning success
✅ Welcome back, admin!  (Toast notification)
Login result: {success: true, user: {…}}
Navigating to dashboard...
```

Sau đó trang sẽ redirect tới `/admin/dashboard`

---

## 🔄 Restart Required

Sau khi sửa code, **PHẢI restart frontend**:

```bash
# Stop frontend (Ctrl+C)
npm start
```

---

## 🆘 Nếu vẫn không work

**Báo cho developer:**
1. Screenshot toàn bộ Console logs
2. Screenshot Network tab (request/response)
3. Mô tả chi tiết: "Login thấy toast success nhưng..."

---

**Debug Guide Version:** 1.0  
**Last Updated:** December 2024
