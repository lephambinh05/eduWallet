# 🎯 QUICK START - Admin Panel

## ✅ ĐÃ SỬA GÌ?

### Vấn đề: Frontend vẫn gọi port 5000 dù đã sửa .env
**Nguyên nhân:** React không load được file `.env` (lỗi của create-react-app hoặc cấu hình)

**Giải pháp:** Hardcode fallback URL từ port 5000 → 3003 trong `adminService.js`

## 🚀 CÁCH CHẠY

### 1. Start Backend (Terminal 1)
```bash
cd C:\Workspace\Hackathon_Pione\eduWallet\backend
.\start-backend.bat
```
**Phải thấy:** `🚀 Backend running on http://localhost:3003`

### 2. Start Frontend (Terminal 2)  
```bash
cd C:\Workspace\Hackathon_Pione\eduWallet
npm start
```
**Phải thấy:** `webpack compiled successfully`

### 3. Login Admin
1. Mở: `http://localhost:3000/admin/login`
2. Nhập:
   - Email: `admin@example.com`
   - Password: `Admin123456`
3. Click "Sign In"

## 🔍 KIỂM TRA

### Console phải hiển thị:
```
🔧 AdminService - Environment check:
   REACT_APP_API_URL: undefined
   REACT_APP_BACKEND_URL: undefined
   Using API_BASE_URL: http://localhost:3003/api  ← Phải là 3003!
```

### Network tab phải gọi:
```
POST http://localhost:3003/api/auth/login  ← Port 3003, KHÔNG phải 5000!
```

## ❌ NẾU VẪN LỖI

### 1. Kiểm tra backend có chạy không:
```bash
curl http://localhost:3003/health
# hoặc mở browser: http://localhost:3003/health
```

Phải trả về: `{"status":"OK",...}`

### 2. Hard refresh browser:
- Ctrl + Shift + R (Chrome/Edge)
- Hoặc: F12 → Network → Check "Disable cache" → F5

### 3. Xóa hoàn toàn cache React:
```bash
# Kill tất cả Node
taskkill /F /IM node.exe

# Xóa cache
rd /s /q node_modules\.cache
rd /s /q build

# Restart
npm start
```

## 📝 FILES ĐÃ SỬA

1. **`backend/app-with-api.js`**
   - Hardcode PORT = 3003
   - Fix dotenv path

2. **`backend/.env`**
   - Tạo lại file mới với encoding đúng

3. **`src/features/admin/services/adminService.js`**
   - Đổi fallback: `5000` → `3003`
   - Thêm debug logs

4. **`src/features/admin/pages/AdminLogin.js`**
   - Thêm setTimeout(100ms) trước navigate

5. **`src/features/admin/context/AdminContext.js`**
   - Thêm setIsLoading(false) sau login

6. **`.env` (root)**
   - Thêm `REACT_APP_API_URL=http://localhost:3003/api`

## 🎉 KẾT QUẢ MONG ĐỢI

✅ Login thành công → Toast "Welcome back, admin!"  
✅ Tự động chuyển sang `/admin/dashboard` sau 100ms  
✅ Dashboard load stats thành công  
✅ Sidebar hiển thị menu admin  
✅ Không bị redirect về login  

---

**Lưu ý:** Các warnings về duplicate index và deprecated options là **KHÔNG ẢNH HƯỞNG** đến chức năng!
