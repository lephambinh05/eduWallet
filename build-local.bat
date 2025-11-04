@echo off
chcp 65001 > nul
REM ========================================
REM Auto Build EduWallet + Partner Demos
REM For Windows
REM ========================================

echo.
echo ============================================
echo   BUILD: EduWallet + Partner Demos
echo ============================================
echo.

cd /d "%~dp0"

REM ========================================
echo [94mBUOC 1: Building EduWallet Frontend...[0m
echo --------------------------------------------

cd "%~dp0"
if not exist ".env.production" (
    echo [91mLOI: .env.production khong tim thay![0m
    exit /b 1
)

echo   - Sao chep .env.production thanh .env
copy /Y .env.production .env > nul
echo [92m     XONG[0m

echo   - Cai dat dependencies...
call npm install > nul 2>&1
if errorlevel 1 (
    echo [91m     LOI: npm install that bai[0m
    exit /b 1
)
echo [92m     XONG[0m

echo   - Building React application...
call npm run build > nul 2>&1
if errorlevel 1 (
    echo [91m     LOI: Build that bai[0m
    exit /b 1
)

echo   - Sao chep .htaccess vao build folder...
if exist "public\.htaccess" (
    copy /Y "public\.htaccess" "build\.htaccess" > nul
    echo [92m     XONG - .htaccess da copy[0m
) else (
    echo [93m     CANH BAO - Khong tim thay .htaccess[0m
)

echo [92mTHANH CONG: Frontend da build[0m
echo [92m  Ket qua: build/ (co .htaccess)[0m
echo.

REM ========================================
echo [94mBUOC 2: Chuan bi Backend...[0m
echo --------------------------------------------

cd "%~dp0backend"
if not exist ".env.production" (
    echo [91mLOI: backend/.env.production khong tim thay![0m
    exit /b 1
)

echo   - Sao chep .env.production thanh .env
copy /Y .env.production .env > nul
echo [92m     XONG[0m

echo   - Cai dat production dependencies...
call npm install --production > nul 2>&1
if errorlevel 1 (
    echo [91m     LOI: npm install that bai[0m
    exit /b 1
)

echo   - Kiem tra .htaccess...
if exist ".htaccess" (
    echo [92m     XONG - .htaccess da co san[0m
) else (
    echo [93m     CANH BAO - Backend thieu .htaccess[0m
)

echo [92mTHANH CONG: Backend da san sang[0m
echo.

REM ========================================
echo [94mBUOC 3: Building Partner Demos...[0m
echo --------------------------------------------

cd "%~dp0partner-demos"

REM Build each partner website
for %%S in (website-1-video website-2-quiz website-3-hybrid) do (
    echo.
    echo   - Building %%S...
    cd "%~dp0partner-demos\%%S"

    if exist ".env.production" (
        copy /Y .env.production .env > nul
        echo [92m     XONG - Da sao chep .env.production[0m
    ) else (
        echo [93m     CANH BAO - Dung .env hien tai[0m
    )

    echo      - Cai dat dependencies...
    call npm install --production > nul 2>&1
    if errorlevel 1 (
        echo [91m     LOI: npm install that bai cho %%S[0m
        exit /b 1
    )
    echo [92m     XONG - %%S da san sang[0m
)

echo.
echo [92mTHANH CONG: Tat ca 3 partner websites da build[0m
echo.

REM ========================================
echo [94mBUOC 4: Tao goi Deployment...[0m
echo --------------------------------------------

cd "%~dp0"

echo   - Xoa folder deployment cu...
if exist "deployment" rmdir /s /q deployment

echo   - Tao cau truc deployment...
mkdir deployment

echo   - Sao chep frontend build...
xcopy /E /I /Y /Q build deployment\eduwallet-frontend > nul

echo   - Sao chep backend...
xcopy /E /I /Y /Q backend deployment\eduwallet-backend > nul

echo   - Sao chep partner demos...
xcopy /E /I /Y /Q partner-demos deployment\partner-demos > nul

echo   - Sao chep cac file cau hinh...
if exist "apache-production.conf" copy /Y apache-production.conf deployment\ > nul
if exist "nginx-production.conf" copy /Y nginx-production.conf deployment\ > nul
if exist "ecosystem-production.config.js" copy /Y ecosystem-production.config.js deployment\ > nul

echo   - Kiem tra .htaccess files...
if exist "deployment\eduwallet-frontend\.htaccess" (
    echo [92m     ✓ Frontend .htaccess da co[0m
) else (
    echo [91m     ✗ Frontend thieu .htaccess[0m
)

if exist "deployment\eduwallet-backend\.htaccess" (
    echo [92m     ✓ Backend .htaccess da co[0m
) else (
    echo [91m     ✗ Backend thieu .htaccess[0m
)

echo [92mTHANH CONG: Goi deployment da duoc tao[0m
echo.

REM ========================================
REM Summary
REM ========================================
echo.
echo [92m==========================================[0m
echo [92m   BUILD HOAN THANH![0m
echo [92m==========================================[0m
echo.
echo [94mTONG KET:[0m
echo   - Frontend: Da build XONG
echo   - Backend: Da chuan bi XONG
echo   - Partner demos: Da build XONG (3 websites)
echo   - Goi deployment: Da tao XONG
echo.
echo [94mCAC FILE DA SAN SANG TAI:[0m
echo   deployment\
echo   +-- eduwallet-frontend\
echo   +-- eduwallet-backend\
echo   +-- partner-demos\
echo   ^|   +-- website-1-video\
echo   ^|   +-- website-2-quiz\
echo   ^|   +-- website-3-hybrid\
echo   +-- apache-production.conf (hoac nginx-production.conf)
echo   +-- ecosystem-production.config.js
echo.
echo [93mCAC BUOC TIEP THEO:[0m
echo   1. Upload len server: scp -r deployment\* user@server:/var/www/
echo   2. Lam theo huong dan: QUICK_START.md hoac BUILD_AND_DEPLOY.md
echo   3. Cau hinh Apache/Nginx va start voi PM2
echo.
echo [94mTAI LIEU HUONG DAN:[0m
echo   - README_DEPLOY.md - Bat dau tu day
echo   - QUICK_START.md - Huong dan nhanh 10 phut
echo   - BUILD_AND_DEPLOY.md - Huong dan chi tiet
echo.
echo [92mSan sang de deploy![0m
echo.
pause
