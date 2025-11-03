@echo off
REM Partner API Test Runner
REM Chay tat ca 21 endpoint tests

echo ========================================
echo Partner API Test Suite
echo ========================================
echo.

REM Check if backend is running
echo Checking if backend is running...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Backend is not running on http://localhost:5000
    echo Please start the backend first:
    echo   cd backend
    echo   npm start
    echo.
    pause
    exit /b 1
)

echo [OK] Backend is running
echo.

REM Set default environment variables
if "%PARTNER_EMAIL%"=="" set PARTNER_EMAIL=partner@test.com
if "%PARTNER_PASSWORD%"=="" set PARTNER_PASSWORD=password123
if "%STUDENT_EMAIL%"=="" set STUDENT_EMAIL=student@test.com
if "%STUDENT_PASSWORD%"=="" set STUDENT_PASSWORD=password123
if "%BACKEND_URL%"=="" set BACKEND_URL=http://localhost:5000

echo Configuration:
echo   Backend URL: %BACKEND_URL%
echo   Partner Email: %PARTNER_EMAIL%
echo   Student Email: %STUDENT_EMAIL%
echo.

REM Check if colors package is installed
echo Checking dependencies...
cd backend
npm list colors >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] Package 'colors' not found. Installing...
    npm install colors --save-dev
)

npm list axios >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] Package 'axios' not found. Installing...
    npm install axios --save-dev
)

echo [OK] Dependencies ready
echo.

REM Run tests
echo ========================================
echo Running Partner API Tests...
echo ========================================
echo.

node scripts/test-partner-api.js

REM Save exit code
set TEST_EXIT_CODE=%errorlevel%

echo.
echo ========================================
if %TEST_EXIT_CODE% equ 0 (
    echo [SUCCESS] All tests passed!
) else (
    echo [FAILED] Some tests failed
)
echo ========================================
echo.

pause
exit /b %TEST_EXIT_CODE%
