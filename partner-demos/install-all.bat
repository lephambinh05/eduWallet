@echo off
echo Installing dependencies for all Partner Demo Websites...
echo.

echo [1/3] Installing Website 1 - Video...
cd website-1-video
call npm install
cd ..
echo.

echo [2/3] Installing Website 2 - Quiz...
cd website-2-quiz
call npm install
cd ..
echo.

echo [3/3] Installing Website 3 - Hybrid...
cd website-3-hybrid
call npm install
cd ..
echo.

echo ========================================
echo Installation completed!
echo ========================================
echo.
echo Next steps:
echo 1. Copy .env.example to .env in each website folder
echo 2. Update the .env files with your actual values
echo 3. Run start-all-demos.bat to start all websites
echo.
pause
