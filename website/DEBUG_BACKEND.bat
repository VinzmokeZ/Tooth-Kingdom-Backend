@echo off
TITLE Tooth Kingdom - Backend Debugger
COLOR 0C

echo ======================================================
echo   BACKEND DEBUG MODE
echo ======================================================
echo.

:: Force kill anything on port 8000 (standard Windows command)
echo [PRE-CHECK] Clearing port 8000 to prevent crash...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    if NOT "%%a"=="" (
        echo [INFO] Killing ghost process %%a on port 8000...
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo [SUCCESS] Port 8000 is ready.
echo.
echo Starting Python backend...
echo.

cd backend\python
python main.py

echo.
echo ======================================================
echo   BACKEND CRASHED OR STOPPED
echo ======================================================
echo.
echo Please copy the error message above and share it.
echo.
pause
