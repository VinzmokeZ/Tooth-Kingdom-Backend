@echo off
setlocal enabledelayedexpansion
title Tooth Kingdom - Android Studio ULTRA Launcher (Debug Mode)

:: Use the directory where the script is located
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

echo ============================================================
echo      TOOTH KINGDOM - ANDROID STUDIO ULTRA PREP
echo ============================================================
echo Current Directory: %CD%
echo.

:: Check for basic requirements
echo [CHECK] Checking for Node.js...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] 'npm' was not found. Please install Node.js.
    pause
    exit /b 1
)
echo [SUCCESS] Node.js found.

echo.
echo  SELECT LAUNCH MODE:
echo  [1] FULL REBUILD (Clean and Build)
echo  [2] QUICK HOSTING SYNC (Sync existing build)
echo  [3] REPAIR & SYNC (Forces full asset refresh - Fixes stuck loading)
echo.
set /p MODE="Enter choice (1, 2, or 3): "

:: 1. Auto-Detect local IP address
echo.
echo [STEP 1] Detecting Local IP Address...
for /f "tokens=*" %%a in ('powershell -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.IPAddress -notlike '169.*' } | Select-Object -First 1 -ExpandProperty IPAddress" 2^>nul') do set "LOCAL_IP=%%a"

if "%LOCAL_IP%"=="" (
    set "LOCAL_IP=localhost"
)
echo [SUCCESS] Using IP: %LOCAL_IP%

:: 2. Update .env for Android connectivity
echo [STEP 2] Updating configuration...
powershell -Command "(Get-Content .env) -replace 'VITE_LOCAL_BACKEND_URL=.*', 'VITE_LOCAL_BACKEND_URL=http://%LOCAL_IP%:8000' | Set-Content .env"
echo [SUCCESS] .env updated.

if "%MODE%"=="2" (
    echo.
    echo [FAST TRACK] Skipping Full Rebuild...
    if not exist build (
        echo [ERROR] No 'build' folder found! Please run Mode [1] once.
        pause
        exit /b 1
    )
) else if "%MODE%"=="3" (
    echo.
    echo [REPAIR MODE] Starting Full Reset...
    echo [STEP 3] Cleaning old assets (Fixes UI logs/hangs)...
    if exist build rd /s /q build
    if exist "android\app\src\main\assets\public" rd /s /q "android\app\src\main\assets\public"

    echo [STEP 4] Rebuilding Web App (npm run build)...
    call npm run build
    
    echo [STEP 5] Copying Assets (npx cap copy android)...
    call npx cap copy android

    echo [STEP 6] Final Sync (npx cap sync android)...
    call npx cap sync android
    goto OPEN_STUDIO
) else (
    :: 3. CLEAN
    echo.
    echo [STEP 3] Cleaning old assets...
    if exist build rd /s /q build
    if exist "android\app\src\main\assets\public" rd /s /q "android\app\src\main\assets\public"

    :: 4. Build
    echo.
    echo [STEP 4] Rebuilding Web App...
    call npm run build
    if !ERRORLEVEL! NEQ 0 (
        echo [ERROR] Build failed!
        pause
        exit /b !ERRORLEVEL!
    )
)

:: 5. Sync
echo.
echo [STEP 5] Syncing to Capacitor...
call npx cap sync android
if !ERRORLEVEL! NEQ 0 (
    echo [ERROR] Sync failed!
    pause
    exit /b !ERRORLEVEL!
)

:OPEN_STUDIO
:: 6. Run and Open
echo.
echo [STEP 6] Opening Android Studio...
echo [ACTION] Deploying in background...
start "Capacitor Run" npx cap run android

echo [ACTION] Launching Android Studio UI...

:: Try the official capacitor way first
call npx cap open android
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Standard open failed. Searching for Android Studio manually...
    
    :: Search common installation paths
    set "STUDIO_PATH="
    if exist "C:\Program Files\Android\Android Studio\bin\studio64.exe" set "STUDIO_PATH=C:\Program Files\Android\Android Studio\bin\studio64.exe"
    if not defined STUDIO_PATH if exist "%LocalAppData%\Google\Android Studio\bin\studio64.exe" set "STUDIO_PATH=%LocalAppData%\Google\Android Studio\bin\studio64.exe"
    
    if defined STUDIO_PATH (
        echo [SUCCESS] Found Android Studio at: !STUDIO_PATH!
        echo [ACTION] Opening project folder: %PROJECT_ROOT%android
        start "" "!STUDIO_PATH!" "%PROJECT_ROOT%android"
    ) else (
        echo [ERROR] Could not find Android Studio (studio64.exe).
        echo Please open Android Studio manually and load the folder:
        echo %PROJECT_ROOT%android
    )
)

echo.
echo ============================================================
echo   DONE! Check Android Studio to see your app.
echo ============================================================
echo.
pause
