# Admin Users Page - "Failed to load users" Debug Guide

## 🔴 Lỗi: Failed to load users

Khi truy cập trang `/admin/users`, gặp lỗi "Failed to load users"

---

## 🧪 Debug Steps

### 1. Mở Console (F12) và navigate to /admin/users

Bạn sẽ thấy các logs sau:

```
✅ AdminAPI Request: GET /admin/users with token
✅ Fetching users with params: {page: 1, limit: 20, search: "", role: "", status: ""}
```

### 2. Kiểm tra Console Errors

#### Case 1: Network Error (ERR_CONNECTION_REFUSED)
```
❌ Error fetching users: Error: Network Error
❌ Error response: undefined
```

**Nguyên nhân:** Backend không chạy hoặc sai port

**Fix:**
```bash
cd backend
npm start
# Phải thấy: Server running on port 5000
```

#### Case 2: 401 Unauthorized
```
❌ Error fetching users: Error: Request failed with status code 401
❌ Error response: {status: 401, data: {message: "Unauthorized"}}
```

**Nguyên nhân:** Token không hợp lệ hoặc không được gửi

**Fix:**
```javascript
// Check trong Console:
localStorage.getItem('adminToken')
// Phải có giá trị, không null
```

#### Case 3: 403 Forbidden
```
❌ Error response: {status: 403, data: {message: "Access denied"}}
```

**Nguyên nhân:** User không có quyền admin

**Fix:** Đảm bảo user có role `admin` hoặc `super_admin`

#### Case 4: 404 Not Found
```
❌ Error response: {status: 404}
```

**Nguyên nhân:** Backend route không tồn tại

**Fix:** Check backend có endpoint `/api/admin/users` không

#### Case 5: 500 Internal Server Error
```
❌ Error response: {status: 500, data: {message: "..."}}
```

**Nguyên nhân:** Lỗi backend (database, logic, etc.)

**Fix:** Check backend console logs

---

## 🔍 Manual Testing

### Test 1: Check localStorage
```javascript
// Paste vào Console:
console.log('Admin Token:', localStorage.getItem('adminToken'));
console.log('Admin User:', JSON.parse(localStorage.getItem('adminUser')));
```

**Expected:**
```
Admin Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
Admin User: {username: "admin", role: "super_admin", ...}
```

### Test 2: Manual API Call
```javascript
// Paste vào Console:
const token = localStorage.getItem('adminToken');
fetch('http://localhost:5000/api/admin/users?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('Manual API Result:', data))
.catch(err => console.error('Manual API Error:', err));
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "total": 10,
      "page": 1,
      "totalPages": 1
    }
  }
}
```

### Test 3: Check Backend Logs

Khi gọi API, backend console sẽ log:

```
✅ GET /api/admin/users 200 45ms
```

Hoặc nếu có lỗi:
```
❌ GET /api/admin/users 401 Unauthorized
❌ GET /api/admin/users 500 Internal Server Error
```

---

## 🛠️ Common Fixes

### Fix 1: Token expired hoặc invalid

**Giải pháp:** Logout và login lại

```javascript
// Hoặc chạy trong Console:
localStorage.removeItem('adminToken');
localStorage.removeItem('adminUser');
window.location.href = '/admin/login';
```

### Fix 2: Backend không chạy

```bash
# Terminal backend
cd backend
npm start
```

### Fix 3: Database không có users

```bash
# Tạo test user
cd backend
node create-user-data.js
```

### Fix 4: CORS Error

Nếu thấy:
```
Access to fetch at 'http://localhost:5000/api/admin/users' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Fix:** Check backend CORS config trong `app-with-api.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

## 📊 Expected Console Output (Success)

```
AdminAPI Request: GET /admin/users with token
Fetching users with params: {page: 1, limit: 20, search: "", role: "", status: ""}
Users API response: {success: true, data: {users: Array(10), pagination: {…}}}
```

Sau đó trang sẽ hiển thị danh sách users.

---

## 🔄 After Code Changes

**Phải restart frontend:**
```bash
# Stop frontend (Ctrl+C)
npm start
```

---

## 📝 What to Report

Nếu vẫn gặp lỗi, báo cho developer:

1. **Console logs đầy đủ** (copy tất cả logs từ Console)
2. **Network tab** → Click vào request `/admin/users` → Copy Response
3. **Backend console logs** (terminal đang chạy backend)
4. **localStorage values:**
   ```javascript
   {
     adminToken: "...",
     adminUser: {...}
   }
   ```

---

**Debug Guide Version:** 1.0  
**Last Updated:** December 2024
