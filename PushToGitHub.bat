@echo off
title Kurd24 Job - Push to GitHub
echo ===================================================
echo     Kurd24 Job - GitHub Push Automator
echo ===================================================
echo.
echo We have already committed your files locally.
echo Now we will link this local folder to your GitHub repository.
echo.
echo 1. Go to https://github.com and create a new repository named "kurd24-job".
echo 2. Copy the repository URL (should look like: https://github.com/your-username/kurd24-job.git)
echo.

set /p REPO_URL="Enter your GitHub Repository URL: "

if "%REPO_URL%"=="" (
    echo [ERROR] Repository URL cannot be empty!
    goto end
)

echo.
echo [1/3] Setting remote origin to %REPO_URL%...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
if %errorlevel% neq 0 (
    echo [ERROR] Failed to add remote origin.
    goto end
)

echo.
echo [2/3] Setting branch to main...
git branch -M main

echo.
echo [3/3] Pushing code to GitHub...
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to push code to GitHub. 
    echo Please make sure you entered the correct URL and are logged in to Git.
    goto end
)

echo.
echo ===================================================
echo SUCCESS! Your project is now uploaded to GitHub!
echo You can clone and edit it from any device.
echo ===================================================

:end
echo.
pause
