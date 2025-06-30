# Hướng dẫn khắc phục sự cố - EduWallet

## 🚨 Lỗi thường gặp và cách khắc phục

### 1. Lỗi "react-scripts is not recognized"

**Nguyên nhân**: Dependencies chưa được cài đặt hoặc bị hỏng

**Cách khắc phục**:
```bash
# Xóa node_modules và package-lock.json
rm -rf node_modules package-lock.json

# Cài đặt lại dependencies
npm install

# Khởi động ứng dụng
npm start
```

### 2. Lỗi "Module not found"

**Nguyên nhân**: Import sai đường dẫn hoặc component chưa tồn tại

**Cách khắc phục**:
- Kiểm tra đường dẫn import
- Đảm bảo file component tồn tại
- Kiểm tra tên component có đúng không

### 3. Lỗi "Port 3000 is already in use"

**Cách khắc phục**:
```bash
# Tìm process đang sử dụng port 3000
netstat -ano | findstr :3000

# Kill process (thay PID bằng Process ID thực tế)
taskkill /PID <PID> /F

# Hoặc sử dụng port khác
set PORT=3001 && npm start
```

### 4. Lỗi "Cannot find module 'styled-components'"

**Cách khắc phục**:
```bash
npm install styled-components
```

### 5. Lỗi "Cannot find module 'framer-motion'"

**Cách khắc phục**:
```bash
npm install framer-motion
```

## 🔧 Các lệnh hữu ích

### Cài đặt dependencies
```bash
npm install
```

### Khởi động development server
```bash
npm start
```

### Build production
```bash
npm run build
```

### Kiểm tra lỗi
```bash
npm run test
```

### Xóa cache
```bash
npm cache clean --force
```

## 📱 Kiểm tra ứng dụng

### 1. Mở trình duyệt
- Truy cập: `http://localhost:3000`
- Ứng dụng sẽ tự động mở nếu cấu hình đúng

### 2. Kiểm tra Console
- Mở Developer Tools (F12)
- Xem tab Console để kiểm tra lỗi JavaScript

### 3. Kiểm tra Network
- Xem tab Network để kiểm tra các request

## 🎯 Cấu trúc thư mục quan trọng

```
eduWallet/
├── public/
│   └── index.html          # File HTML chính
├── src/
│   ├── components/         # Các component
│   ├── pages/             # Các trang
│   ├── context/           # Context providers
│   ├── utils/             # Utilities
│   ├── App.js             # Component chính
│   └── index.js           # Entry point
├── package.json           # Dependencies
└── README.md              # Hướng dẫn
```

## 🆘 Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề, hãy:

1. Kiểm tra console log
2. Chụp màn hình lỗi
3. Mô tả chi tiết các bước đã thực hiện
4. Liên hệ developer để được hỗ trợ

## 📝 Log lỗi

Để debug hiệu quả, hãy ghi lại:
- Thông báo lỗi chính xác
- Các bước đã thực hiện
- Phiên bản Node.js và npm
- Hệ điều hành
- Trình duyệt sử dụng 