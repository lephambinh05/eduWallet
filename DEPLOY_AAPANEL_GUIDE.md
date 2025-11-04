# 🚀 Hướng dẫn Deploy lên aaPanel

## ⚠️ Lỗi thường gặp

Khi deploy lên aaPanel nhưng vẫn thấy CSP error với `localhost:3001`:
```
Connecting to 'http://localhost:3001/...' violates CSP
```

**Nguyên nhân:** Build với development environment thay vì production!

## ✅ Workflow đúng để Deploy

### Bước 1: Switch sang Production Environment

```bash
npm run env:prod
```

Verify:
```bash
cat .env | grep NODE_ENV
# Phải là: NODE_ENV=production

cat .env | grep REACT_APP_BACKEND_URL
# Phải là: REACT_APP_BACKEND_URL=https://api-eduwallet.mojistudio.vn
```

### Bước 2: Build với Production

```bash
npm run build
```

Script sẽ tự động:
- ✅ `prebuild` → Generate .htaccess từ .env production
- ✅ `build` → Build React app
- ✅ `postbuild` → Generate .htaccess lại để đảm bảo

Kết quả:
```
✅ Generated: F:\eduWallet\build\.htaccess
✅ Generated: F:\eduWallet\deployment\eduwallet-frontend\.htaccess
🌐 Backend URL: https://api-eduwallet.mojistudio.vn
🌐 Frontend URL: https://eduwallet.mojistudio.vn
```

### Bước 3: Verify .htaccess

```bash
# Check CSP trong .htaccess
cat build/.htaccess | grep "Content-Security-Policy"
```

Phải thấy:
```apache
connect-src 'self' https://api-eduwallet.mojistudio.vn wss://api-eduwallet.mojistudio.vn;
```

**KHÔNG được** thấy localhost URLs!

### Bước 4: Deploy lên aaPanel

#### Option 1: Upload qua FTP/SFTP

```bash
# Upload toàn bộ folder build/ vào document root
# Ví dụ: /www/wwwroot/eduwallet.mojistudio.vn/
```

#### Option 2: Git + Build trên Server

```bash
# SSH vào server
ssh user@your-server

# Pull code mới
cd /www/wwwroot/eduwallet.mojistudio.vn
git pull origin main

# Build trên server
npm run env:prod
npm run build

# Copy build files
cp -r build/* ./
```

#### Option 3: rsync (Khuyến nghị)

```bash
# Từ local
rsync -avz --delete build/ user@server:/www/wwwroot/eduwallet.mojistudio.vn/
```

### Bước 5: Verify trên Production

1. **Mở website:** https://eduwallet.mojistudio.vn
2. **Mở DevTools** (F12) → Console
3. **Check không còn CSP errors**
4. **Check Network** → Headers → Response Headers → Content-Security-Policy

Should see:
```
connect-src 'self' https://api-eduwallet.mojistudio.vn wss://api-eduwallet.mojistudio.vn;
```

## 🎯 aaPanel Configuration

### 1. Website Settings

```
Document Root: /www/wwwroot/eduwallet.mojistudio.vn
Default Document: index.html
```

### 2. Rewrite Rules

aaPanel tự động đọc `.htaccess` từ folder build.

Hoặc thêm vào Nginx config:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 3. SSL Certificate

- Install SSL cho domain: `eduwallet.mojistudio.vn`
- Force HTTPS (đã có trong .htaccess)

### 4. Backend Configuration

Backend cũng cần deploy trên aaPanel:

```
Domain: api-eduwallet.mojistudio.vn
Port: 5000 (hoặc tùy chỉnh)
Process Manager: PM2
```

#### backend/.env trên server:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/eduwallet
FRONTEND_URL=https://eduwallet.mojistudio.vn
JWT_SECRET=your-secret-key
```

## 📋 Checklist trước khi Deploy

- [ ] Chạy `npm run env:prod`
- [ ] Check `.env` có `NODE_ENV=production`
- [ ] Check `.env` có production URLs
- [ ] Chạy `npm run build`
- [ ] Verify `build/.htaccess` có production URLs
- [ ] Không có localhost trong CSP
- [ ] Upload folder `build/` lên server
- [ ] Test website trên domain
- [ ] Check CSP trong browser DevTools
- [ ] Test API calls hoạt động

## 🔧 Script Deploy tự động

Tạo file `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# 1. Switch to production
echo "📦 Switching to production environment..."
npm run env:prod

# 2. Build
echo "🔨 Building project..."
npm run build

# 3. Verify
echo "✅ Verifying build..."
if grep -q "localhost" build/.htaccess; then
    echo "❌ ERROR: .htaccess contains localhost URLs!"
    echo "Please check your .env file."
    exit 1
fi

# 4. Deploy (chọn 1 trong các options)
echo "📤 Deploying to server..."

# Option A: rsync
rsync -avz --delete build/ user@server:/www/wwwroot/eduwallet.mojistudio.vn/

# Option B: FTP (cần lftp)
# lftp -c "open -u user,pass ftp://server; mirror -R build/ /www/wwwroot/eduwallet.mojistudio.vn/"

echo "✨ Deployment completed!"
echo "🌐 Visit: https://eduwallet.mojistudio.vn"
```

Sử dụng:
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🛠️ Troubleshooting

### Vẫn thấy localhost trong CSP?

1. **Kiểm tra .env:**
   ```bash
   cat .env | grep NODE_ENV
   # Phải là production, không phải development
   ```

2. **Build lại:**
   ```bash
   rm -rf build
   npm run env:prod
   npm run build
   ```

3. **Clear cache trên server:**
   - aaPanel → Website → Tools → Clear Cache
   - Browser: Hard Refresh (Ctrl+Shift+R)

### API calls không hoạt động?

1. **Check CORS trên backend:**
   ```javascript
   // backend/app.js
   app.use(cors({
     origin: 'https://eduwallet.mojistudio.vn',
     credentials: true
   }));
   ```

2. **Check backend đang chạy:**
   ```bash
   curl https://api-eduwallet.mojistudio.vn/health
   ```

3. **Check SSL certificate** cho cả frontend và backend

### .htaccess không hoạt động?

1. **aaPanel → Website → Config:**
   - Enable `.htaccess` support
   - Module `mod_rewrite` phải enabled

2. **Hoặc dùng Nginx config:**
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
       
       add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com; connect-src 'self' https://api-eduwallet.mojistudio.vn wss://api-eduwallet.mojistudio.vn;";
   }
   ```

## 📊 Monitoring

### Check logs trên aaPanel

```bash
# Frontend logs (nếu có SSR)
tail -f /www/wwwlogs/eduwallet.mojistudio.vn.log

# Backend logs
tail -f /www/wwwroot/api-eduwallet.mojistudio.vn/logs/combined.log

# Nginx logs
tail -f /www/wwwlogs/nginx_error.log
```

### Check CSP violations

Browser DevTools → Console → Filter by "CSP"

## 🎉 Kết quả mong đợi

Sau khi deploy đúng:
- ✅ Website accessible tại https://eduwallet.mojistudio.vn
- ✅ Không còn CSP errors trong console
- ✅ API calls hoạt động với https://api-eduwallet.mojistudio.vn
- ✅ SSL certificate hợp lệ
- ✅ Performance tốt (gzip, caching)

## 💡 Tips

1. **Luôn test local trước** với `npm start` (development)
2. **Build production trước khi deploy** với `npm run env:prod && npm run build`
3. **Backup trước khi deploy** folder cũ trên server
4. **Use git tags** để mark versions đã deploy
5. **Monitor logs** sau khi deploy để catch errors sớm

---

**Quan trọng:** Đừng bao giờ build với development environment để deploy production!

```bash
# ❌ SAI
npm run env:dev
npm run build
# Deploy → Sẽ có localhost trong CSP!

# ✅ ĐÚNG
npm run env:prod
npm run build
# Deploy → Production URLs
```
