# Hướng dẫn cấu hình Apache trên aaPanel cho EduWallet

## 📋 Tổng quan
Backend đang chạy trên port 3001, cần cấu hình Apache để proxy từ domain sang localhost.

## ✅ Kiểm tra đã hoàn thành

### 1. **File cấu hình Apache (`apache-production.conf`)**
```apache
<VirtualHost *:443>
    ServerName api-eduwallet.mojistudio.vn
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/api-eduwallet.mojistudio.vn/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/api-eduwallet.mojistudio.vn/privkey.pem
    
    # Proxy sang backend port 3001
    ProxyPreserveHost On
    ProxyPass / http://localhost:3001/
    ProxyPassReverse / http://localhost:3001/
    
    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*)           ws://localhost:3001/$1 [P,L]
    
    # CORS Headers
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Authorization, Content-Type, X-API-Key, X-Partner-ID"
</VirtualHost>
```

### 2. **Frontend .htaccess đã cập nhật**
```apache
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api-eduwallet.mojistudio.vn wss://api-eduwallet.mojistudio.vn https://rpc.zeroscan.org https://zeroscan.org https://api.pinata.cloud https://gateway.pinata.cloud;"
```

✅ **Đã thêm:**
- `wss://api-eduwallet.mojistudio.vn` - WebSocket
- `https://rpc.zeroscan.org` - Blockchain RPC
- `https://zeroscan.org` - Blockchain Explorer
- `https://api.pinata.cloud` - IPFS API
- `https://gateway.pinata.cloud` - IPFS Gateway

## 🚀 Các bước triển khai trên aaPanel

### **Bước 1: Cấu hình site trên aaPanel**

#### **Frontend: eduwallet.mojistudio.vn**
1. Vào aaPanel → Website → Add site
2. Domain: `eduwallet.mojistudio.vn`
3. Document Root: `/www/wwwroot/eduwallet.mojistudio.vn` (hoặc path bạn chọn)
4. Enable SSL (Let's Encrypt)

#### **Backend: api-eduwallet.mojistudio.vn**
1. Vào aaPanel → Website → Add site
2. Domain: `api-eduwallet.mojistudio.vn`
3. Chọn loại site: **Reverse Proxy**
4. Target URL: `http://127.0.0.1:3001`
5. Enable SSL (Let's Encrypt)

### **Bước 2: Enable Apache modules**

Trên aaPanel terminal, chạy:
```bash
# Enable proxy modules
a2enmod proxy
a2enmod proxy_http
a2enmod proxy_wstunnel
a2enmod rewrite
a2enmod headers
a2enmod ssl

# Restart Apache
systemctl restart apache2
```

### **Bước 3: Cấu hình Backend Proxy thủ công**

Nếu aaPanel không tự động cấu hình đúng, edit file config:

```bash
# Edit Apache config cho api-eduwallet
nano /www/server/panel/vhost/apache/api-eduwallet.mojistudio.vn.conf
```

Paste nội dung từ `apache-production.conf` (phần backend):
```apache
<VirtualHost *:443>
    ServerName api-eduwallet.mojistudio.vn
    
    SSLEngine on
    SSLCertificateFile /www/server/panel/vhost/cert/api-eduwallet.mojistudio.vn/fullchain.pem
    SSLCertificateKeyFile /www/server/panel/vhost/cert/api-eduwallet.mojistudio.vn/privkey.pem
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:3001/
    ProxyPassReverse / http://localhost:3001/
    
    # WebSocket
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*)           ws://localhost:3001/$1 [P,L]
    
    # CORS
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Authorization, Content-Type, X-API-Key, X-Partner-ID"
    
    ErrorLog /www/wwwlogs/api-eduwallet.mojistudio.vn.error.log
    CustomLog /www/wwwlogs/api-eduwallet.mojistudio.vn.access.log combined
</VirtualHost>
```

Restart Apache:
```bash
systemctl restart apache2
```

### **Bước 4: Upload Frontend files**

```bash
# Trên máy local, build frontend
cd f:\eduWallet
npm run build

# Upload toàn bộ folder build/ lên server
# Vào: /www/wwwroot/eduwallet.mojistudio.vn/

# Đảm bảo có file .htaccess trong build folder
```

### **Bước 5: Khởi động Backend**

```bash
# SSH vào server
cd /path/to/backend

# Install dependencies
npm install

# Tạo .env file (copy từ .env.example)
nano .env

# Set đúng PORT
PORT=3001
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/eduwallet

# Start với PM2
npm install -g pm2
pm2 start app-with-api.js --name eduwallet-backend
pm2 save
pm2 startup
```

### **Bước 6: Kiểm tra**

```bash
# Test backend trực tiếp
curl http://localhost:3001/health

# Test qua domain
curl https://api-eduwallet.mojistudio.vn/health

# Test WebSocket
wscat -c wss://api-eduwallet.mojistudio.vn
```

## 🔧 Troubleshooting

### **Lỗi 502 Bad Gateway**
```bash
# Kiểm tra backend có chạy không
pm2 status
pm2 logs eduwallet-backend

# Kiểm tra port 3001 có listening không
netstat -tulpn | grep 3001
```

### **Lỗi CORS**
Kiểm tra Apache config có header CORS chưa:
```apache
Header always set Access-Control-Allow-Origin "*"
```

### **WebSocket không kết nối**
```bash
# Enable module
a2enmod proxy_wstunnel
systemctl restart apache2

# Kiểm tra log
tail -f /www/wwwlogs/api-eduwallet.mojistudio.vn.error.log
```

### **CSP vẫn block localhost:3001**
1. **Clear browser cache:** Ctrl + Shift + R
2. **Check .htaccess in build folder:** Phải có CSP header mới
3. **Rebuild frontend:**
   ```bash
   npm run build
   # Upload lại build folder
   ```

## 📝 Checklist cuối cùng

- [ ] Apache modules enabled (proxy, proxy_http, proxy_wstunnel, headers, rewrite)
- [ ] SSL certificates installed cho cả 2 domain
- [ ] Backend running trên port 3001
- [ ] Apache config proxy đúng sang localhost:3001
- [ ] Frontend .htaccess có CSP với wss:// và blockchain URLs
- [ ] Build mới đã upload lên server
- [ ] CORS headers trong Apache config
- [ ] WebSocket rewrite rules trong Apache
- [ ] PM2 đã save và set startup cho backend

## 🎯 Kết quả mong đợi

- ✅ `https://eduwallet.mojistudio.vn` → Hiển thị React app
- ✅ `https://api-eduwallet.mojistudio.vn/health` → Backend health check
- ✅ `wss://api-eduwallet.mojistudio.vn` → WebSocket connection
- ✅ Console không có CSP errors
- ✅ API calls thành công từ frontend → backend

## 📞 Nếu vẫn gặp lỗi

1. **Check Apache logs:**
   ```bash
   tail -f /www/wwwlogs/api-eduwallet.mojistudio.vn.error.log
   ```

2. **Check Backend logs:**
   ```bash
   pm2 logs eduwallet-backend
   ```

3. **Check browser console:** F12 → Console & Network tab

4. **Test từng bước:**
   - Backend local: http://localhost:3001/health
   - Backend qua domain: https://api-eduwallet.mojistudio.vn/health
   - Frontend local build
   - Frontend deployed
