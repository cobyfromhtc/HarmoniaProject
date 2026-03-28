#!/bin/bash
# Harmonia Build Script for macOS/Linux

echo "========================================"
echo "  Harmonia Desktop App Builder"
echo "========================================"
echo ""

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "ERROR: Bun is not installed!"
    echo "Please install Bun from: https://bun.sh"
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org"
    exit 1
fi

echo "[1/5] Installing dependencies..."
bun install

echo "[2/5] Compiling Electron main process..."
bun run electron:compile

echo "[3/5] Building Next.js app..."
bun run build

echo "[4/5] Copying files for Electron..."
rm -rf electron/out
cp -r out electron/out

echo "[5/5] Building Electron app..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    npx electron-builder --mac
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    npx electron-builder --linux
else
    npx electron-builder --win
fi

echo ""
echo "========================================"
echo "  BUILD COMPLETE!"
echo "========================================"
echo ""
echo "Your app is in the 'release' folder:"
ls -la release/ 2>/dev/null || echo "  (No release files found)"
echo ""
echo "You can:"
echo "  1. Run the installer to install Harmonia"
echo "  2. Share the installer with others"
echo "  3. Upload to GitHub Releases"
echo ""
