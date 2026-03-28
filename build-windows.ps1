# Harmonia Build Script for Windows PowerShell
# Run this script to build the desktop application

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Harmonia Desktop App Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if bun is installed
if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Bun is not installed!" -ForegroundColor Red
    Write-Host "Please install Bun from: https://bun.sh" -ForegroundColor Yellow
    exit 1
}

# Check if Node.js is installed (for electron-builder)
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/5] Installing dependencies..." -ForegroundColor Green
bun install

Write-Host "[2/5] Compiling Electron main process..." -ForegroundColor Green
bun run electron:compile

Write-Host "[3/5] Building Next.js app..." -ForegroundColor Green
bun run build

Write-Host "[4/5] Copying files for Electron..." -ForegroundColor Green
if (Test-Path "electron\out") { Remove-Item -Recurse -Force "electron\out" }
Copy-Item -Recurse -Force "out" "electron\out"

Write-Host "[5/5] Building Electron app for Windows..." -ForegroundColor Green
npx electron-builder --win

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  BUILD COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your app is in the 'release' folder:" -ForegroundColor Cyan
Get-ChildItem -Path "release" -Filter "*.exe" | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor White
}
Write-Host ""
Write-Host "You can:" -ForegroundColor Yellow
Write-Host "  1. Run the .exe file to install Harmonia" -ForegroundColor White
Write-Host "  2. Share the .exe file with others" -ForegroundColor White
Write-Host "  3. Upload to GitHub Releases" -ForegroundColor White
Write-Host ""
