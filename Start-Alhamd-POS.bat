@echo off
title Alhamd Super Store - POS & Khata System
echo ========================================================
echo        ALHAMD SUPER STORE - POS & KHATA SYSTEM
echo ========================================================
echo.
cd /d "%~dp0"

echo 1. Checking Central MySQL Database & POS Server...
netstat -ano | findstr :5000 >nul
if %errorlevel% neq 0 (
    echo    Starting Background Database Sync Server...
    start "Alhamd Backend Server" /min node server.cjs
    timeout /t 2 /nobreak >nul
) else (
    echo    Server is already active and connected!
)

echo.
echo 2. Opening Alhamd Super Store in Browser...
start http://localhost:5000

echo.
echo ========================================================
echo   System Active! All sales are synced with Database.
echo   You can close this window now or keep it open.
echo ========================================================
timeout /t 3 >nul
exit
