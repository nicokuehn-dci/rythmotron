@echo off
echo Starting ARythm-EMU 2050 development server...
echo.

REM Check for node_modules directory
if not exist "node_modules" (
    echo node_modules directory not found. Please run 'npm install' first.
    exit /b 1
)

npx vite dev --host
pause
