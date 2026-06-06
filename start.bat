@echo off
cd /d "%~dp0"

echo Starting Haq Homeo Clinic...
echo.

start "Backend" cmd /k "cd backend && uvicorn app.main:app --reload --port 8000"
timeout /t 3 /nobreak >nul
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
