@echo off
title PatchShield - Dependencies Installer
echo ======================================================================
echo   PATCHSHIELD: DEPENDENCY INSTALLATION WIZARD
echo   Installs all Python (Backend) and Node.js (Frontend) dependencies
echo ======================================================================
echo.

REM 1. Verify Python
echo [*] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.10 or 3.11 from https://www.python.org/
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do echo [OK] Found %%i

REM 2. Verify Node.js and npm
echo [*] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo [OK] Found Node.js %%i

npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not found in PATH!
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do echo [OK] Found npm %%i
echo.

REM 3. Install Python Dependencies
echo ======================================================================
echo [*] Step 1/2: Installing Python Backend Packages...
echo ======================================================================
python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install some Python packages. Check your internet connection.
    pause
    exit /b 1
)
echo [OK] Python packages installed successfully!
echo.

REM 4. Install Node.js Frontend Dependencies
echo ======================================================================
echo [*] Step 2/2: Installing Frontend UI Packages (React + Tailwind)...
echo ======================================================================
cd frontend
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install npm packages.
    cd ..
    pause
    exit /b 1
)
echo [OK] Building frontend to verify bundle...
call npm run build
if errorlevel 1 (
    echo [ERROR] Frontend build check failed.
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Frontend packages installed and verified!
echo.

echo ======================================================================
echo  [SUCCESS] All PatchShield dependencies are successfully installed!
echo  
echo  Next Step:
echo    Double-click "START_PATCHSHIELD.bat" to run PatchShield.
echo ======================================================================
pause
