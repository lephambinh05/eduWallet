# 🚀 Update Server Setup - mojistudio.vn (Node.js)

## 📋 Overview

Server API bằng Node.js để cung cấp:

1. Version check endpoint
2. File download endpoint
3. Project management
4. Logging & monitoring

**Port:** 3006 (hoặc tùy chỉnh)

---

## 📁 Cấu Trúc Folder

```
update-server/
├── server.js                   # Main server
├── package.json               # Dependencies
├── ecosystem.config.js        # PM2 config
├── versions/                  # Version info files
│   ├── eduWallet.json
│   └── SHOPCLONE6.json
├── downloads/                 # ZIP files
│   ├── eduWallet-v2.0.0.zip
│   └── shopclone62Fx52sdfg.zip
└── logs/                      # Log files
    ├── access.log
    ├── eduWallet-checks.log
    └── downloads.log
```

---

## 🛠️ Cài Đặt

### **Bước 1: Upload lên server**

```bash
# Từ Windows
cd f:\eduWallet
scp -r update-server root@mojistudio.vn:/var/www/
```

### **Bước 2: Install dependencies**

```bash
# SSH vào server
ssh root@mojistudio.vn

cd /var/www/update-server
npm install
```

### **Bước 3: Tạo folders**

```bash
mkdir -p versions downloads logs
```

### **Bước 4: Upload version files**

Version files đã có sẵn trong `versions/`:

- `eduWallet.json`
- `SHOPCLONE6.json`

### **Bước 5: Upload ZIP files**

```bash
# Từ local
scp eduwallet-deployment.zip root@mojistudio.vn:/var/www/update-server/downloads/eduWallet-v2.0.0.zip
```

---

## 🚀 Chạy Server

### **Option 1: Node.js trực tiếp**

```bash
cd /var/www/update-server
node server.js
```

### **Option 2: PM2 (Recommended)**

```bash
cd /var/www/update-server
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Check status:**

```bash
pm2 status
pm2 logs mojistudio-update-server
```

---

## 🌐 Apache Proxy Setup

### **Thêm vào Apache config:**

```apache
# /etc/apache2/sites-available/mojistudio.vn.conf

<VirtualHost *:443>
    ServerName mojistudio.vn

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/mojistudio.vn/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/mojistudio.vn/privkey.pem

    # Proxy to update server
    ProxyPass /api http://localhost:3006/api
    ProxyPassReverse /api http://localhost:3006/api

    ProxyPass /project http://localhost:3006/project
    ProxyPassReverse /project http://localhost:3006/project

    ProxyPass /downloads http://localhost:3006/downloads
    ProxyPassReverse /downloads http://localhost:3006/downloads

    # Health check
    ProxyPass /health http://localhost:3006/health
    ProxyPassReverse /health http://localhost:3006/health
</VirtualHost>
```

**Reload Apache:**

```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
```

---

## 📡 API Endpoints

### **1. Version Check (Plain Text)**

```bash
GET https://mojistudio.vn/api/version.php?project=eduWallet

Response (text/plain):
2.0.0
```

### **2. Project Info (JSON)**

```bash
GET https://mojistudio.vn/project?name=eduWallet

Response (application/json):
{
  "name": "eduWallet",
  "version": "2.0.0",
  "description": "Auto-update system integrated",
  "downloadUrl": "/downloads/eduWallet-v2.0.0.zip",
  "fileSize": 314572800,
  "releaseDate": "2025-11-04T20:00:00Z",
  "changelog": [
    "Added auto-update system",
    "PHP to Node.js conversion"
  ]
}
```

### **3. Download File**

```bash
GET https://mojistudio.vn/downloads/eduWallet-v2.0.0.zip

Response: Binary ZIP file
```

### **4. Health Check**

```bash
GET https://mojistudio.vn/health

Response:
{
  "status": "ok",
  "uptime": 12345,
  "timestamp": "2025-11-04T20:00:00.000Z"
}
```

---

## 📝 Quản Lý Versions

### **Thêm/Update version mới:**

```bash
# Edit version file
nano /var/www/update-server/versions/eduWallet.json
```

**Cập nhật:**

```json
{
  "name": "eduWallet",
  "version": "2.1.0",
  "description": "New features added",
  "downloadUrl": "/downloads/eduWallet-v2.1.0.zip",
  "releaseDate": "2025-11-05T10:00:00Z"
}
```

**Upload file ZIP mới:**

```bash
scp eduWallet-v2.1.0.zip root@mojistudio.vn:/var/www/update-server/downloads/
```

**No restart required!** Server tự động đọc file JSON mới.

---

## 🔐 Security (Optional)

### **Bật Authentication:**

```javascript
// server.js
const CONFIG = {
  requireAuth: true,
  authToken: "your-secret-token-here",
};
```

**Client sử dụng:**

```javascript
// auto-update-php.js
const options = {
  headers: {
    Authorization: "Bearer your-secret-token-here",
  },
};
```

---

## 📊 Monitoring & Logs

### **Xem logs:**

```bash
# Access log
tail -f /var/www/update-server/logs/access.log

# Version checks
tail -f /var/www/update-server/logs/eduWallet-checks.log

# Downloads
tail -f /var/www/update-server/logs/downloads.log

# PM2 logs
pm2 logs mojistudio-update-server
```

### **Log format:**

```
access.log:
[2025-11-04T20:00:00.000Z] GET /api/version.php?project=eduWallet - IP: 160.30.112.42

eduWallet-checks.log:
[2025-11-04T20:00:00.000Z] IP: 160.30.112.42 - Project: eduWallet - Version: 2.0.0

downloads.log:
[2025-11-04T20:05:00.000Z] eduWallet-v2.0.0.zip - IP: 160.30.112.42
```

---

## 🧪 Testing

### **Test từ command line:**

```bash
# Test version check (plain text)
curl https://mojistudio.vn/api/version.php?project=eduWallet
# Output: 2.0.0

# Test project info (JSON)
curl https://mojistudio.vn/project?name=eduWallet
# Output: {...JSON...}

# Test health
curl https://mojistudio.vn/health
# Output: {"status":"ok",...}

# Test download
curl -O https://mojistudio.vn/downloads/eduWallet-v2.0.0.zip
```

### **Test từ client (auto-update):**

```bash
# Trên production server
cd /var/www/eduwallet-backend
node scripts/auto-update-php.js --force
```

---

## 🎯 Workflow Hoàn Chỉnh

### **Khi có version mới:**

1. **Build trên local:**

   ```powershell
   cd f:\eduWallet
   .\build-local.bat
   .\compress-deployment.bat
   ```

2. **Upload ZIP:**

   ```bash
   scp eduwallet-deployment.zip root@mojistudio.vn:/var/www/update-server/downloads/eduWallet-v2.1.0.zip
   ```

3. **Update version.json:**

   ```bash
   ssh root@mojistudio.vn
   nano /var/www/update-server/versions/eduWallet.json
   # Change version to 2.1.0
   ```

4. **Auto!** Tất cả production servers sẽ tự động update trong 6 giờ tới (hoặc ngay lập tức nếu chạy manual)

---

## 🔄 Multiple Projects Support

Server đã hỗ trợ nhiều projects:

- `eduWallet`
- `SHOPCLONE6`
- Thêm project mới: Tạo file `versions/<projectName>.json`

---

## 📈 Scaling

### **Load Balancing:**

```javascript
// Chạy nhiều instances với PM2
module.exports = {
  apps: [
    {
      name: "mojistudio-update-server",
      script: "./server.js",
      instances: 4, // 4 instances
      exec_mode: "cluster",
    },
  ],
};
```

### **CDN for downloads:**

Sử dụng CDN để serve file ZIP:

```json
{
  "downloadUrl": "https://cdn.mojistudio.vn/eduWallet-v2.0.0.zip"
}
```

---

## 🆘 Troubleshooting

### **Port already in use:**

```bash
sudo lsof -i :3006
sudo kill -9 <PID>
pm2 restart mojistudio-update-server
```

### **Permission denied:**

```bash
sudo chown -R $USER:$USER /var/www/update-server
chmod -R 755 /var/www/update-server
```

### **File not found:**

```bash
ls -la /var/www/update-server/downloads/
ls -la /var/www/update-server/versions/
```

---

## ✅ Checklist Setup

- [ ] Upload update-server/ folder lên /var/www/
- [ ] `npm install` dependencies
- [ ] Tạo folders: versions/, downloads/, logs/
- [ ] Upload version files (.json)
- [ ] Upload ZIP files
- [ ] Start PM2
- [ ] Configure Apache proxy
- [ ] Test endpoints (curl)
- [ ] Test auto-update từ client
- [ ] Setup monitoring/logs

---

**Done! Server API ready!** 🚀

URL Production:

- Version: https://mojistudio.vn/api/version.php?project=eduWallet
- Info: https://mojistudio.vn/project?name=eduWallet
- Download: https://mojistudio.vn/downloads/eduWallet-v2.0.0.zip
