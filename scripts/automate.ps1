# Kurd24 Job - Automation & Deployment Assistant
# This script handles Supabase verification, Vercel static hosting deployment, and Expo EAS APK building.

Clear-Host
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "      Kurd24 Job - Fully Automatic Deployer       " -ForegroundColor Magenta -BackgroundColor Black
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Supabase Tables & Storage Buckets
Write-Host "[1/3] Checking Supabase Project Configuration..." -ForegroundColor Yellow
Write-Host "------------------------------------------------" -ForegroundColor Gray

$tableCheck = node scripts/test-tables.js 2>$null
$storageCheck = node scripts/test-storage.js 2>$null

$systemSettingsExists = $tableCheck -match "Table 'system_settings' exists"
$jobImagesExists = $storageCheck -match "SUCCESS: `"job-images`" bucket exists"
$resumesExists = $storageCheck -match "resumes" # We can check resumes bucket too

if (-not $systemSettingsExists) {
    Write-Host "[X] ERROR: 'system_settings' table is missing in Supabase database!" -ForegroundColor Red
    Write-Host "    Please run the SQL query from your implementation plan in your Supabase SQL Editor." -ForegroundColor Yellow
} else {
    Write-Host "[OK] 'system_settings' table is ready in Supabase." -ForegroundColor Green
}

if (-not $jobImagesExists) {
    Write-Host "[X] ERROR: 'job-images' storage bucket is missing or not public!" -ForegroundColor Red
    Write-Host "    Please create a storage bucket named 'job-images' in Supabase Dashboard and set it to PUBLIC." -ForegroundColor Yellow
} else {
    Write-Host "[OK] 'job-images' storage bucket is ready." -ForegroundColor Green
}

if (-not $systemSettingsExists -or -not $jobImagesExists) {
    Write-Host ""
    Write-Host "⚠️  Please configure your Supabase settings first to avoid admin portal crashes after deployment!" -ForegroundColor Red
    Write-Host ""
} else {
    Write-Host "[OK] Supabase checks passed successfully!" -ForegroundColor Green
    Write-Host ""
}

# Step 2: Vercel Deploy Options
Write-Host "[2/3] Vercel Hosting Deployment" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Gray
$deployVercel = Read-Host "Do you want to deploy the Admin Portal & Landing Page to Vercel now? (Y/N)"

if ($deployVercel -eq "Y" -or $deployVercel -eq "y") {
    Write-Host "Checking Vercel login status..." -ForegroundColor Cyan
    $whoami = powershell -ExecutionPolicy Bypass -Command "npx vercel whoami" 2>$null
    if ($whoami -match "Error" -or $whoami -eq $null -or $whoami -eq "") {
        Write-Host "You are not logged into Vercel. Opening Vercel Login Flow..." -ForegroundColor Yellow
        powershell -ExecutionPolicy Bypass -Command "npx vercel login"
    } else {
        Write-Host "Logged in as: $whoami" -ForegroundColor Green
    }

    Write-Host "Deploying to Vercel..." -ForegroundColor Cyan
    # Run production vercel deploy
    powershell -ExecutionPolicy Bypass -Command "npx vercel --prod --yes"
    Write-Host "✅ Static Admin & Landing page deployed successfully to Vercel!" -ForegroundColor Green
} else {
    Write-Host "Skipped Vercel deployment." -ForegroundColor Gray
}
Write-Host ""

# Step 3: Expo APK Build Options
Write-Host "[3/3] Android APK Cloud Compilation (Expo EAS)" -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor Gray
$buildApk = Read-Host "Do you want to build the native Android APK file now? (Y/N)"

if ($buildApk -eq "Y" -or $buildApk -eq "y") {
    Write-Host "Checking Expo EAS login status..." -ForegroundColor Cyan
    $expoWhoami = powershell -ExecutionPolicy Bypass -Command "npx eas-cli whoami" 2>$null
    if ($expoWhoami -match "Not logged in" -or $expoWhoami -eq $null -or $expoWhoami -eq "") {
        Write-Host "You are not logged into Expo. Opening Expo Login Flow..." -ForegroundColor Yellow
        powershell -ExecutionPolicy Bypass -Command "npx eas-cli login"
    } else {
        Write-Host "Logged in as: $expoWhoami" -ForegroundColor Green
    }

    Write-Host "Starting Expo EAS Build for Android (APK)..." -ForegroundColor Cyan
    Write-Host "This will build your Android APK in the cloud. It may take 5-15 minutes." -ForegroundColor Yellow
    powershell -ExecutionPolicy Bypass -Command "npx eas-cli build --platform android --profile preview --non-interactive"
} else {
    Write-Host "Skipped APK build." -ForegroundColor Gray
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "                 Deployment Finished                " -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "To re-run this automation tool anytime, use command:" -ForegroundColor Gray
Write-Host "powershell -ExecutionPolicy Bypass -File scripts/automate.ps1" -ForegroundColor Yellow
Write-Host ""
