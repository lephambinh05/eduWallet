@echo off
echo ====================================
echo    EduWallet Email System Test
echo ====================================
echo.

echo Checking email configuration...
if not exist "backend\.env" (
    echo ERROR: .env file not found!
    echo Please make sure backend\.env exists with email configuration.
    pause
    exit /b 1
)

echo Running email system test...
cd backend
node scripts/test-email-system.js

echo.
echo ====================================
echo Test completed! Check your email inbox (and spam folder).
echo.
echo To configure email properly:
echo 1. Update EMAIL_USER and EMAIL_PASS in backend\.env
echo 2. For Gmail: Enable 2FA and create App Password
echo 3. App Password URL: https://myaccount.google.com/apppasswords
echo ====================================
pause