@echo off
echo ========================================
echo Starting All 3 Demo Websites
echo ========================================
echo.

echo Starting Website 1 - Video Learning (Port 3002)...
start "Website 1 - Video" cmd /k "cd website-1-video && npm start"
timeout /t 2 /nobreak >nul

echo Starting Website 2 - Quiz Learning (Port 3003)...
start "Website 2 - Quiz" cmd /k "cd website-2-quiz && npm start"
timeout /t 2 /nobreak >nul

echo Starting Website 3 - Hybrid Learning (Port 3004)...
start "Website 3 - Hybrid" cmd /k "cd website-3-hybrid && npm start"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo All demo websites are starting!
echo ========================================
echo.
echo Website 1 (Video):  http://localhost:3002
echo Website 2 (Quiz):   http://localhost:3003
echo Website 3 (Hybrid): http://localhost:3004
echo.
echo Backend API:        http://localhost:3001
echo.
echo Press any key to exit this window...
pause >nul
