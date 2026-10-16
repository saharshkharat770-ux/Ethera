@echo off
echo =========================================================================
echo  STARTING ETHERA: AI FUEL INTELLIGENCE PLATFORM
echo =========================================================================

echo Starting Backend API on http://127.0.0.1:8000 ...
start "ETHERA Backend API" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo Starting Next.js Frontend on http://localhost:3000 ...
start "ETHERA Frontend Web" cmd /k "cd frontend && npm run dev"

echo.
echo =========================================================================
echo  ETHERA Platform is booting!
echo  - Public Landing Page:  http://localhost:3000
echo  - Main Dashboard HUD:   http://localhost:3000/dashboard
echo  - FastAPI Swagger Docs: http://127.0.0.1:8000/docs
echo =========================================================================
