@echo off
echo ========================================
echo Installing Dependencies for All Websites
echo ========================================
echo.

echo Installing for Website 1 - Video Learning...
cd website-1-video
if exist package.json (
    call npm install
    echo ✅ Website 1 dependencies installed
) else (
    echo ❌ package.json not found in website-1-video
)
cd ..
echo.

echo Installing for Website 2 - Quiz Learning...
cd website-2-quiz
if exist package.json (
    call npm install
    echo ✅ Website 2 dependencies installed
) else (
    echo ❌ package.json not found in website-2-quiz
)
cd ..
echo.

echo Installing for Website 3 - Hybrid Learning...
cd website-3-hybrid
if exist package.json (
    call npm install
    echo ✅ Website 3 dependencies installed
) else (
    echo ❌ package.json not found in website-3-hybrid
)
cd ..
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Run 'start-all-websites.bat' to start all websites
echo.
pause
