# 🚀 Deployment Guide - Partner Sources API

## 📋 Prerequisites

Trước khi deploy, đảm bảo:

- ✅ Có quyền SSH vào VPS
- ✅ Backend đang chạy trên VPS (PM2 process: apieduwallet)
- ✅ Files đã được test trên local
- ✅ Git SSH hoặc password đã setup

## 🎯 Quick Deploy (Recommended)

### Option 1: Dùng PowerShell Script (Windows)

```powershell
# 1. Mở PowerShell trong folder eduWallet
cd f:\eduWallet

# 2. Cập nhật VPS_HOST trong script
notepad deploy-partner-sources.ps1
# Sửa dòng: $VPS_HOST = "root@YOUR_VPS_IP"

# 3. Chạy deployment script
.\deploy-partner-sources.ps1
```

### Option 2: Dùng Bash Script (Linux/Mac/Git Bash)

```bash
# 1. Mở terminal trong folder eduWallet
cd /f/eduWallet

# 2. Cập nhật VPS_HOST trong script
nano deploy-partner-sources.sh
# Sửa dòng: VPS_HOST="root@YOUR_VPS_IP"

# 3. Cho phép execute
chmod +x deploy-partner-sources.sh

# 4. Chạy deployment script
./deploy-partner-sources.sh
```

## 📦 Manual Deployment

Nếu script không chạy được, deploy thủ công:

### Step 1: Kết nối VPS

```bash
ssh root@YOUR_VPS_IP
```

### Step 2: Backup code cũ

```bash
cd /www/wwwroot/api-eduwallet.mojistudio.vn
cp -r src src.backup.$(date +%Y%m%d_%H%M%S)
```

### Step 3: Upload files từ local

Mở terminal MỚI (không phải terminal SSH), chạy:

```powershell
# Từ Windows PowerShell
cd f:\eduWallet

# Upload PartnerSource model
scp backend\src\models\PartnerSource.js root@YOUR_VPS_IP:/www/wwwroot/api-eduwallet.mojistudio.vn/src/models/

# Upload updated PartnerCourse model
scp backend\src\models\PartnerCourse.js root@YOUR_VPS_IP:/www/wwwroot/api-eduwallet.mojistudio.vn/src/models/

# Upload updated partner routes
scp backend\src\routes\partner.js root@YOUR_VPS_IP:/www/wwwroot/api-eduwallet.mojistudio.vn/src/routes/
```

### Step 4: Quay lại terminal VPS, restart PM2

```bash
cd /www/wwwroot/api-eduwallet.mojistudio.vn
pm2 restart apieduwallet
pm2 logs apieduwallet --lines 50
```

## ✅ Verification

### 1. Check PM2 status

```bash
pm2 list
# Should show: apieduwallet | online
```

### 2. Check logs for errors

```bash
pm2 logs apieduwallet --lines 100
# Look for: "Server running on port 3005"
# No errors about missing models
```

### 3. Test API endpoint

```bash
# Get JWT token first (login as partner)
# Then test:
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://api-eduwallet.mojistudio.vn/api/partner/sources

# Expected: {"success":true,"data":{"sources":[]}}
# NOT: 404 error
```

### 4. Test from Frontend

1. Mở browser: `https://eduwallet.mojistudio.vn/login`
2. Login với tài khoản Partner
3. Vào: `https://eduwallet.mojistudio.vn/partner/courses`
4. Click nút "Thêm Nguồn API"
5. Điền form và submit
6. Kiểm tra Console → Network tab
   - Không còn lỗi 404
   - API trả về 200/201

## 🔧 Troubleshooting

### Lỗi: "Module not found: PartnerSource"

**Nguyên nhân:** File chưa upload đúng path

**Giải pháp:**

```bash
# Check file exists
ssh root@VPS_IP "ls -la /www/wwwroot/api-eduwallet.mojistudio.vn/src/models/"
# Should see: PartnerSource.js

# If not, re-upload
scp backend\src\models\PartnerSource.js root@VPS_IP:/www/wwwroot/api-eduwallet.mojistudio.vn/src/models/
```

### Lỗi: "Cannot find module 'axios'"

**Nguyên nhân:** Missing dependency

**Giải pháp:**

```bash
ssh root@VPS_IP
cd /www/wwwroot/api-eduwallet.mojistudio.vn
npm install axios
pm2 restart apieduwallet
```

### Lỗi: Still 404 after deploy

**Nguyên nhân:** PM2 chưa restart hoặc cache

**Giải pháp:**

```bash
ssh root@VPS_IP
cd /www/wwwroot/api-eduwallet.mojistudio.vn

# Hard restart
pm2 delete apieduwallet
pm2 start ecosystem.config.js
# OR
pm2 start app-with-api.js --name apieduwallet

# Clear cache
pm2 flush
```

### Lỗi: "Authentication failed"

**Nguyên nhân:** JWT token expired

**Giải pháp:**

1. Logout frontend
2. Login lại
3. Copy token mới
4. Test lại API

## 📊 Monitoring

### Real-time logs

```bash
ssh root@VPS_IP
pm2 logs apieduwallet
# Press Ctrl+C to stop
```

### Check memory/CPU

```bash
pm2 monit
```

### Check errors only

```bash
pm2 logs apieduwallet --err
```

## 🔄 Rollback

Nếu deployment có vấn đề:

```bash
ssh root@VPS_IP
cd /www/wwwroot/api-eduwallet.mojistudio.vn

# List backups
ls -la src.backup.*

# Rollback to backup (thay DATE bằng timestamp backup)
rm -rf src
mv src.backup.DATE src

# Restart
pm2 restart apieduwallet
```

## 📝 Post-Deployment Checklist

- [ ] PM2 process running (green "online")
- [ ] No errors in logs
- [ ] API returns 200 (not 404)
- [ ] Frontend can fetch sources
- [ ] Can create new source
- [ ] Sync button works
- [ ] Courses display after sync

## 🎓 Example: Complete Deployment Flow

```bash
# 1. Local - Test features
cd f:\eduWallet
npm start  # Frontend
cd backend && npm start  # Backend
# Test all features locally ✅

# 2. Build production
npm run build

# 3. Deploy backend
.\deploy-partner-sources.ps1
# Wait for completion...

# 4. Deploy frontend (if needed)
scp -r build/* root@VPS_IP:/var/www/eduwallet/

# 5. Verify
# Open: https://eduwallet.mojistudio.vn/partner/courses
# Test all features ✅

# 6. Monitor
ssh root@VPS_IP "pm2 logs apieduwallet"
```

## 🆘 Emergency Contacts

**If deployment fails:**

1. Check logs: `pm2 logs apieduwallet --lines 200`
2. Rollback: `mv src.backup.LATEST src`
3. Contact: lephambinh05@gmail.com
4. Include: Error messages from logs

## 📚 Related Files

- `deploy-partner-sources.ps1` - PowerShell deployment script
- `deploy-partner-sources.sh` - Bash deployment script
- `PARTNER_MANAGEMENT_README.md` - Feature documentation
- `backend/src/models/PartnerSource.js` - New model
- `backend/src/routes/partner.js` - Updated routes

---

**Last Updated:** January 7, 2025
**Version:** 1.0.0
