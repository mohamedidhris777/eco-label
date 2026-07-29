@echo off
chcp 65001 >nul
title EcoLabel X — One-Click Startup Script
cls
echo ===================================================
echo   EcoLabel X - ESG Intelligence Engine
echo ===================================================
echo.

echo [1/3] Starting FastAPI Backend on http://localhost:8000 ...
start "EcoLabel X Backend" cmd /k "cd /d %~dp0\backend && ..\venv\Scripts\uvicorn.exe main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/3] Starting Next.js Frontend on http://localhost:3000 ...
start "EcoLabel X Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo [3/3] Opening Website in Default Browser ...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ===================================================
echo   [OK] Both servers launched successfully!
echo   [URL] Website opened at: http://localhost:3000
echo ===================================================
echo.
pause
