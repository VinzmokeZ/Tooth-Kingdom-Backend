@echo off
setlocal enabledelayedexpansion
title Tooth Kingdom - Android Sync
color 0D

echo ============================================================
echo     TOOTH KINGDOM - DEDICATED ANDROID SYNC
echo ============================================================
echo.
echo  This script will:
echo    [1] Nuclear Clean Android caches
echo    [2] Sync current source to Android Studio
echo.
echo  Note: This does NOT run a build. Use DEPLOY_ALL for full build.
echo.
echo ============================================================
echo.

:: ── STEP 1: Nuclear Clean ─────────────────────────────────────
echo [STEP 1/2] Purging Android build caches and assets...
rd /s /q "android\app\src\main\assets\public" 2>nul
rd /s /q "android\app\build" 2>nul
echo [OK] Clean complete.

:: ── STEP 2: Capacitor Sync ─────────────────────────────────────
echo [STEP 2/2] Syncing to Android Studio...
echo.
call npx cap sync android
if !ERRORLEVEL! NEQ 0 (
    echo.
    echo [ERROR] Android sync failed. Check output above.
    pause
    exit /b 1
) else (
    echo.
    echo [OK] Android Studio synced! 
    echo Hit Run in Android Studio to build the APK.
)
echo.

echo ============================================================
echo   SUCCESS!
echo ============================================================
echo.
pause
