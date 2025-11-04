# ========================================================
# LỆNH BUILD NHANH CHO VPS
# Copy và paste từng khối lệnh vào terminal
# ========================================================

# ==========================================
# PHƯƠNG ÁN 1: CHẠY SCRIPT TỰ ĐỘNG (KHUYÊN DÙNG)
# ==========================================

# 1. Upload file VPS_BUILD_COMMANDS.sh lên server
# 2. Chạy script:

cd /www/wwwroot/eduwallet.mojistudio.vn
chmod +x VPS_BUILD_COMMANDS.sh
./VPS_BUILD_COMMANDS.sh


# ==========================================
# PHƯƠNG ÁN 2: CHẠY TỪNG LỆNH THỦ CÔNG
# ==========================================

# --- FRONTEND ---
cd /www/wwwroot/eduwallet.mojistudio.vn
git pull origin main
npm install
npm run build

# Kiểm tra .htaccess
ls -la build/.htaccess
cat build/.htaccess | grep "Content-Security-Policy"

# --- BACKEND ---
cd /www/wwwroot/api-eduwallet.mojistudio.vn/backend
git pull origin main
npm install
pm2 restart eduwallet-backend

# --- RESTART APACHE ---
systemctl restart apache2

# --- KIỂM TRA ---
curl http://localhost:3001/health
curl https://api-eduwallet.mojistudio.vn/health
pm2 logs eduwallet-backend --lines 50


# ==========================================
# PHƯƠNG ÁN 3: LỆNH NGẮN GỌN (Quick Deploy)
# ==========================================

# Frontend + Backend + Restart tất cả
cd /www/wwwroot/eduwallet.mojistudio.vn && git pull && npm run build && \
cd /www/wwwroot/api-eduwallet.mojistudio.vn/backend && git pull && npm install && \
pm2 restart eduwallet-backend && \
systemctl restart apache2 && \
echo "✅ Deploy hoàn tất!"


# ==========================================
# KIỂM TRA LỖI
# ==========================================

# Backend logs
pm2 logs eduwallet-backend

# Apache logs
tail -f /www/wwwlogs/eduwallet.mojistudio.vn.error.log
tail -f /www/wwwlogs/api-eduwallet.mojistudio.vn.error.log

# Kiểm tra port
netstat -tulpn | grep 3001

# Test API
curl -v http://localhost:3001/health
curl -v https://api-eduwallet.mojistudio.vn/health


# ==========================================
# XÓA CACHE (NẾU CẦN)
# ==========================================

# Xóa browser cache: Ctrl+Shift+R trên browser
# Xóa Apache cache
rm -rf /var/cache/apache2/*
systemctl restart apache2

# Restart PM2 process
pm2 restart all
pm2 flush


# ==========================================
# CẤU HÌNH APACHE (NẾU CHƯA CÓ)
# ==========================================

# Enable modules
a2enmod proxy proxy_http proxy_wstunnel rewrite headers ssl

# Restart
systemctl restart apache2

# Kiểm tra syntax
apachectl configtest


# ==========================================
# PM2 SETUP (LẦN ĐẦU)
# ==========================================

# Cài PM2 globally
npm install -g pm2

# Start backend
cd /www/wwwroot/api-eduwallet.mojistudio.vn/backend
pm2 start app-with-api.js --name eduwallet-backend

# Lưu config
pm2 save

# Auto-start on reboot
pm2 startup
# Copy paste lệnh output ra để chạy


# ==========================================
# GIT SETUP (LẦN ĐẦU)
# ==========================================

# Clone repository (lần đầu)
cd /www/wwwroot
git clone https://github.com/lephambinh05/eduWallet.git eduwallet.mojistudio.vn

# Hoặc init trong folder có sẵn
cd /www/wwwroot/eduwallet.mojistudio.vn
git init
git remote add origin https://github.com/lephambinh05/eduWallet.git
git pull origin main


# ==========================================
# ĐỊA CHỈ QUAN TRỌNG
# ==========================================

# Frontend source:  /www/wwwroot/eduwallet.mojistudio.vn
# Frontend build:   /www/wwwroot/eduwallet.mojistudio.vn/build
# Backend source:   /www/wwwroot/api-eduwallet.mojistudio.vn/backend
# Backend .env:     /www/wwwroot/api-eduwallet.mojistudio.vn/backend/.env
# Apache config:    /www/server/panel/vhost/apache/
# Apache logs:      /www/wwwlogs/
# PM2 logs:         ~/.pm2/logs/


# ==========================================
# CHECKLIST SAU KHI DEPLOY
# ==========================================

# ✅ Git pull thành công
# ✅ npm install không lỗi
# ✅ npm run build tạo folder build/
# ✅ build/.htaccess tồn tại và có CSP header
# ✅ Backend PM2 status: online
# ✅ Port 3001 đang listening
# ✅ curl localhost:3001/health trả về 200
# ✅ curl https://api-eduwallet.mojistudio.vn/health trả về 200
# ✅ Apache restart thành công
# ✅ Browser không có CSP errors
# ✅ API calls từ frontend → backend thành công
