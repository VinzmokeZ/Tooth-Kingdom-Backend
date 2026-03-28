@echo off
setlocal enabledelayedexpansion
title Tooth Kingdom - Pro One-Go APK Generator
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

:: Persistence Mode (keeps window open if launched via double-click)
if not defined PERSIST_MODE (
    set PERSIST_MODE=1
    start "" cmd /k "%~f0"
    exit /b
)

echo ============================================================
echo      TOOTH KINGDOM - PRO "ONE-GO" APK GENERATOR
echo ============================================================
echo.

:: Requirement Check
echo [CHECK] Verifying Requirements...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] 'npm' was not found. Please install Node.js.
    pause
    exit /b 1
)
if not exist "android\app\google-services.json" (
    echo [WARNING] google-services.json NOT FOUND in android\app\
    echo Firebase features ^(like Google Login^) may fail in the APK.
    echo.
) else (
    echo [SUCCESS] google-services.json found. Firebase will be active.
)

:: 1. IP Detection & .env Sync
echo.
echo [STEP 1] Detecting Local IP Address...
for /f "tokens=*" %%a in ('powershell -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.IPAddress -notlike '169.*' } | Select-Object -First 1 -ExpandProperty IPAddress" 2^>nul') do set "LOCAL_IP=%%a"

if "%LOCAL_IP%"=="" (
    set "LOCAL_IP=localhost"
)
echo [SUCCESS] Using IP: %LOCAL_IP%

:: Update .env for API connectivity
powershell -Command "(Get-Content .env) -replace 'VITE_LOCAL_BACKEND_URL=.*', 'VITE_LOCAL_BACKEND_URL=http://%LOCAL_IP%:8000' | Set-Content .env"

:: 2. App Branding (Icons)
echo.
echo [STEP 2] Processing App Branding...
if exist "icon.png" (
    if not exist "assets" mkdir assets
    copy /y "icon.png" "assets\icon-only.png" >nul
    copy /y "icon.png" "assets\icon-foreground.png" >nul
    copy /y "icon.png" "assets\icon-background.png" >nul
    
    echo [ACTION] Generating High-Quality APK Icons...
    call npx @capacitor/assets generate --android
) else (
    echo [INFO] No icon.png found. Using default icons.
)

:: 3. Web Production Build
echo.
echo [STEP 3] building Production Web App...
call npm run build
if !ERRORLEVEL! NEQ 0 (
    echo [ERROR] Web build failed!
    pause
    exit /b !ERRORLEVEL!
)

:: 4. Capacitor Sync
echo.
echo [STEP 4] Syncing Assets to Native Layer...
call npx cap sync android
if !ERRORLEVEL! NEQ 0 (
    echo [ERROR] Capacitor sync failed!
    pause
    exit /b !ERRORLEVEL!
)

:: 5. Native APK Compilation
echo.
echo [STEP 5] Compiling APK (Gradle)...
echo This might take a bit... go grab a coffee!
echo.
cd android
call gradlew.bat assembleDebug
if !ERRORLEVEL! NEQ 0 (
    echo [ERROR] Gradle build failed!
    pause
    exit /b !ERRORLEVEL!
)
cd ..

:: 6. Timestamping and moving the APK
echo.
echo [STEP 6] Versioning and Saving APK...
:: Create a builds folder if it doesn't exist
if not exist "BUILDS" mkdir "BUILDS"

:: Use PowerShell for a reliable cross-locale timestamp
for /f "tokens=*" %%a in ('powershell -Command "Get-Date -Format 'yyyyMMdd_HHmm'"') do set "TIMESTAMP=%%a"

set "NEW_APK_NAME=ToothKingdom_%TIMESTAMP%.apk"
set "SOURCE_APK=android\app\build\outputs\apk\debug\app-debug.apk"
set "DEST_APK=BUILDS\%NEW_APK_NAME%"

if exist "%SOURCE_APK%" (
    copy /y "%SOURCE_APK%" "%DEST_APK%" >nul
    if !ERRORLEVEL! EQU 0 (
        echo [SUCCESS] Saved new build as: %NEW_APK_NAME%
    ) else (
        echo [WARNING] Could not copy APK to BUILDS folder.
        set "DEST_APK=%SOURCE_APK%"
    )
) else (
    echo [ERROR] Built APK not found at %SOURCE_APK%
    pause
    exit /b 1
)

:: Final Completion
echo.
echo ============================================================
echo   SUCCESS! "ONE-GO" BUILD COMPLETE
echo ============================================================
echo.
echo Your final branded APK is ready at:
echo %DEST_APK%
echo.
echo IMPORTANT TIPS:
echo 1. All your previous builds are saved in the "BUILDS" folder.
echo 2. If Google Login fails, check your SHA-1 in Firebase Console.
echo 3. You can now upload this file to Firebase App Distribution.
echo.
pause
