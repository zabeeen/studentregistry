@echo off
title Student Registry Application
echo ========================================================
echo        Starting Student Registry Application
echo ========================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Node.js detected.
    echo Starting local server and opening web browser...
    echo.
    start "" http://localhost:3000
    node server.js
) else (
    echo [INFO] Node.js not found in PATH.
    echo Opening application directly in your default web browser...
    start "" index.html
)
pause
