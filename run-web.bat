@echo off
cd /d "%~dp0web"

if not exist "ColorPdfSpliter.py" (
    copy "..\ColorPdfSpliter.py" "." >nul
    echo [OK] ColorPdfSpliter.py copied
) else (
    echo [OK] ColorPdfSpliter.py ready
)

echo.
echo ================================
echo  ColorPdfSpliter Web Server
echo ================================
echo.
echo  Open browser to:
echo   http://localhost:4000
echo.
echo  Close this window to stop server
echo ================================
echo.

start http://localhost:4000
python -m http.server 4000

pause
