@echo off
echo ========================================
echo   KHOI DONG WEB DOC TRUYEN
echo ========================================
echo.

echo [1/3] Kiem tra port 5020...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5020 " ^| findstr "LISTENING"') do (
    echo     Dang kill process %%a tren port 5020...
    taskkill /PID %%a /F >nul 2>&1
)

echo [2/3] Kiem tra port 5174...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5174 " ^| findstr "LISTENING"') do (
    echo     Dang kill process %%a tren port 5174...
    taskkill /PID %%a /F >nul 2>&1
)

echo [3/3] Khoi dong servers...
echo.
echo Backend : http://localhost:5020
echo Frontend: http://localhost:5174
echo.

start "Backend - Web Doc Truyen" cmd /k "cd /d "%~dp0backend" && node server.js"
timeout /t 2 /nobreak > nul
start "Frontend - Web Doc Truyen" cmd /k "cd /d "%~dp0frontend" && npm run dev"
timeout /t 3 /nobreak > nul
start http://localhost:5174
