@echo off
title PatchShield Virtual Patching Gateway Runner
echo ======================================================================
echo   PATCHSHIELD: SMB-Friendly AI-Era Virtual Patching Gateway
echo   Nasscom ARB 2.0 (Problem Statement 5)
echo ======================================================================
echo.

REM 1. Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH. Please install Python 3.10+.
    pause
    exit /b 1
)

REM 2. Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+.
    pause
    exit /b 1
)

echo [*] Starting Deliberately Vulnerable Demo Store on :9000...
start "PatchShield - Demo Store (:9000)" cmd /k "python -m uvicorn demo_lab.app:app --port 9000 --reload"

echo [*] Starting PatchShield Backend Gateway on :8000...
start "PatchShield - Backend Gateway (:8000)" cmd /k "python -m uvicorn backend.app.main:app --port 8000 --reload"

echo [*] Starting PatchShield Frontend Dashboard on :5173...
start "PatchShield - React UI (:5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ======================================================================
echo  PatchShield System is Launching!
echo  - Dashboard UI:    http://localhost:5173
echo  - Backend API:     http://localhost:8000/docs
echo  - Protected Proxy: http://localhost:8000/proxy/{site_id}/
echo  - Vulnerable Demo: http://localhost:9000
echo.
echo  Default Login:
echo    Username: admin
echo    Password: Admin@123!
echo.
echo  To run attack simulation:
echo    python demo_lab/attack_simulator.py
echo ======================================================================
pause

