@echo off
echo ========================================
echo   Restarting Frontend with New .env
echo ========================================
echo.
echo Killing any existing React processes...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *react-scripts*" 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Starting frontend on port 3000...
echo API will connect to: http://localhost:3003/api
echo.
cd /d "%~dp0"
npm start
