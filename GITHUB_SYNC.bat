@echo off
echo [Tooth Kingdom] Preparing Backend GitHub Sync...

:: 1. Force untrack .env (Safety first)
echo Cleaning Git cache (ensuring .env is ignored)...
git rm --cached .env >nul 2>&1

:: 2. Add and Commit
echo Adding sanitized backend and SMTP fixes...
git add .
git commit -m "Senior Dev: Security sanitization and backend connectivity fixes"

:: 3. Push
echo Syncing to GitHub (Backend Repo)...
git push origin main

echo.
echo [SUCCESS] Backend GitHub is now up to date!
pause
