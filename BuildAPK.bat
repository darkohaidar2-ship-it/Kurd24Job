@echo off
title Kurd24 Job APK Builder
echo ===================================================
echo           Kurd24 Job - APK Build Automator
echo ===================================================
echo.

:: Step 1: Install EAS CLI globally if not installed
echo [1/3] Checking/Installing EAS CLI globally...
call npm install -g eas-cli
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install EAS CLI. Please make sure Node.js is installed.
    goto end
)
echo EAS CLI is ready.
echo.

:: Step 2: Check Expo Login status
echo [2/3] Checking Expo Login status...
call eas whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo You are not logged in. Please log in to your Expo account.
    echo.
    call eas login
) else (
    echo You are already logged in.
)
echo.

:: Step 3: Run the build
echo [3/3] Initiating Android APK build...
echo This will upload the project to Expo servers and build the APK.
echo.
call eas build --platform android --profile preview

:end
echo.
echo ===================================================
echo Build process complete. Press any key to exit.
echo ===================================================
pause
