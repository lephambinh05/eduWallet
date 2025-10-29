@echo off
echo ========================================
echo   FORCE RESTART Frontend (Clear Cache)
echo ========================================
echo.

echo [1/5] Killing all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] Deleting node_modules/.cache...
if exist node_modules\.cache (
    rd /s /q node_modules\.cache
    echo     Cache deleted!
) else (
    echo     No cache found
)

echo [3/5] Deleting build folder...
if exist build (
    rd /s /q build
    echo     Build deleted!
)

echo [4/5] Clearing environment cache...
set REACT_APP_API_URL=
set REACT_APP_BACKEND_URL=

echo [5/5] Starting fresh React server...
echo.
echo API will connect to: http://localhost:3003/api
echo.
cd /d "%~dp0"
npm start
