# 🚀 Khởi động Frontend React App

## ❌ Lỗi hiện tại
```
HTTP ERROR 404
Không tìm thấy trang web nào ứng với địa chỉ web: http://localhost:3000/
```

## ✅ Giải pháp

### Bước 1: Kiểm tra thư mục hiện tại
```bash
# Kiểm tra bạn đang ở đâu
pwd

# Nếu bạn đang ở thư mục gốc eduWallet, hãy vào thư mục src
cd src
```

### Bước 2: Cài đặt dependencies
```bash
# Cài đặt các package cần thiết
npm install
```

### Bước 3: Khởi động React app
```bash
# Cách 1: Sử dụng script có sẵn
npm start

# Cách 2: Nếu cách 1 không work, dùng direct
npm run start:direct
```

### Bước 4: Kiểm tra kết quả
- Mở browser và truy cập: `http://localhost:3000`
- Bạn sẽ thấy trang EduWallet với giao diện đẹp

## 🔧 Nếu vẫn gặp lỗi

### Lỗi 1: Port 3000 đã được sử dụng
```bash
# Kiểm tra process đang dùng port 3000
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID_NUMBER> /F

# Hoặc sử dụng port khác
set PORT=3001 && npm start
```

### Lỗi 2: Dependencies chưa được cài
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
npm start
```

### Lỗi 3: Backend chưa chạy
```bash
# Mở terminal mới và khởi động backend
cd ../backend
npm start

# Sau đó quay lại frontend
cd ../src
npm start
```

## 📋 Checklist nhanh

- [ ] Đang ở thư mục `src/`
- [ ] Đã chạy `npm install`
- [ ] Đã chạy `npm start`
- [ ] Backend đang chạy trên port 3001
- [ ] Browser mở `http://localhost:3000`

## 🎯 Kết quả mong đợi

Khi thành công, bạn sẽ thấy:
- Terminal hiển thị: `webpack compiled successfully`
- Browser tự động mở `http://localhost:3000`
- Trang EduWallet với logo và menu navigation
- Có thể click vào các link như Dashboard, LearnPass, etc.

## 🆘 Nếu vẫn không work

```bash
# Debug chi tiết
npm run start:direct

# Hoặc kiểm tra logs
npm start 2>&1 | tee frontend.log
```

**Lưu ý:** Đảm bảo backend đang chạy trên port 3001 trước khi khởi động frontend!

