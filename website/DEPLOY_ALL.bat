@echo off
setlocal enabledelayedexpansion
title Tooth Kingdom - Deploy Everywhere
color 0D

echo ============================================================
echo     TOOTH KINGDOM - ONE-CLICK DEPLOY TO ALL TARGETS
echo ============================================================
echo.
echo  This will:
echo    [1] Build the production web app
echo    [2] Deploy to Firebase Hosting (live website)
echo    [3] Sync to Android Studio (for APK build)
echo    [4] Deploy Cloud AI (Tanu's Brain)
echo.
echo ============================================================
echo.

:: ── STEP 1: Production Build ──────────────────────────────────
echo [STEP 1/3] Building production web app...
echo.
call npm run build
if !ERRORLEVEL! NEQ 0 (
    echo.
    echo [ERROR] Build failed! Fix the errors above and try again.
    pause
    exit /b 1
)
echo.
echo [OK] Build complete!
echo.

:: ── STEP 2: Firebase Deploy ───────────────────────────────────
echo [STEP 2/3] Deploying to Firebase Hosting...
echo.
call npx firebase-tools deploy --only hosting --project tooth-kingdom-adventure --non-interactive
if !ERRORLEVEL! NEQ 0 (
    echo.
    echo [WARNING] Firebase deploy may have failed. Check output above.
) else (
    echo.
    echo [OK] Firebase deployed! Live at: https://tooth-kingdom-adventure.web.app
)
echo.

:: ── STEP 3: Capacitor Sync (Android Studio) ───────────────────
echo [STEP 3/4] Syncing to Android Studio...
echo.
echo [NUCLEAR CLEAN] Purging ALL Android build caches and assets...
rd /s /q "android\app\src\main\assets\public" 2>nul
rd /s /q "android\app\build" 2>nul
call npx cap sync android
if !ERRORLEVEL! NEQ 0 (
    echo.
    echo [WARNING] Android sync may have failed. Check output above.
) else (
    echo.
    echo [OK] Android Studio synced! Hit Run in Android Studio to build the APK.
)
echo.

:: ── STEP 4: Cloud AI Functions ───────────────────────────────
set /p DEPLOY_CLOUD="Do you want to deploy Cloud AI functions? (Usually Y only if you have Blaze plan) [y/n]: "
if /i "%DEPLOY_CLOUD%" NEQ "y" (
    echo [SKIP] Skipping Cloud AI deployment...
    goto :DONE
)

echo [STEP 4/4] Deploying Cloud AI (Tanu's Brain)...
echo.
cd functions
call npm install
cd ..
call npx firebase-tools deploy --only functions --project tooth-kingdom-adventure --non-interactive
if !ERRORLEVEL! NEQ 0 (
    echo.
    echo [WARNING] Cloud AI deploy may have failed. Check output above.
) else (
    echo.
    echo [OK] Cloud AI deployed! Tanu is now globally available.
)
echo.

:DONE

:: ── Done ──────────────────────────────────────────────────────
echo ============================================================
echo   ALL DONE!
echo.
echo   Website : https://tooth-kingdom-adventure.web.app
echo   Android : Open Android Studio and click the Play button
echo ============================================================
echo.
pause
