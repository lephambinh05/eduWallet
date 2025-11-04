# ========================================================

# HƯỚNG DẪN SỬ DỤNG TERMINUS ĐỂ DEBUG EDUWALLET

# ========================================================

## 📌 Kết nối SSH vào Server

### Cách 1: Dùng Terminus trong aaPanel

1. Đăng nhập aaPanel: https://your-server-ip:7800
2. Menu bên trái → **Terminal**
3. Chọn bash shell

### Cách 2: Dùng SSH Client (Windows Terminal, PuTTY)

```bash
ssh root@your-server-ip
# Hoặc
ssh -p 22 root@your-server-ip
```

---

## 🔍 LỆNH DEBUG CƠ BẢN

### 1. Kiểm tra cấu trúc thư mục

```bash
# Frontend
cd /www/wwwroot/eduwallet.mojistudio.vn
ls -la

# Kiểm tra file quan trọng
ls -lh index.html favicon.ico .htaccess manifest.json
ls -la static/

# Backend
cd /www/wwwroot/api-eduwallet.mojistudio.vn
ls -la
ls -lh package.json .env app.js
```

### 2. Kiểm tra quyền file

```bash
# Xem quyền file
stat -c "%a %n" /www/wwwroot/eduwallet.mojistudio.vn/index.html
stat -c "%a %n" /www/wwwroot/eduwallet.mojistudio.vn/.htaccess

# Sửa quyền nếu cần (755 cho folder, 644 cho file)
chmod -R 755 /www/wwwroot/eduwallet.mojistudio.vn
chmod 644 /www/wwwroot/eduwallet.mojistudio.vn/index.html
chmod 644 /www/wwwroot/eduwallet.mojistudio.vn/.htaccess
```

### 3. Kiểm tra Backend đang chạy

```bash
# Xem process Node.js
ps aux | grep node

# Xem port 3001
netstat -tulpn | grep :3001
# Hoặc
lsof -i :3001

# Test backend locally
curl http://localhost:3001/health
curl http://localhost:3001/api/auth/check
```

### 4. Kiểm tra PM2 (Process Manager)

```bash
# Status tất cả app
pm2 status

# Logs
pm2 logs eduwallet-backend
pm2 logs --lines 50

# Restart backend
pm2 restart eduwallet-backend

# Stop/Start
pm2 stop eduwallet-backend
pm2 start eduwallet-backend

# Xem thông tin chi tiết
pm2 describe eduwallet-backend
```

### 5. Kiểm tra MongoDB

```bash
# Status
systemctl status mongod

# Connect vào MongoDB
mongo
# hoặc
mongosh

# Trong MongoDB shell:
show dbs
use eduwallet
show collections
db.users.countDocuments()
db.partners.find().pretty()
exit
```

### 6. Kiểm tra Nginx/Apache

```bash
# Nếu dùng Nginx:
nginx -t                    # Test cấu hình
systemctl status nginx
systemctl restart nginx
tail -f /www/wwwlogs/eduwallet.mojistudio.vn.log

# Nếu dùng Apache:
apache2ctl configtest
systemctl status apache2
systemctl restart apache2
tail -f /www/wwwlogs/eduwallet.mojistudio.vn.log
```

### 7. Xem logs

```bash
# Frontend logs (access)
tail -f /www/wwwlogs/eduwallet.mojistudio.vn.log

# Frontend logs (error)
tail -f /www/wwwlogs/eduwallet.mojistudio.vn.error.log

# Backend logs
tail -f /www/wwwroot/api-eduwallet.mojistudio.vn/logs/app.log
tail -f /www/wwwroot/api-eduwallet.mojistudio.vn/logs/error.log

# PM2 logs
pm2 logs eduwallet-backend --lines 100

# System logs
journalctl -u nginx -f
journalctl -u apache2 -f
```

### 8. Test endpoints

```bash
# Test frontend
curl -I http://eduwallet.mojistudio.vn/
curl -I https://eduwallet.mojistudio.vn/

# Test backend
curl http://localhost:3001/health
curl http://api-eduwallet.mojistudio.vn/health
curl https://api-eduwallet.mojistudio.vn/api/auth/check

# Test với headers
curl -H "Content-Type: application/json" \
  https://api-eduwallet.mojistudio.vn/api/auth/check
```

### 9. Kiểm tra SSL

```bash
# Xem SSL certs
ls -la /www/server/panel/vhost/cert/eduwallet.mojistudio.vn/
ls -la /www/server/panel/vhost/cert/api-eduwallet.mojistudio.vn/

# Kiểm tra ngày hết hạn
openssl x509 -enddate -noout \
  -in /www/server/panel/vhost/cert/eduwallet.mojistudio.vn/fullchain.pem

# Test SSL connection
openssl s_client -connect eduwallet.mojistudio.vn:443
openssl s_client -connect api-eduwallet.mojistudio.vn:443
```

### 10. Kiểm tra firewall & ports

```bash
# UFW firewall
ufw status

# Open ports
netstat -tulpn | grep LISTEN

# aaPanel firewall
cat /www/server/panel/data/port.pl
```

---

## 🔧 FIX CÁC LỖI THƯỜNG GẶP

### Lỗi 1: Backend không chạy (Port 3001)

```bash
# Kiểm tra
netstat -tulpn | grep :3001

# Nếu không có, start backend
cd /www/wwwroot/api-eduwallet.mojistudio.vn
pm2 start ecosystem.config.js
# hoặc
pm2 start app.js --name eduwallet-backend

# Kiểm tra logs
pm2 logs eduwallet-backend
```

### Lỗi 2: MongoDB không kết nối được

```bash
# Start MongoDB
systemctl start mongod
systemctl enable mongod

# Kiểm tra
systemctl status mongod
netstat -tulpn | grep :27017

# Test connection
mongo --eval "db.stats()"
```

### Lỗi 3: 500 Internal Server Error

```bash
# Xem logs ngay lập tức
tail -20 /www/wwwlogs/eduwallet.mojistudio.vn.error.log

# Kiểm tra .htaccess
cat /www/wwwroot/eduwallet.mojistudio.vn/.htaccess

# Kiểm tra quyền
ls -la /www/wwwroot/eduwallet.mojistudio.vn/
chmod -R 755 /www/wwwroot/eduwallet.mojistudio.vn
```

### Lỗi 4: CORS errors

```bash
# Kiểm tra backend .htaccess
cat /www/wwwroot/api-eduwallet.mojistudio.vn/.htaccess

# Thêm CORS headers (nếu chưa có)
nano /www/wwwroot/api-eduwallet.mojistudio.vn/.htaccess
```

### Lỗi 5: Favicon 404

```bash
# Kiểm tra file tồn tại
ls -lh /www/wwwroot/eduwallet.mojistudio.vn/favicon.ico

# Nếu không có, tạo placeholder
touch /www/wwwroot/eduwallet.mojistudio.vn/favicon.ico
chmod 644 /www/wwwroot/eduwallet.mojistudio.vn/favicon.ico
```

### Lỗi 6: Environment variables không load

```bash
# Kiểm tra .env
cat /www/wwwroot/api-eduwallet.mojistudio.vn/.env

# Restart backend để reload
pm2 restart eduwallet-backend

# Hoặc reload với --update-env
pm2 restart eduwallet-backend --update-env
```

---

## 📊 MONITORING REAL-TIME

### 1. Monitor tất cả logs cùng lúc

```bash
# Terminal 1: Frontend access log
tail -f /www/wwwlogs/eduwallet.mojistudio.vn.log

# Terminal 2: Frontend error log
tail -f /www/wwwlogs/eduwallet.mojistudio.vn.error.log

# Terminal 3: Backend PM2 logs
pm2 logs eduwallet-backend --lines 50
```

### 2. Monitor system resources

```bash
# CPU, Memory usage
htop
# hoặc
top

# Disk space
df -h

# Network connections
watch -n 1 'netstat -tulpn | grep LISTEN'

# PM2 monitoring
pm2 monit
```

---

## 🚀 DEPLOY/UPDATE CODE

### Update Frontend

```bash
# Backup cũ
cd /www/wwwroot
mv eduwallet.mojistudio.vn eduwallet.mojistudio.vn.backup-$(date +%Y%m%d)

# Upload build folder mới (dùng FTP/SFTP)
# Hoặc copy từ local nếu có
cp -r /path/to/new/build /www/wwwroot/eduwallet.mojistudio.vn

# Set permissions
chmod -R 755 /www/wwwroot/eduwallet.mojistudio.vn
chown -R www:www /www/wwwroot/eduwallet.mojistudio.vn
```

### Update Backend

```bash
# Vào thư mục backend
cd /www/wwwroot/api-eduwallet.mojistudio.vn

# Pull code mới (nếu dùng Git)
git pull origin main

# Install dependencies
npm install --production

# Restart
pm2 restart eduwallet-backend
pm2 logs eduwallet-backend
```

---

## 📝 SCRIPT AUTO-DEBUG

Đã tạo file `terminus-debug-commands.sh` - chạy toàn bộ lệnh debug:

```bash
# Copy script lên server
scp terminus-debug-commands.sh root@your-server:/root/

# SSH vào server
ssh root@your-server

# Chạy script
chmod +x /root/terminus-debug-commands.sh
bash /root/terminus-debug-commands.sh > debug-report.txt

# Xem report
cat debug-report.txt
# hoặc download về local để xem
```

---

## 🆘 EMERGENCY COMMANDS

### Restart tất cả services

```bash
# Restart backend
pm2 restart all

# Restart web server
systemctl restart nginx
# hoặc
systemctl restart apache2

# Restart MongoDB
systemctl restart mongod
```

### Xem trạng thái tất cả

```bash
echo "=== PM2 ===" && pm2 status
echo "=== Nginx ===" && systemctl status nginx --no-pager
echo "=== MongoDB ===" && systemctl status mongod --no-pager
echo "=== Ports ===" && netstat -tulpn | grep LISTEN
```

---

## 📞 LẤY THÔNG TIN HỆ THỐNG

```bash
# Server info
uname -a
cat /etc/os-release

# Versions
node --version
npm --version
pm2 --version
nginx -v
mongo --version

# Resources
free -h
df -h
uptime
```

---

## ✅ CHECKLIST DEBUG

- [ ] Frontend files tồn tại: index.html, favicon.ico, .htaccess
- [ ] Backend đang chạy trên port 3001
- [ ] MongoDB đang chạy trên port 27017
- [ ] Nginx/Apache status: active
- [ ] SSL certificates hợp lệ
- [ ] CORS headers được cấu hình đúng
- [ ] PM2 logs không có error
- [ ] Test endpoints trả về 200 OK
- [ ] .env file có đầy đủ biến môi trường

---

**💡 Tip:** Mở nhiều tab Terminus cùng lúc để monitor logs real-time!
