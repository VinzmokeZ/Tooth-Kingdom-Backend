@echo off
SETLOCAL EnableDelayedExpansion

echo ======================================================
echo    Tooth Kingdom Adventure - All-in-One API Setup
echo ======================================================

:: 1. Start the Backend in a new window
echo [1/3] Starting FastAPI Backend...
start "Tooth Kingdom Backend" cmd /c "python main.py"

:: 2. Wait for server to start
echo [2/3] Waiting for server to initialize (5s)...
timeout /t 5 /nobreak > nul

:: 3. Run a Test Registration using PowerShell
echo [3/3] Running Test Registration (Simulated Postman)...
echo.

powershell -Command ^
    "$body = @{ name='AutoTestHero'; email='autotest@example.com'; password='password123'; dob='2010-01-01' } | ConvertTo-Json;" ^
    "$response = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/auth/register' -Method Post -Body $body -ContentType 'application/json';" ^
    "Write-Host '--- API RESPONSE ---' -ForegroundColor Cyan;" ^
    "$response | ConvertTo-Json;" ^
    "if ($response.success -eq $true) { Write-Host 'SUCCESS: Data Registered!' -ForegroundColor Green } else { Write-Host 'FAILED: Check Server Logs' -Color Red }"

echo.
echo ======================================================
echo    TEST COMPLETE!
echo    - Your backend is still running in the other window.
echo    - Opening API Documentation (Interactive UI)...
echo    - Launching Postman Desktop...
echo.
echo    IMPORTANT: Import 'ToothKingdom.postman_collection.json'
echo    into Postman to see the data there!
echo ======================================================

:: Attempt to launch Postman
start postman:// 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Postman custom protocol not found. 
    echo Trying to start Postman app directly...
    start "" "Postman" 2>nul
)

:: Open Interactive Docs as fallback
start http://127.0.0.1:8000/docs

echo.
echo Press any key to exit this script (Backend remains running).
pause > nul
