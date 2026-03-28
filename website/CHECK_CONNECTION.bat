@echo off
TITLE Tooth Kingdom - Backend Connection Check
COLOR 0A

echo Checking backend connectivity...
echo.

echo [1/2] Checking http://127.0.0.1:8000 ...
curl -s -o nul -w "HTTP Code: %%{http_code}" http://127.0.0.1:8000/
echo.
if %errorlevel% neq 0 (
    echo [ERROR] Could not connect to 127.0.0.1:8000
) else (
    echo [SUCCESS] Connected to 127.0.0.1:8000
)
echo.

echo [2/2] Checking http://localhost:8000 ...
curl -s -o nul -w "HTTP Code: %%{http_code}" http://localhost:8000/
echo.
if %errorlevel% neq 0 (
    echo [ERROR] Could not connect to localhost:8000
) else (
    echo [SUCCESS] Connected to localhost:8000
)
echo.

echo If you see [SUCCESS], the backend is running perfectly.
echo If you see [ERROR], please run KILL_ALL_PYTHON.bat and try again.
pause
