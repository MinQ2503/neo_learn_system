@echo off
echo ========================================
echo Starting Anti-Cheating FastAPI Server
echo ========================================
echo.

REM Activate virtual environment if exists
if exist .venv\Scripts\activate.bat (
    echo Activating virtual environment...
    call .venv\Scripts\activate.bat
)

REM Check if port 8000 is available
netstat -ano | findstr :8000 >nul
if %errorlevel% == 0 (
    echo ERROR: Port 8000 is already in use!
    echo Please stop the process using port 8000 or change the port.
    pause
    exit /b 1
)

REM Check if dependencies are installed
python -c "import httpx" 2>nul
if %errorlevel% neq 0 (
    echo WARNING: httpx module not found!
    echo Installing dependencies...
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
)

REM Navigate to API directory
cd face-recognition\api

echo Starting server on http://localhost:8000
echo API Docs will be available at http://localhost:8000/docs
echo Press Ctrl+C to stop
echo.

REM Run uvicorn
uvicorn fastapi_cheat:app --host 127.0.0.1 --port 8000 --reload

pause

