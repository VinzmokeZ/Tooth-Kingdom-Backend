@echo off
echo [Tooth Kingdom] EMERGENCY SECURITY REPAIR...

:: 1. Remove .env from Git Index (Scrubbing from Repo, keeping it locally)
echo Removing leaked .env from GitHub index...
git rm --cached .env >nul 2>&1

:: 2. Ensure .gitignore is tracking it
echo Verifying .gitignore covers .env...
findstr /C:".env" .gitignore >nul 2>&1 || echo .env >> .gitignore

:: 3. Commit and Push the Clean State
echo Committing the security fix (Removing secrets)...
git add .gitignore .env.example
git commit -m "SECURITY: Scrubbed leaked .env and replaced with sanitized .env.example"
git push origin main

echo.
echo [COMPLETE] The leaked .env is now hidden from the main branch on GitHub.
echo IMPORTANT: Your SMTP App Password was public! YOU MUST GO TO GOOGLE 
echo AND GENERATE A NEW APP PASSWORD IMMEDIATELY.
pause
