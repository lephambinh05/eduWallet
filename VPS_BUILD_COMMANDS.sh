#!/bin/bash

# ========================================================
# EduWallet VPS Deployment Script
# Chạy trên Ubuntu Server với aaPanel
# ========================================================

echo "=================================================="
echo "🚀 EduWallet Deployment Script"
echo "=================================================="

# ==========================================
# BƯỚC 1: CẬP NHẬT CODE TỪ GITHUB
# ==========================================
echo ""
echo "📥 BƯỚC 1: Pull code mới từ GitHub..."

cd /www/wwwroot/eduwallet.mojistudio.vn
git pull origin main

echo "✅ Code đã được cập nhật!"

# ==========================================
# BƯỚC 2: BUILD FRONTEND
# ==========================================
echo ""
echo "🔨 BƯỚC 2: Build Frontend React App..."

# Cài đặt dependencies (nếu cần)
npm install

# Build production
npm run build

echo "✅ Frontend build hoàn thành!"

# ==========================================
# BƯỚC 3: KIỂM TRA .HTACCESS
# ==========================================
echo ""
echo "🔍 BƯỚC 3: Kiểm tra .htaccess trong build folder..."

if [ -f "build/.htaccess" ]; then
    echo "✅ .htaccess tồn tại trong build folder"
    echo "📄 Nội dung CSP headers:"
    grep -A 1 "Content-Security-Policy" build/.htaccess
else
    echo "⚠️  WARNING: Không tìm thấy .htaccess trong build folder!"
    echo "Copying từ public/.htaccess..."
    cp public/.htaccess build/.htaccess
fi

# ==========================================
# BƯỚC 4: DEPLOY BACKEND
# ==========================================
echo ""
echo "🔧 BƯỚC 4: Deploy Backend..."

cd /www/wwwroot/api-eduwallet.mojistudio.vn

# Pull code mới
git pull origin main

# Cài đặt dependencies
cd backend
npm install

# Restart backend với PM2
pm2 restart eduwallet-backend || pm2 start app-with-api.js --name eduwallet-backend

echo "✅ Backend đã được restart!"

# ==========================================
# BƯỚC 5: KIỂM TRA TRẠNG THÁI
# ==========================================
echo ""
echo "📊 BƯỚC 5: Kiểm tra trạng thái services..."

# Kiểm tra PM2
echo "Backend PM2 status:"
pm2 list | grep eduwallet

# Kiểm tra port 3001
echo ""
echo "Port 3001 listening:"
netstat -tulpn | grep :3001 || echo "⚠️  Port 3001 chưa mở!"

# Test backend health
echo ""
echo "Testing backend health endpoint..."
curl -I http://localhost:3001/health 2>/dev/null | head -n 1 || echo "⚠️  Backend health check failed!"

# ==========================================
# BƯỚC 6: RESTART APACHE
# ==========================================
echo ""
echo "🔄 BƯỚC 6: Restart Apache..."

systemctl restart apache2
systemctl status apache2 | grep "active (running)" && echo "✅ Apache đang chạy!" || echo "❌ Apache lỗi!"

# ==========================================
# BƯỚC 7: CLEAR CACHE
# ==========================================
echo ""
echo "🧹 BƯỚC 7: Clear cache..."

# Clear opcache (nếu có PHP)
# service php-fpm restart 2>/dev/null

# Clear Apache cache
rm -rf /var/cache/apache2/* 2>/dev/null

echo "✅ Cache đã được xóa!"

# ==========================================
# BƯỚC 8: KIỂM TRA CUỐI CÙNG
# ==========================================
echo ""
echo "=================================================="
echo "🎯 BƯỚC 8: KIỂM TRA CUỐI CÙNG"
echo "=================================================="

echo ""
echo "1️⃣  Frontend (eduwallet.mojistudio.vn):"
curl -I https://eduwallet.mojistudio.vn 2>/dev/null | head -n 1

echo ""
echo "2️⃣  Backend API (api-eduwallet.mojistudio.vn):"
curl -I https://api-eduwallet.mojistudio.vn/health 2>/dev/null | head -n 1

echo ""
echo "3️⃣  Backend trực tiếp (localhost:3001):"
curl -I http://localhost:3001/health 2>/dev/null | head -n 1

echo ""
echo "4️⃣  PM2 processes:"
pm2 list

echo ""
echo "=================================================="
echo "✅ DEPLOYMENT HOÀN TẤT!"
echo "=================================================="
echo ""
echo "📝 Các bước tiếp theo:"
echo "1. Mở browser và test: https://eduwallet.mojistudio.vn"
echo "2. Nhấn Ctrl+Shift+R để hard refresh và xóa cache"
echo "3. Mở Console (F12) kiểm tra không có CSP errors"
echo "4. Test API calls từ frontend"
echo ""
echo "📊 Xem logs nếu có lỗi:"
echo "   Frontend: tail -f /www/wwwlogs/eduwallet.mojistudio.vn.error.log"
echo "   Backend:  pm2 logs eduwallet-backend"
echo "   Apache:   tail -f /var/log/apache2/error.log"
echo ""
