#!/usr/bin/env bash
set -e

echo "======================================================================"
echo "  PATCHSHIELD: SMB-Friendly AI-Era Virtual Patching Gateway"
echo "  Nasscom ARB 2.0 (Problem Statement 5)"
echo "======================================================================"
echo ""

echo "[*] Checking Docker..."
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "[+] Docker Compose detected. Starting via Docker..."
    docker-compose up -d --build
    echo ""
    echo "======================================================================"
    echo " PatchShield System is Running via Docker!"
    echo " - Dashboard UI:    http://localhost:3000"
    echo " - Backend API:     http://localhost:8000/docs"
    echo " - Vulnerable Demo: http://localhost:9000"
    echo " Default Admin: admin / Admin@123!"
    echo "======================================================================"
else
    echo "[*] Docker not found. Starting locally..."
    python3 -m uvicorn demo_lab.app:app --port 9000 &
    PID_DEMO=$!
    python3 -m uvicorn backend.app.main:app --port 8000 &
    PID_BACKEND=$!
    cd frontend && npm run dev &
    PID_FRONTEND=$!

    echo "Running. Press Ctrl+C to stop all services."
    trap "kill $PID_DEMO $PID_BACKEND $PID_FRONTEND" EXIT
    wait
fi

