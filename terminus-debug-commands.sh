#!/bin/bash
# ========================================================
# Terminus Debug Commands for EduWallet on aaPanel
# SSH vào server và chạy các lệnh này để kiểm tra
# ========================================================

echo "=========================================="
echo "🔍 EDUWALLET DEBUG COMMANDS"
echo "=========================================="
echo ""

# ==========================================
# 1. KIỂM TRA CẤU TRÚC THỦ MỤC
# ==========================================
echo "📁 1. Checking Directory Structure..."
echo "=========================================="

# Frontend
echo "Frontend (eduwallet.mojistudio.vn):"
ls -la /www/wwwroot/eduwallet.mojistudio.vn/

echo ""
echo "Build files:"
ls -lh /www/wwwroot/eduwallet.mojistudio.vn/*.html
ls -lh /www/wwwroot/eduwallet.mojistudio.vn/favicon.ico
ls -lh /www/wwwroot/eduwallet.mojistudio.vn/.htaccess

echo ""
echo "Static folder:"
ls -la /www/wwwroot/eduwallet.mojistudio.vn/static/

# Backend
echo ""
echo "Backend (api-eduwallet.mojistudio.vn):"
ls -la /www/wwwroot/api-eduwallet.mojistudio.vn/

echo ""
echo "Backend files:"
ls -lh /www/wwwroot/api-eduwallet.mojistudio.vn/package.json
ls -lh /www/wwwroot/api-eduwallet.mojistudio.vn/.env
ls -lh /www/wwwroot/api-eduwallet.mojistudio.vn/.htaccess

# ==========================================
# 2. KIỂM TRA QUYỀN FILE
# ==========================================
echo ""
echo "=========================================="
echo "🔒 2. Checking File Permissions..."
echo "=========================================="

# Frontend permissions
echo "Frontend permissions:"
stat -c "%a %n" /www/wwwroot/eduwallet.mojistudio.vn/index.html
stat -c "%a %n" /www/wwwroot/eduwallet.mojistudio.vn/favicon.ico
stat -c "%a %n" /www/wwwroot/eduwallet.mojistudio.vn/.htaccess

# Backend permissions
echo ""
echo "Backend permissions:"
stat -c "%a %n" /www/wwwroot/api-eduwallet.mojistudio.vn/.env
stat -c "%a %n" /www/wwwroot/api-eduwallet.mojistudio.vn/package.json

# Check ownership
echo ""
echo "Ownership:"
ls -l /www/wwwroot/eduwallet.mojistudio.vn/ | head -5
ls -l /www/wwwroot/api-eduwallet.mojistudio.vn/ | head -5

# ==========================================
# 3. KIỂM TRA NODE.JS & PM2
# ==========================================
echo ""
echo "=========================================="
echo "🟢 3. Checking Node.js & PM2..."
echo "=========================================="

echo "Node version:"
node --version

echo ""
echo "NPM version:"
npm --version

echo ""
echo "PM2 status:"
pm2 status

echo ""
echo "PM2 logs (last 20 lines):"
pm2 logs --lines 20

# ==========================================
# 4. KIỂM TRA BACKEND PROCESS
# ==========================================
echo ""
echo "=========================================="
echo "🔄 4. Checking Backend Process..."
echo "=========================================="

echo "Backend running on port 3001:"
netstat -tulpn | grep :3001

echo ""
echo "Check if backend is responding:"
curl -I http://localhost:3001/health
curl http://localhost:3001/health

# ==========================================
# 5. KIỂM TRA MONGODB
# ==========================================
echo ""
echo "=========================================="
echo "🗄️ 5. Checking MongoDB..."
echo "=========================================="

echo "MongoDB status:"
systemctl status mongod | head -20

echo ""
echo "MongoDB is running:"
netstat -tulpn | grep :27017

# ==========================================
# 6. KIỂM TRA NGINX/APACHE
# ==========================================
echo ""
echo "=========================================="
echo "🌐 6. Checking Web Server..."
echo "=========================================="

# Check if using Nginx or Apache
if command -v nginx &> /dev/null; then
    echo "Using NGINX:"
    nginx -v
    nginx -t
    systemctl status nginx | head -10

    echo ""
    echo "Nginx sites enabled:"
    ls -la /www/server/panel/vhost/nginx/

elif command -v apache2 &> /dev/null; then
    echo "Using Apache:"
    apache2 -v
    apache2ctl configtest
    systemctl status apache2 | head -10

    echo ""
    echo "Apache sites enabled:"
    ls -la /etc/apache2/sites-enabled/
fi

# ==========================================
# 7. KIỂM TRA SSL CERTIFICATES
# ==========================================
echo ""
echo "=========================================="
echo "🔐 7. Checking SSL Certificates..."
echo "=========================================="

echo "SSL for eduwallet.mojistudio.vn:"
ls -la /www/server/panel/vhost/cert/eduwallet.mojistudio.vn/

echo ""
echo "SSL for api-eduwallet.mojistudio.vn:"
ls -la /www/server/panel/vhost/cert/api-eduwallet.mojistudio.vn/

# Check SSL expiry
echo ""
echo "SSL expiry dates:"
openssl x509 -enddate -noout -in /www/server/panel/vhost/cert/eduwallet.mojistudio.vn/fullchain.pem 2>/dev/null || echo "Frontend SSL not found"
openssl x509 -enddate -noout -in /www/server/panel/vhost/cert/api-eduwallet.mojistudio.vn/fullchain.pem 2>/dev/null || echo "Backend SSL not found"

# ==========================================
# 8. KIỂM TRA LOGS
# ==========================================
echo ""
echo "=========================================="
echo "📋 8. Checking Logs..."
echo "=========================================="

echo "Frontend access logs (last 10):"
tail -10 /www/wwwlogs/eduwallet.mojistudio.vn.log 2>/dev/null || echo "Frontend log not found"

echo ""
echo "Frontend error logs (last 10):"
tail -10 /www/wwwlogs/eduwallet.mojistudio.vn.error.log 2>/dev/null || echo "Frontend error log not found"

echo ""
echo "Backend logs (last 10):"
tail -10 /www/wwwroot/api-eduwallet.mojistudio.vn/logs/app.log 2>/dev/null || echo "Backend log not found"

# ==========================================
# 9. KIỂM TRA NETWORK & FIREWALL
# ==========================================
echo ""
echo "=========================================="
echo "🔥 9. Checking Network & Firewall..."
echo "=========================================="

echo "Open ports:"
netstat -tulpn | grep LISTEN

echo ""
echo "Firewall status (UFW):"
ufw status 2>/dev/null || echo "UFW not installed"

echo ""
echo "aaPanel firewall:"
cat /www/server/panel/data/port.pl 2>/dev/null | head -20 || echo "aaPanel port config not found"

# ==========================================
# 10. TEST ENDPOINTS
# ==========================================
echo ""
echo "=========================================="
echo "🧪 10. Testing Endpoints..."
echo "=========================================="

echo "Test Frontend (HTTP):"
curl -I http://eduwallet.mojistudio.vn/

echo ""
echo "Test Frontend (HTTPS):"
curl -I https://eduwallet.mojistudio.vn/

echo ""
echo "Test Backend (HTTP):"
curl -I http://api-eduwallet.mojistudio.vn/health

echo ""
echo "Test Backend (HTTPS):"
curl -I https://api-eduwallet.mojistudio.vn/health

echo ""
echo "Test Backend API:"
curl https://api-eduwallet.mojistudio.vn/api/auth/check

# ==========================================
# 11. CHECK ENVIRONMENT VARIABLES
# ==========================================
echo ""
echo "=========================================="
echo "🔧 11. Checking Environment Variables..."
echo "=========================================="

echo "Backend .env file (first 20 lines, hide sensitive data):"
head -20 /www/wwwroot/api-eduwallet.mojistudio.vn/.env | sed 's/JWT_SECRET=.*/JWT_SECRET=***HIDDEN***/' | sed 's/MONGODB_URI=.*/MONGODB_URI=***HIDDEN***/'

# ==========================================
# 12. DISK SPACE & MEMORY
# ==========================================
echo ""
echo "=========================================="
echo "💾 12. System Resources..."
echo "=========================================="

echo "Disk space:"
df -h /www

echo ""
echo "Memory usage:"
free -h

echo ""
echo "CPU usage:"
top -bn1 | head -20

echo ""
echo "=========================================="
echo "✅ Debug Complete!"
echo "=========================================="
