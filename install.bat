@echo off
echo ========================================
echo   CAI DAT WEB DOC TRUYEN
echo ========================================
echo.

echo [1/3] Cai dat backend...
cd /d "%~dp0backend"
call npm install
if errorlevel 1 (echo LOI khi cai dat backend! && pause && exit /b 1)

echo.
echo [2/3] Cai dat frontend...
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 (echo LOI khi cai dat frontend! && pause && exit /b 1)

echo.
echo [3/3] Khoi tao database va seed du lieu...
cd /d "%~dp0backend"
node db/seed.js
if errorlevel 1 (echo LOI khi seed du lieu! && pause && exit /b 1)

echo.
echo ========================================
echo   CAI DAT HOAN THANH!
echo   Chay start.bat de khoi dong
echo ========================================
pause
