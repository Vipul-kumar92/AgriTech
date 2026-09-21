@echo off
echo ======================================================================
echo Starting AI-Based Crop Yield Prediction System
echo ======================================================================

set "PATH=C:\Program Files\nodejs;%PATH%"

echo 1. Verifying MongoDB Service...
net start MongoDB >nul 2>&1

echo 2. Starting FastAPI Backend Server on port 8000...
start "AgriTech Backend (FastAPI)" cmd /k "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000"

echo 3. Starting React Frontend Server on port 5173...
cd frontend
start "AgriTech Frontend (Vite)" cmd /k "set PATH=C:\Program Files\nodejs;%%PATH%% && npm run dev -- --host 127.0.0.1 --port 5173"
cd ..

echo 4. Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo 5. Launching AgriTech Web Application in Default Browser...
start http://localhost:5173

echo ======================================================================
echo Application is running!
echo Frontend: http://localhost:5173
echo Backend API & Docs: http://localhost:8000/docs
echo ======================================================================
pause
