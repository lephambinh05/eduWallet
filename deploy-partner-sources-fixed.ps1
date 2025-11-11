# ========================================# ========================================

# Deploy Partner Sources API to VPS# Deploy Partner Sources API to VPS

# PowerShell Script for Windows# PowerShell Script for Windows

# ========================================# ========================================



Write-Host "🚀 Starting deployment..." -ForegroundColor CyanWrite-Host " Starting deployment..." -ForegroundColor Cyan



# VPS Configuration# VPS Configuration - UPDATE THESE!

$VPS_HOST = "root@160.30.112.42"$VPS_HOST = "root@160.30.112.42"

$VPS_PATH = "/www/wwwroot/api-eduwallet.mojistudio.vn"$VPS_PATH = "/www/wwwroot/api-eduwallet.mojistudio.vn"

$LOCAL_BACKEND = ".\backend"$LOCAL_BACKEND = ".\backend"



# Step 1: Backup# Step 1: Backup

Write-Host "`n📦 Step 1: Creating backup on VPS..." -ForegroundColor YellowWrite-Host "

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss" Step 1: Creating backup on VPS..." -ForegroundColor Yellow

$backupCmd = "cd $VPS_PATH; cp -r src src.backup.$timestamp"$backupCmd = "cd $VPS_PATH; cp -r src src.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"

ssh $VPS_HOST $backupCmdssh $VPS_HOST $backupCmd



if ($LASTEXITCODE -eq 0) {
    if ($LASTEXITCODE -eq 0) {

        Write-Host "✅ Backup created" -ForegroundColor Green    Write-Host " Backup created" -ForegroundColor Green

    }
    else {}

    Write-Host "❌ Backup failed!" -ForegroundColor Redelse {

        exit 1    Write-Host " Backup failed!" -ForegroundColor Red

    }    exit 1

}

# Step 2: Upload PartnerSource model

Write-Host "`n📤 Step 2: Uploading PartnerSource model..." -ForegroundColor Yellow# Step 2: Upload PartnerSource model

scp "$LOCAL_BACKEND\src\models\PartnerSource.js" "${VPS_HOST}:${VPS_PATH}/src/models/"Write-Host "`n📤 Step 2: Uploading PartnerSource model..." -ForegroundColor Yellow

scp "${LOCAL_BACKEND}\src\models\PartnerSource.js" "${VPS_HOST}:${VPS_PATH}/src/models/"

if ($LASTEXITCODE -eq 0) {

    Write-Host "✅ PartnerSource.js uploaded" -ForegroundColor Greenif ($LASTEXITCODE -eq 0) {

    } else { Write-Host " PartnerSource.js uploaded" -ForegroundColor Green

        Write-Host "❌ Upload failed!" -ForegroundColor Red }

    exit 1else {

    }    Write-Host " Upload failed!" -ForegroundColor Red

    exit 1

    # Step 3: Upload updated PartnerCourse model}

    Write-Host "`n📤 Step 3: Uploading updated PartnerCourse model..." -ForegroundColor Yellow

    scp "$LOCAL_BACKEND\src\models\PartnerCourse.js" "${VPS_HOST}:${VPS_PATH}/src/models/"# Step 3: Upload updated PartnerCourse model

    Write-Host "

if ($LASTEXITCODE -eq 0) { Step 3: Uploading updated PartnerCourse model..." -ForegroundColor Yellow

    Write-Host "✅ PartnerCourse.js uploaded" -ForegroundColor Greenscp "$LOCAL_BACKEND\src\models\PartnerCourse.js" "${$VPS_HOST}:${$VPS_PATH}/src/models/"

}
else {

    Write-Host "❌ Upload failed!" -ForegroundColor Redif ($LASTEXITCODE -eq 0) {

        exit 1    Write-Host " PartnerCourse.js uploaded" -ForegroundColor Green

    }
}

else {

    # Step 4: Upload updated partner routes    Write-Host " Upload failed!" -ForegroundColor Red

    Write-Host "`n📤 Step 4: Uploading updated partner routes..." -ForegroundColor Yellow    exit 1

    scp "$LOCAL_BACKEND\src\routes\partner.js" "${VPS_HOST}:${VPS_PATH}/src/routes/" }



if ($LASTEXITCODE -eq 0) {
    # Step 4: Upload updated partner routes

    Write-Host "✅ partner.js uploaded" -ForegroundColor GreenWrite-Host "

} else { Step 4: Uploading updated partner routes..." -ForegroundColor Yellow

    Write-Host "❌ Upload failed!" -ForegroundColor Redscp "$LOCAL_BACKEND\src\routes\partner.js" "${$VPS_HOST}:${$VPS_PATH}/src/routes/"

    exit 1

}if ($LASTEXITCODE -eq 0) {

    Write-Host " partner.js uploaded" -ForegroundColor Green

    # Step 5: Restart PM2 process}

    Write-Host "`n🔄 Step 5: Restarting PM2 process..." -ForegroundColor Yellowelse {

        ssh $VPS_HOST "cd $VPS_PATH; pm2 restart apieduwallet"    Write-Host " Upload failed!" -ForegroundColor Red

        exit 1

        if ($LASTEXITCODE -eq 0) {}

        Write-Host "✅ PM2 restarted" -ForegroundColor Green

    } else { # Step 5: Restart PM2 process

        Write-Host "❌ PM2 restart failed!" -ForegroundColor RedWrite-Host "

    exit 1 Step 5: Restarting PM2 process..." -ForegroundColor Yellow

    }ssh $VPS_HOST "cd $VPS_PATH; pm2 restart apieduwallet"



    # Step 6: Check PM2 statusif ($LASTEXITCODE -eq 0) {

    Write-Host "`n📋 Step 6: Checking PM2 status..." -ForegroundColor Yellow    Write-Host " PM2 restarted" -ForegroundColor Green

    ssh $VPS_HOST "pm2 list"
}

else {

    # Step 7: Check logs    Write-Host " PM2 restart failed!" -ForegroundColor Red

    Write-Host "`n📝 Step 7: Checking logs..." -ForegroundColor Yellow    exit 1

    ssh $VPS_HOST "pm2 logs apieduwallet --lines 20 --nostream"
}



Write-Host "`n✅ Deployment completed!" -ForegroundColor Green# Step 6: Check PM2 status

Write-Host ""Write-Host "

Write-Host "🧪 Test API:" -ForegroundColor Yellow Step 6: Checking PM2 status..." -ForegroundColor Yellow

Write-Host "curl -H 'Authorization: Bearer <TOKEN>' https://api-eduwallet.mojistudio.vn/api/partner/sources"ssh $VPS_HOST "pm2 list"

Write-Host ""

Write-Host "📊 Monitor logs:" -ForegroundColor Yellowif ($LASTEXITCODE -eq 0) {

    Write-Host "ssh $VPS_HOST 'pm2 logs apieduwallet'"    Write-Host " PM2 status checked" -ForegroundColor Green

    Write-Host "" }

Write-Host "🌐 Frontend URL:" -ForegroundColor Yellowelse {

    Write-Host "https://eduwallet.mojistudio.vn/partner/courses"    Write-Host " PM2 status check failed!" -ForegroundColor Red
}

# Step 7: Check logs
Write-Host "
 Step 7: Checking logs..." -ForegroundColor Yellow
ssh $VPS_HOST "pm2 logs apieduwallet --lines 20 --nostream"

Write-Host "
 Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host " Test API:" -ForegroundColor Yellow
Write-Host "curl -H 'Authorization: Bearer <TOKEN>' https://api-eduwallet.mojistudio.vn/api/partner/sources"
Write-Host ""
Write-Host " Monitor logs:" -ForegroundColor Yellow
Write-Host "ssh $VPS_HOST 'pm2 logs apieduwallet'"
Write-Host ""
Write-Host " Frontend URL:" -ForegroundColor Yellow
Write-Host "https://eduwallet.mojistudio.vn/partner/courses"
