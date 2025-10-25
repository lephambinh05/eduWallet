@echo off
echo ========================================
echo   EDUWALLET - QUICK TEST START
echo ========================================
echo.

echo [1/3] Checking Backend...
cd backend
if exist "node_modules\" (
    echo Backend dependencies found!
) else (
    echo Installing backend dependencies...
    call npm install
)
echo.

echo [2/3] Starting Backend Server...
start "EduWallet Backend" cmd /k "npm start"
timeout /t 3 /nobreak > nul
echo Backend started on http://localhost:5000
echo.

cd..

echo [3/3] Starting Frontend...
if exist "node_modules\" (
    echo Frontend dependencies found!
) else (
    echo Installing frontend dependencies...
    call npm install
)
echo.

start "EduWallet Frontend" cmd /k "npm start"
echo Frontend starting on http://localhost:3000
echo.

echo ========================================
echo   SERVERS STARTED!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo Admin:    http://localhost:3000/admin/login
echo.
echo Admin Credentials:
echo Email:    admin@example.com
echo Password: Admin123456
echo.
echo ========================================
echo   TEST CHECKLIST
echo ========================================
echo.
echo [ ] Login to admin panel
echo [ ] Test User Detail Modal
echo [ ] Test Create User Modal
echo [ ] Test Activity Logs Page
echo.
echo See TESTING_PRIORITY_1.md for detailed test cases
echo.
pause
