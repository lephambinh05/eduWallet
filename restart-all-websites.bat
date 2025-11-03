@echo off
echo ========================================
echo   RESTARTING ALL 3 PARTNER WEBSITES
echo ========================================

echo.
echo [1/3] Killing processes on ports 3002, 3003, 3004...
npx kill-port 3002 3003 3004

echo.
echo [2/3] Starting Website 1 - Video (port 3002)...
cd /d c:\Workspace\Hackathon_Pione\eduWallet\website-1-video
start "Web1-Video" cmd /k "npm start"

echo.
echo [3/3] Starting Website 2 - Quiz (port 3003)...
cd /d c:\Workspace\Hackathon_Pione\eduWallet\website-2-quiz
start "Web2-Quiz" cmd /k "npm start"

echo.
echo [4/4] Starting Website 3 - Hybrid (port 3004)...
cd /d c:\Workspace\Hackathon_Pione\eduWallet\website-3-hybrid
start "Web3-Hybrid" cmd /k "npm start"

echo.
echo ========================================
echo ✅ ALL 3 WEBSITES RESTARTING...
echo ========================================
echo.
echo 🌐 Web1 (Video):  http://localhost:3002
echo 🌐 Web2 (Quiz):   http://localhost:3003
echo 🌐 Web3 (Hybrid): http://localhost:3004
echo.
pause
