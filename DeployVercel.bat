@echo off
title Kurd24 Job Vercel Deployer
echo ===================================================
echo           Kurd24 Job - Vercel Site Deployer
echo ===================================================
echo.

:: Step 1: Login to Vercel
echo [1/3] Checking Vercel login status...
echo Please select your login option and complete it in your browser.
echo.
call node node_modules/vercel/dist/index.js login
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Vercel login failed or was cancelled.
    goto end
)
echo.

:: Step 2: Build the project locally
echo [2/3] Building the admin portal locally...
call node build.js
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Local build failed. Cannot proceed with deployment.
    goto end
)
echo Build completed successfully.
echo.

:: Step 3: Deploy to Vercel
echo [3/3] Deploying project to Vercel...
echo Uploading site files...
echo.
call node node_modules/vercel/dist/index.js --prod --yes

:end
echo.
echo ===================================================
echo Deployment process complete. Press any key to exit.
echo ===================================================
pause
