@echo off
echo.
echo ========================================
echo    STARTING EDUWALLET WITH MOCK API
echo ========================================
echo.

REM Kill any processes on ports 3000 and 5000
echo [1/3] Checking for running processes...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :3000') DO (
    echo    - Killing process on port 3000 (PID: %%P)
    taskkill /F /PID %%P >nul 2>&1
)
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :5000') DO (
    echo    - Killing process on port 5000 (PID: %%P)
    taskkill /F /PID %%P >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo    ✓ Ports cleared
echo.

REM Start mock backend API
echo [2/3] Starting Mock Admin API Server (port 5000)...
cd backend
start "Mock Admin API" cmd /k "node mock-admin-api.js"
cd ..
timeout /t 3 /nobreak >nul
echo    ✓ Mock API started on http://localhost:5000
echo.

REM Start frontend
echo [3/3] Starting Frontend (port 3000)...
start "EduWallet Frontend" cmd /k "npm start"
timeout /t 5 /nobreak >nul
echo    ✓ Frontend starting on http://localhost:3000
echo.

echo ========================================
echo    BOTH SERVERS STARTED SUCCESSFULLY!
echo ========================================
echo.
echo 📡 Mock API:     http://localhost:5000
echo 🎨 Frontend:     http://localhost:3000
echo.
echo 🔗 Admin Panel:  http://localhost:3000/admin/login
echo 📜 Certificates: http://localhost:3000/admin/certificates
echo 🎓 LearnPasses:  http://localhost:3000/admin/learnpasses
echo.
echo ========================================
echo.
echo Press any key to close this window...
pause >nul
