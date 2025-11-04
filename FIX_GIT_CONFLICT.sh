# ========================================================
# FIX GIT CONFLICT - LỆNH GIẢI QUYẾT
# ========================================================

# BƯỚC 1: Backup file .env hiện tại
cp .env .env.server.backup
cp .env.backup .env.backup.old 2>/dev/null || echo "Không có .env.backup"

# BƯỚC 2: Stash changes
git stash

# BƯỚC 3: Pull code mới
git pull origin main

# BƯỚC 4: Restore .env production của server
cp .env.server.backup .env

# BƯỚC 5: Kiểm tra
cat .env | grep -E "REACT_APP_BACKEND_URL|REACT_APP_FRONTEND_URL"

# BƯỚC 6: Build
npm install
npm run build

# BƯỚC 7: Deploy backend
cd /www/wwwroot/api-eduwallet.mojistudio.vn/backend
git stash 2>/dev/null || echo "No backend changes to stash"
git pull origin main
npm install
pm2 restart eduwallet-backend

# BƯỚC 8: Restart Apache
systemctl restart apache2

# BƯỚC 9: Kiểm tra
curl http://localhost:3001/health
curl https://api-eduwallet.mojistudio.vn/health
pm2 logs eduwallet-backend --lines 20

echo "✅ Deploy hoàn tất!"
