# 🎵 Harmonia

A premium, open-source desktop soundboard application designed for content creators, streamers, and anyone who wants instant access to sound effects.

![Harmonia Preview](https://via.placeholder.com/800x400/0a0a0f/8b5cf6?text=Harmonia+Soundboard)

## ✨ Features

### 🎛️ Professional Soundboard
- **Sound Pads** - Beautiful, customizable cards for each sound
- **Multiple Boards** - Create collections of sounds for different scenarios
- **Custom Appearance** - Choose emojis, colors, and themes for each sound
- **Waveform Visualization** - Animated audio waveform display
- **Volume Control** - Individual volume, pitch, and speed per sound

### ⌨️ Global Keybinds
- Works **even when app is minimized** or in background
- Custom keyboard shortcuts for each sound
- Conflict detection for duplicate keybinds
- Master enable/disable toggle

### 🖥️ Desktop Integration
- **System Tray** - Minimize to tray, quick controls
- **Auto-Launch** - Start with your computer
- **Native File Dialogs** - Real OS file picker
- **Persistent Storage** - Data saved to disk, survives restarts

### 📦 Data Management
- Export/Import individual boards
- Full backup and restore
- Audio files stored efficiently on disk

## 🚀 Quick Start

### Option 1: Download Release (Recommended)
1. Go to [Releases](https://github.com/harmonia/harmonia/releases)
2. Download the latest `Harmonia-setup.exe` (Windows) or `.dmg` (macOS)
3. Run the installer
4. Launch Harmonia from your Start Menu / Applications

### Option 2: Build from Source

#### Prerequisites
- [Bun](https://bun.sh) - Fast JavaScript runtime
- [Node.js](https://nodejs.org) - For electron-builder

#### Build Commands

**Windows (PowerShell):**
```powershell
# Clone the repository
git clone https://github.com/harmonia/harmonia.git
cd harmonia

# Run the build script
.\build-windows.ps1
```

**Or manually:**
```powershell
# Install dependencies
bun install

# Compile Electron
bun run electron:compile

# Build Next.js
bun run build

# Copy output
Copy-Item -Recurse -Force out electron\out

# Build Windows installer
npx electron-builder --win
```

**macOS/Linux:**
```bash
# Install dependencies
bun install

# Compile and build
bun run electron:compile
bun run build
cp -r out electron/out

# Build for your platform
npx electron-builder --mac   # macOS
npx electron-builder --linux # Linux
```

## 📁 Project Structure

```
harmonia/
├── electron/
│   ├── main.ts       # Electron main process
│   ├── preload.ts    # IPC bridge
│   └── main.js       # Compiled main process
├── src/
│   ├── app/          # Next.js pages
│   ├── components/   # React components
│   │   ├── harmonia/ # Harmonia-specific components
│   │   └── ui/       # shadcn/ui components
│   ├── lib/          # Utilities and audio engine
│   ├── store/        # Zustand state management
│   └── types/        # TypeScript types
├── public/           # Static assets
├── build/            # Electron-builder resources
└── release/          # Built installers (generated)
```

## 🎮 Usage

### Adding Sounds
1. Click the **+** button or drag audio files onto the soundboard
2. Choose a name, emoji, color, and keybind
3. Click **Add Sound**

### Playing Sounds
- Click a sound pad, or
- Press the assigned keyboard shortcut

### Managing Boards
- Create multiple boards for different scenarios
- Drag tabs to reorder
- Right-click for options (rename, export, delete)

### System Tray
- **Double-click** tray icon to restore window
- **Right-click** for quick menu

## 🔧 Configuration

Settings are stored in:
- **Windows:** `%APPDATA%\harmonia\harmonia-data.json`
- **macOS:** `~/Library/Application Support/harmonia/harmonia-data.json`
- **Linux:** `~/.config/harmonia/harmonia-data.json`

Audio files are stored in a separate `audio/` subfolder.

## 📤 Publishing to GitHub

### 1. Create a GitHub Repository
```bash
# Initialize git if not already
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/harmonia.git

# Push
git push -u origin main
```

### 2. Create a Release

```bash
# Build the app
bun run electron:build:win   # Windows
bun run electron:build:mac   # macOS
bun run electron:build:linux # Linux

# Or build all platforms
bun run electron:build:all
```

### 3. Upload to GitHub
1. Go to your repo → **Releases** → **Draft a new release**
2. Tag version (e.g., `v1.0.0`)
3. Upload `.exe`, `.dmg`, `.AppImage` files from `release/` folder
4. Publish!

## 🛠️ Development

```bash
# Start development server
bun run electron:dev

# Lint code
bun run lint

# Build for production
bun run build
```

## 📄 License

MIT License - feel free to use, modify, and distribute!

## 🙏 Credits

- Built with [Electron](https://electronjs.org), [Next.js](https://nextjs.org), and [shadcn/ui](https://ui.shadcn.com)
- Icons by [Lucide](https://lucide.dev)
- Animations by [Framer Motion](https://framer.com/motion)

---

Made with ❤️ by the Harmonia Team
