@echo off
echo Starting EduWallet Application...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if package-lock.json exists
if not exist "package-lock.json" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
)

echo Starting development server...
echo The app will open in your browser at http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

npm start

pause 