# Fix Admin Users - "Failed to load users data"

## 🔍 Vấn đề

Khi truy cập trang **Admin Users**, xuất hiện lỗi: **"Failed to load users"**

## 🎯 Nguyên nhân

Vấn đề **GIỐNG HỆT** với Dashboard issue:

1. **Token trong localStorage là `undefined`** (do bug đã fix ở AdminContext.js)
2. Request đến `/api/admin/users` bị reject với **401 Unauthorized**
3. Backend trả về: "Invalid token"

## ✅ Giải pháp

### Bước 1: Đã fix AdminContext.js (DONE ✓)

File `src/features/admin/context/AdminContext.js` đã được sửa để lấy đúng field `accessToken` thay vì `token`.

### Bước 2: Clear localStorage và Login lại

**QUAN TRỌNG**: Token cũ (undefined) vẫn còn trong localStorage, nên bạn cần:

```javascript
// Mở Browser Console (F12)
localStorage.clear();
// Hoặc chỉ xóa admin tokens:
localStorage.removeItem('adminToken');
localStorage.removeItem('adminUser');
```

### Bước 3: Reload và Login lại

1. Reload trang (Ctrl+R hoặc F5)
2. Login lại với:
   - Email: `admin@example.com`
   - Password: `Admin123456`
3. Click vào "Users" trong menu

## 🔧 Các thay đổi đã thực hiện

### 1. Cải thiện Error Handling trong AdminUsers.js

```javascript
// Thêm nhiều console.log để debug
console.log('AdminUsers - Fetching users with params:', params);
console.log('AdminUsers - Token exists:', !!localStorage.getItem('adminToken'));
console.log('AdminUsers - Token preview:', localStorage.getItem('adminToken')?.substring(0, 20));

// Better error messages
toast.error('Failed to load users: ' + (error.response?.data?.message || error.message));
```

### 2. Thêm logging vào AdminService.getAllUsers

```javascript
getAllUsers: async (params) => {
  console.log('AdminService.getAllUsers - Making request to /admin/users');
  console.log('AdminService.getAllUsers - Params:', params);
  const response = await adminAPI.get('/admin/users', { params });
  console.log('AdminService.getAllUsers - Response received:', response);
  return response.data;
}
```

## 📋 Kiểm tra sau khi fix

### Browser Console (sau khi login lại):

```
AdminUsers - Fetching users with params: {page: 1, limit: 20, search: "", role: "", status: ""}
AdminUsers - Token exists: true
AdminUsers - Token preview: eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...
AdminService.getAllUsers - Making request to /admin/users
AdminAPI Request: GET /admin/users with token
AdminService.getAllUsers - Response received: {...}
AdminUsers - API response: {success: true, data: {...}}
AdminUsers - Users loaded successfully, count: 5
```

### Expected Result:

✅ Danh sách users hiển thị với các thông tin:
- Username
- Email
- Role (student, admin, super_admin)
- Status (Active/Inactive)
- Created date
- Actions (Edit, Delete, Block, etc.)

## 🐛 Nếu vẫn lỗi sau khi login lại

### Kiểm tra Console:

1. **Token vẫn undefined?**
   ```javascript
   // Kiểm tra trong console:
   localStorage.getItem('adminToken')
   // Phải trả về JWT token, KHÔNG phải "undefined"
   ```

2. **401 Unauthorized?**
   - Restart backend server (có thể .env chưa được load)
   ```powershell
   # Kill backend
   Stop-Process -Name node -Force
   
   # Start lại
   cd eduWallet\backend
   node app-with-api.js
   ```

3. **Response structure sai?**
   - Xem console log `AdminUsers - API response:`
   - Backend phải trả về:
   ```json
   {
     "success": true,
     "data": {
       "users": [...],
       "pagination": {...}
     }
   }
   ```

## 🔄 Flow hoàn chỉnh

```
1. User click "Users" trong Admin menu
   ↓
2. AdminUsers component mount
   ↓
3. useEffect → fetchUsers()
   ↓
4. AdminService.getAllUsers(params)
   ↓
5. adminAPI interceptor thêm token vào header
   ↓
6. GET /api/admin/users?page=1&limit=20
   ↓
7. Backend middleware authenticateToken verify JWT
   ↓
8. Backend controller getAllUsers query database
   ↓
9. Response: {success: true, data: {users: [...], pagination: {...}}}
   ↓
10. Frontend setUsers() và hiển thị table
```

## 📝 Checklist

- [x] Fix AdminContext.js (accessToken vs token)
- [x] Thêm error logging vào AdminUsers.js
- [x] Thêm logging vào AdminService.getAllUsers
- [ ] Clear localStorage
- [ ] Login lại
- [ ] Kiểm tra trang Users load thành công

## 🎊 Kết quả mong đợi

Sau khi login lại:
- ✅ Dashboard load data thành công
- ✅ Users page load danh sách users thành công
- ✅ Có thể search, filter, edit, delete users
- ✅ Tất cả admin features hoạt động bình thường

## 💡 Lưu ý quan trọng

**Tất cả các trang admin** (Dashboard, Users, Activities, Settings, etc.) đều sử dụng cùng một token từ localStorage. Nên sau khi fix token issue và login lại, **TẤT CẢ** các trang admin sẽ hoạt động bình thường!

## 🆘 Troubleshooting

### Lỗi: "Cannot read property 'users' of undefined"

**Nguyên nhân**: Response structure không đúng

**Giải pháp**: Kiểm tra backend có đang chạy không, kiểm tra route `/api/admin/users` có tồn tại không

### Lỗi: Network Error / CORS

**Nguyên nhân**: Backend không chạy hoặc CORS config sai

**Giải pháp**: 
1. Kiểm tra backend đang chạy: `netstat -ano | findstr :5000`
2. Kiểm tra `.env`: `CORS_ORIGIN=http://localhost:3000`

### Lỗi: "Token expired"

**Nguyên nhân**: Token đã hết hạn (sau 7 ngày theo config)

**Giải pháp**: Logout và login lại

---

**Happy Coding! 🚀**
