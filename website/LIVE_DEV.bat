@echo off
TITLE Tooth Kingdom Adventure - LIVE DEVELOPER MODE
COLOR 0B

echo ======================================================
echo   TOOTH KINGDOM ADVENTURE - LIVE DEV MODE
echo ======================================================
echo.
echo [INFO] This mode allows for INSTANT live changes.
echo [INFO] Keep this window open while you work.
echo.
echo [INFO] Step 1: Checking Python Dependencies...
python -m pip install -r backend/python/requirements.txt --quiet
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Dependency check failed. Attempting to fix...
    python -m pip install fastapi uvicorn pydantic mysql-connector-python passlib bcrypt PyJWT google-generativeai elevenlabs python-dotenv requests --user
)

echo [INFO] Step 2: Database Ready (Using SQLite)
echo Skip MySQL check as we have moved to standalone SQLite.

echo [INFO] Step 3: Launching Unified Dev Environment...
echo (Vite + Python Backend Logs will appear below)
echo.

npx concurrently -n "VITE,PY_BACKEND" -c "cyan,green" "npm run dev" "cd backend/python && python main.py"

pause
