@echo off
setlocal enabledelayedexpansion

:: ============================================================
:: SELF ELEVATE (Admin check)
:: ============================================================
IF NOT "%1"=="ADMIN" (
    echo [INFO] Requesting Administrator privileges...
    powershell -command "Start-Process -FilePath '%~f0' -ArgumentList 'ADMIN' -Verb RunAs"
    exit /b
)

:: Now running as Admin — restore original directory
cd /d "%~dp0"

title TOOTH KINGDOM - BULLETPROOF LAUNCH
color 0B
cls

echo.
echo  ==========================================================
echo    TOOTH KINGDOM ADVENTURE - BULLETPROOF LAUNCH
echo    I will keep windows open even if they crash!
echo  ==========================================================
echo.

:: ============================================================
:: STEP 0: ENVIRONMENT CHECK
:: ============================================================
echo [0/5] Checking Environment...
node -v >nul 2>&1 || (echo [!!] Node.js NOT found! && pause && exit /b)
python --version >nul 2>&1 || (echo [!!] Python NOT found! && pause && exit /b)
echo [OK] Env checks out.

:: ============================================================
:: STEP 1: FIX FIREWALL
:: ============================================================
echo [1/5] Fixing Windows Firewall (8010, 3000)...
netsh advfirewall firewall delete rule name="Tooth Kingdom Port 8010" >nul 2>&1
netsh advfirewall firewall add rule name="Tooth Kingdom Port 8010" dir=in action=allow protocol=TCP localport=8010 profile=any >nul 2>&1
netsh advfirewall firewall delete rule name="Tooth Kingdom Port 3000" >nul 2>&1
netsh advfirewall firewall add rule name="Tooth Kingdom Port 3000" dir=in action=allow protocol=TCP localport=3000 profile=any >nul 2>&1
echo [OK] Firewall rules applied.

:: ============================================================
:: STEP 2: CLEAR RELEVANT PORTS
:: ============================================================
echo [2/5] Clearing ports 8010 (Backend) and 3000 (Frontend)...
for /f "tokens=5" %%i in ('netstat -aon 2^>nul ^| findstr ":8010"') do taskkill /F /PID %%i >nul 2>&1
for /f "tokens=5" %%i in ('netstat -aon 2^>nul ^| findstr ":3000"') do taskkill /F /PID %%i >nul 2>&1
timeout /t 1 >nul
echo [OK] Ports cleared.

:: ============================================================
:: STEP 3: PREPARE BACKEND
:: ============================================================
echo [3/5] Updating Python/Dependencies...
python -m pip install --upgrade pip --quiet
python -m pip install -r backend/python/requirements.txt --quiet
if %ERRORLEVEL% NEQ 0 (
    echo [!!] Dependency installation failed!
    pause
)
echo [OK] Backend Environment Ready.

:: ============================================================
:: STEP 4: MASTER LAUNCH (PowerShell for Absolute Stability)
:: ============================================================
echo [4/5] Launching Services (PowerShell Isolation)...
echo.
echo [BACKEND] Starting in separate window...
start "BACKEND_SERVICE" powershell -NoExit -Command "$host.ui.RawUI.WindowTitle='HARU_BACKEND'; cd '%~dp0backend\python'; python -u main.py"

echo [FRONTEND] Starting in separate window...
start "FRONTEND_SERVICE" powershell -NoExit -Command "$host.ui.RawUI.WindowTitle='HARU_VITE'; cd '%~dp0'; npm run dev"

timeout /t 5 >nul

:: ============================================================
:: STEP 5: OPEN WEBSITE
:: ============================================================
echo [5/5] Opening Tooth Kingdom in your browser...
start http://localhost:3000

echo.
echo  ==========================================================
echo    V7 STABILITY PATCH DEPLOYED!
echo    PowerShell windows will NOT close on crash.
echo    If they fail, look for red text in the windows.
echo  ==========================================================
echo.
pause
