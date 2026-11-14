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
    echo [ERROR] Python is not installed or not in PATH. Please run INSTALL_DEPENDENCIES.bat first.
    pause
    exit /b 1
)

REM 2. Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please run INSTALL_DEPENDENCIES.bat first.
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
echo [*] Waiting 4 seconds for servers to initialize...
timeout /t 4 /nobreak >nul

echo [*] Opening Dashboard in browser...
start http://localhost:5173

echo.
echo ======================================================================
echo   PatchShield is Running!
echo ======================================================================
echo   - Web Dashboard:     http://localhost:5173
echo   - Backend Swagger:   http://localhost:8000/docs
echo   - Protected Proxy:   http://localhost:8000/proxy/{site_id}/
echo   - Vulnerable Target: http://localhost:9000
echo.
echo   Default Credentials:
echo     Username: admin
echo     Password: Admin@123!
echo.
echo   To run automated Attack Simulator:
echo     Open a new terminal and type:
echo     python demo_lab\attack_simulator.py
echo ======================================================================
echo.
echo Press any key to stop this runner window (background servers will stay open in their windows).
pause >nul
