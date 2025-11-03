@echo off
echo ========================================
echo Starting All 3 Partner Demo Websites
echo ========================================

echo.
echo [1/3] Starting Website 1 (Video) on port 3002...
start "Website 1 - Video" cmd /k "cd /d %~dp0website-1-video && node server.js"
timeout /t 2 /nobreak > nul

echo [2/3] Starting Website 2 (Quiz) on port 3003...
start "Website 2 - Quiz" cmd /k "cd /d %~dp0website-2-quiz && node server.js"
timeout /t 2 /nobreak > nul

echo [3/3] Starting Website 3 (Hybrid) on port 3004...
start "Website 3 - Hybrid" cmd /k "cd /d %~dp0website-3-hybrid && node server.js"
timeout /t 2 /nobreak > nul

echo.
echo ========================================
echo All websites started!
echo ========================================
echo.
echo Website 1 (Video):  http://localhost:3002
echo Website 2 (Quiz):   http://localhost:3003
echo Website 3 (Hybrid): http://localhost:3004
echo.
echo Press any key to open all websites in browser...
pause > nul

start http://localhost:3002?student=68ecef57f2d3ddc8fd99e5be
start http://localhost:3003?student=68ecef57f2d3ddc8fd99e5be
start http://localhost:3004?student=68ecef57f2d3ddc8fd99e5be

echo.
echo All websites opened in browser!
echo Keep this window open to see the terminals.
pause
