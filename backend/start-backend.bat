@echo off
echo ========================================
echo   Starting EduWallet Backend Server
echo ========================================
echo.
echo Backend will run on: http://localhost:3003
echo.
cd /d "%~dp0"
node app-with-api.js
pause
