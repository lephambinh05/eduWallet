# Generate .htaccess từ Environment Variables

## 📖 Mô tả

Script này tự động tạo file `.htaccess` với Content Security Policy (CSP) được cấu hình từ các biến môi trường trong file `.env`.

## 🎯 Tính năng

- ✅ Tự động đọc cấu hình từ file `.env`
- ✅ Generate CSP header dựa trên BACKEND_URL và FRONTEND_URL
- ✅ Hỗ trợ môi trường development và production
- ✅ Tự động thêm WebSocket support
- ✅ Tự động chạy khi build

## 🚀 Cách sử dụng

### Tự động (Khuyến nghị)

Script sẽ tự động chạy khi bạn build project:

```bash
npm run build
```

### Thủ công

Chạy script độc lập:

```bash
npm run generate:htaccess
```

## ⚙️ Cấu hình

### File .env

Đảm bảo file `.env` của bạn có các biến sau:

```env
# Environment
NODE_ENV=production

# Backend Connection
REACT_APP_BACKEND_URL=https://api-eduwallet.mojistudio.vn
REACT_APP_FRONTEND_URL=https://eduwallet.mojistudio.vn
REACT_APP_API_BASE_URL=https://api-eduwallet.mojistudio.vn/api
REACT_APP_SOCKET_URL=https://api-eduwallet.mojistudio.vn
```

### Development Environment

Khi `NODE_ENV=development`, script sẽ tự động thêm:

- `http://localhost:3001`
- `http://localhost:5000`
- `ws://localhost:3001`
- `ws://localhost:5000`

vào CSP `connect-src` directive.

## 📁 Output

Script sẽ tạo file `.htaccess` tại:

1. `build/.htaccess` - Sau khi build
2. `deployment/eduwallet-frontend/.htaccess` - Để deploy

## 🔒 Content Security Policy

CSP được tạo tự động bao gồm:

### style-src

- `'self'`
- `'unsafe-inline'`
- `https://fonts.googleapis.com` (Google Fonts)
- `https://cdnjs.cloudflare.com` (Font Awesome)

### font-src

- `'self'`
- `data:`
- `https://fonts.gstatic.com` (Google Fonts)
- `https://cdnjs.cloudflare.com` (Font Awesome)

### connect-src

- `'self'`
- Backend URL từ `.env`
- WebSocket URL (tự động convert từ https:// sang wss://)
- Localhost URLs (chỉ trong development)

## 🛠️ Troubleshooting

### Lỗi: File .env không tồn tại

Đảm bảo bạn có file `.env` trong thư mục root của project. Bạn có thể copy từ `env.example`:

```bash
cp env.example .env
```

### Lỗi: CSP vẫn block resources

1. Kiểm tra file `.env` có đúng URL không
2. Chạy lại script: `npm run generate:htaccess`
3. Rebuild project: `npm run build`
4. Clear browser cache

### Kiểm tra CSP đã được áp dụng

Mở Developer Tools → Network → Click vào trang chính → Headers → Response Headers → Tìm `Content-Security-Policy`

## 📝 Ví dụ

### Development

```env
NODE_ENV=development
REACT_APP_BACKEND_URL=http://localhost:5000
```

Sẽ tạo CSP:

```
connect-src 'self' http://localhost:5000 http://localhost:3001 ws://localhost:5000 ws://localhost:3001;
```

### Production

```env
NODE_ENV=production
REACT_APP_BACKEND_URL=https://api-eduwallet.mojistudio.vn
```

Sẽ tạo CSP:

```
connect-src 'self' https://api-eduwallet.mojistudio.vn wss://api-eduwallet.mojistudio.vn;
```

## 🔄 Workflow

1. Cập nhật file `.env` với URLs mới
2. Chạy `npm run build`
3. Script tự động generate `.htaccess` với CSP phù hợp
4. Deploy folder `build/` lên server

## 💡 Best Practices

1. **Luôn cập nhật `.env`** trước khi build
2. **Kiểm tra CSP** sau khi deploy bằng Browser DevTools
3. **Backup file `.htaccess`** cũ trước khi deploy
4. **Test trên staging** trước khi deploy production

## 🤝 Liên hệ

Nếu có vấn đề, vui lòng tạo issue trên repository.
