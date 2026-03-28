@echo off
TITLE Tooth Kingdom Adventure - Fast Deploy
COLOR 0E

echo ======================================================
echo   TOOTH KINGDOM - QUICK DEPLOY TO FIREBASE
echo ======================================================
echo.

:: 1. BUILD CHECK
echo [1/2] Verifying production build...
if not exist "build\index.html" (
    echo [ERROR] Build folder not found!
    echo Running npm run build first...
    call npm run build
) else (
    echo [OK] Production build found!
)

:: 2. DEPLOY
echo [2/2] Deploying to Firebase Hosting...
call npx -p firebase-tools firebase deploy --only hosting

echo.
echo ======================================================
echo   DEPLOYMENT COMPLETE!
echo ======================================================
echo.
pause
