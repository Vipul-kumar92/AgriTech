# PowerShell Runner for AI-Based Crop Yield Prediction System
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "Starting AI-Based Crop Yield Prediction System" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green

$env:PATH = "C:\Program Files\nodejs;$env:PATH"

# Ensure MongoDB service is running
Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue | Start-Service

# Start FastAPI Backend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000"

# Start React Frontend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'd:\AgriTech\frontend'; `$env:PATH = 'C:\Program Files\nodejs;`$env:PATH'; npm run dev -- --host 127.0.0.1 --port 5173"

Start-Sleep -Seconds 3

# Launch default browser
Start-Process "http://localhost:5173"

Write-Host "Application launched successfully!" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "API Documentation: http://localhost:8000/docs" -ForegroundColor Yellow
