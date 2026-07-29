@echo off
chcp 65001 >nul
title EcoLabel X — One-Click Startup Script
cls
echo ===================================================
echo   EcoLabel X - ESG Intelligence Engine
echo ===================================================
echo.

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "EcoLabel X Backend" cmd /k "cd /d %~dp0\backend && ..\venv\Scripts\uvicorn.exe main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Starting Next.js Frontend on http://localhost:3000 ...
start "EcoLabel X Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ===================================================
echo   [OK] Both servers launched successfully!
echo   [URL] Access website at: http://localhost:3000
echo ===================================================
echo.
pause
