@echo off
TITLE Tooth Kingdom - Force Kill Python
COLOR 0C

echo Killing all Python processes...
taskkill /F /IM python.exe /T
echo.
echo Killing all Node/NPM processes (just in case)...
taskkill /F /IM node.exe /T
echo.
echo DONE! Now try running START_PRODUCTION_BUILD.bat again.
pause
