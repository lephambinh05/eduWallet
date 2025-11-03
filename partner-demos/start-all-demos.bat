@echo off
echo ========================================
echo Starting All Partner Demo Websites
echo ========================================
echo.

echo Starting Website 1 - Video Learning Platform...
start "Website 1 - Video" cmd /k "cd website-1-video && npm start"
timeout /t 2 /nobreak > nul

echo Starting Website 2 - Quiz Platform...
start "Website 2 - Quiz" cmd /k "cd website-2-quiz && npm start"
timeout /t 2 /nobreak > nul

echo Starting Website 3 - Hybrid Platform...
start "Website 3 - Hybrid" cmd /k "cd website-3-hybrid && npm start"
timeout /t 2 /nobreak > nul

echo.
echo ========================================
echo All websites started successfully!
echo ========================================
echo.
echo Website 1 (Video):  http://localhost:3001
echo Website 2 (Quiz):   http://localhost:3002
echo Website 3 (Hybrid): http://localhost:3003
echo.
echo Press any key to close this window...
pause > nul
