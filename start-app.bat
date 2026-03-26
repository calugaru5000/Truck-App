@echo off
title TruckHub Launcher
echo.
echo  ==========================================
echo   TruckHub - Starting Application...
echo  ==========================================
echo.

echo  [1/2] Starting Backend - FastAPI (http://localhost:5000)...
start "TruckHub Backend" cmd /k "cd /d "%~dp0backend" && python -m uvicorn main:app --reload --port 5000"

timeout /t 2 /nobreak >nul

echo  [2/2] Starting Frontend (http://localhost:5173)...
start "TruckHub Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo  Both servers are starting in separate windows.
echo.
echo  Backend:  http://localhost:5000  (FastAPI + uvicorn)
echo  Frontend: http://localhost:5173  (React + Vite)
echo  API Docs: http://localhost:5000/docs
echo.
echo  You can close this window. To stop the app, close the other two windows.
echo.
pause
