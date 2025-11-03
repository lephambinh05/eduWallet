@echo off
echo ========================================
echo   RESTARTING BACKEND SERVER
echo ========================================
echo.
echo Killing process on port 3001...
npx kill-port 3001

echo.
echo Starting backend server...
npm start
