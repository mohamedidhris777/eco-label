@echo off
title EcoLabel X — One-Click Startup Script
echo ===================================================
echo   🌿 EcoLabel X — ESG Intelligence Engine
echo ===================================================
echo.

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "EcoLabel X Backend" cmd /k "cd /d %~dp0\backend && ..\venv\Scripts\uvicorn.exe main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Starting Next.js Frontend on http://localhost:3000 ...
start "EcoLabel X Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ===================================================
echo   ✅ Both servers launched successfully!
echo   👉 Access website at: http://localhost:3000
echo ===================================================
echo.
pause
