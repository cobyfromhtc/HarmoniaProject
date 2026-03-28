import {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  nativeImage,
  globalShortcut,
  dialog,
  shell,
  Notification,
} from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// Types
interface Sound {
  id: string;
  name: string;
  emoji: string;
  color: string;
  keybind: string | null;
  volume: number;
  pitch: number;
  speed: number;
  duration: number;
  waveform: string | null;
  tags: string[];
  order: number;
  boardId: string;
  audioData: string | null;
  audioPath?: string;
  createdAt: string;
  updatedAt: string;
}

interface Board {
  id: string;
  name: string;
  order: number;
  sounds: Sound[];
  createdAt: string;
  updatedAt: string;
}

interface Settings {
  masterVolume: number;
  playbackMode: 'overlap' | 'exclusive';
  outputDevice: string;
  accentColor: string;
  theme: 'light' | 'dark' | 'system';
  startMinimized: boolean;
  minimizeToTray: boolean;
  keybindsEnabled: boolean;
  storagePath: string;
}

interface AppData {
  boards: Board[];
  sounds: Sound[];
  settings: Settings;
}

// Global state
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

// Paths
const userDataPath = app.getPath('userData');
const dataFilePath = path.join(userDataPath, 'harmonia-data.json');
const audioDirPath = path.join(userDataPath, 'audio');

// Ensure directories exist
function ensureDirectories() {
  if (!fs.existsSync(audioDirPath)) {
    fs.mkdirSync(audioDirPath, { recursive: true });
  }
}

// Default settings
const defaultSettings: Settings = {
  masterVolume: 0.8,
  playbackMode: 'overlap',
  outputDevice: 'default',
  accentColor: '#6366f1',
  theme: 'dark',
  startMinimized: false,
  minimizeToTray: true,
  keybindsEnabled: true,
  storagePath: audioDirPath,
};

// Default app data
const defaultAppData: AppData = {
  boards: [],
  sounds: [],
  settings: defaultSettings,
};

// Load app data from disk
function loadAppData(): AppData {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
      return { ...defaultAppData, ...data };
    }
  } catch (error) {
    console.error('Error loading app data:', error);
  }
  return defaultAppData;
}

// Save app data to disk
function saveAppData(data: AppData): void {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving app data:', error);
  }
}

// Load data on startup
let appData = loadAppData();

// Create the main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    transparent: false,
    backgroundColor: '#0a0a0f',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: !appData.settings.startMinimized,
    autoHideMenuBar: true,
  });

  // Load the app
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('close', (event) => {
    if (!isQuitting && appData.settings.minimizeToTray) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create system tray
function createTray() {
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGkSURBVFiF7ZYxTsNAEEXfOElPQUNPh6goKLgCHAHuwRFyBS5BRU1PQ8UNEqShQyn4f5zFdWhpGBLNk+7CnZ24iR+vGP7LM58LpJ+EC8AD8Bx4AB6AZ6I8sAFPwCnwAnwDz0R54ALoA7gCvoUVYBfYAFaBI+AJWAJe6AJj4JUOYLiBPuLrVwCjBlA2wY4EaID2CJWJgHVgmACmJxXewr2cVrDRBeAV6CLXjwBkB5C+w0QFoErqxrDKOACcIKuGAO5CsAtMAXmLRMAJgCLwJVPwHMJYBJ0RgaAOfBdBz6EdrAfIwTgedwqBXIVwFYEKUB7OgBU5JR4FCSgAVPWoYFz1xpgJAFjJJgBxgxAGoBN4JoApu0NYGsBLDTJlSD2BlAFNqkApvkVwEoErpkATYHbBjABJgUw/cINsFfDmFmgMRzVAEYGYEoEYFjVAGaAaQKYuDMAJgUw/aINsN0A5qkC0w1g0q5X4J8k9QCsHsA0nRqoaxNMF4BmA/jkVQCmg6kCzKd2CrCcgeYKYKoA0wmgrgjT+RrAdAHEwjVkGpgugM30hEu9D/CvOj6AZgEwDaZuBeYKYLIExgKYLsC0DcwEwKQ/ATWTd8ECsB1h/T+YF1PyDTHYCwAAAABJRU5ErkJggg=='
  );

  tray = new Tray(icon);
  updateTrayMenu();

  tray.setToolTip('Harmonia Soundboard');
  tray.on('double-click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

// Update tray menu
function updateTrayMenu() {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '🎵 Open Harmonia',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: 'separator' },
    {
      label: appData.settings.keybindsEnabled ? '⏸️ Disable Keybinds' : '▶️ Enable Keybinds',
      click: () => {
        appData.settings.keybindsEnabled = !appData.settings.keybindsEnabled;
        saveAppData(appData);
        updateTrayMenu();
        registerKeybinds();
        mainWindow?.webContents.send('settings-updated', appData.settings);
      },
    },
    { type: 'separator' },
    {
      label: '❌ Quit Harmonia',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

// Register global keybinds
function registerKeybinds() {
  globalShortcut.unregisterAll();

  if (!appData.settings.keybindsEnabled) return;

  for (const sound of appData.sounds) {
    if (sound.keybind) {
      try {
        globalShortcut.register(sound.keybind, () => {
          mainWindow?.webContents.send('play-sound', sound.id);
        });
      } catch (error) {
        console.error(`Failed to register keybind ${sound.keybind}:`, error);
      }
    }
  }
}

// App lifecycle
app.whenReady().then(() => {
  ensureDirectories();
  createWindow();
  createTray();

  setTimeout(() => {
    registerKeybinds();
  }, 1000);

  // Handle protocol for deep linking (optional)
  app.setAsDefaultProtocolClient('harmonia');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else if (mainWindow) {
    mainWindow.show();
  }
});

// IPC Handlers
ipcMain.on('window-minimize', () => mainWindow?.minimize());

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window-close', () => {
  if (appData.settings.minimizeToTray) {
    mainWindow?.hide();
  } else {
    mainWindow?.close();
  }
});

ipcMain.handle('get-app-data', () => appData);

ipcMain.handle('save-app-data', (_, data: AppData) => {
  appData = data;
  saveAppData(appData);
  return true;
});

ipcMain.handle('get-boards', () => appData.boards);

ipcMain.handle('save-boards', (_, boards: Board[]) => {
  appData.boards = boards;
  saveAppData(appData);
  return true;
});

ipcMain.handle('get-sounds', () => appData.sounds);

ipcMain.handle('save-sounds', (_, sounds: Sound[]) => {
  appData.sounds = sounds;
  saveAppData(appData);
  registerKeybinds();
  return true;
});

ipcMain.handle('get-settings', () => appData.settings);

ipcMain.handle('save-settings', (_, settings: Settings) => {
  appData.settings = settings;
  saveAppData(appData);
  updateTrayMenu();
  registerKeybinds();
  return true;
});

ipcMain.handle('save-audio-file', async (_, audioData: string, soundId: string) => {
  try {
    const audioBuffer = Buffer.from(audioData.split(',')[1], 'base64');
    const audioPath = path.join(audioDirPath, `${soundId}.webm`);
    fs.writeFileSync(audioPath, audioBuffer);
    return audioPath;
  } catch (error) {
    console.error('Error saving audio file:', error);
    return null;
  }
});

ipcMain.handle('load-audio-file', async (_, soundId: string) => {
  try {
    const audioPath = path.join(audioDirPath, `${soundId}.webm`);
    if (fs.existsSync(audioPath)) {
      const audioBuffer = fs.readFileSync(audioPath);
      return `data:audio/webm;base64,${audioBuffer.toString('base64')}`;
    }
    return null;
  } catch (error) {
    console.error('Error loading audio file:', error);
    return null;
  }
});

ipcMain.handle('delete-audio-file', async (_, soundId: string) => {
  try {
    const audioPath = path.join(audioDirPath, `${soundId}.webm`);
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
    return true;
  } catch (error) {
    console.error('Error deleting audio file:', error);
    return false;
  }
});

ipcMain.handle('select-audio-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'webm'] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const filePath = result.filePaths[0];
  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1);
  
  return {
    name: path.basename(filePath),
    data: `data:audio/${ext};base64,${fileBuffer.toString('base64')}`,
  };
});

ipcMain.handle('export-board', async (_, board: Board, sounds: Sound[]) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: `${board.name}.harmonia.json`,
    filters: [{ name: 'Harmonia Board', extensions: ['harmonia.json'] }],
  });

  if (result.canceled || !result.filePath) return false;

  try {
    fs.writeFileSync(result.filePath, JSON.stringify({ board, sounds, exportedAt: new Date().toISOString() }, null, 2));
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('import-board', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [{ name: 'Harmonia Board', extensions: ['harmonia.json', 'json'] }],
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  try {
    return JSON.parse(fs.readFileSync(result.filePaths[0], 'utf-8'));
  } catch {
    return null;
  }
});

ipcMain.handle('export-all-data', async () => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: `harmonia-backup-${new Date().toISOString().slice(0, 10)}.json`,
    filters: [{ name: 'Harmonia Backup', extensions: ['json'] }],
  });

  if (result.canceled || !result.filePath) return false;

  try {
    fs.writeFileSync(result.filePath, JSON.stringify(appData, null, 2));
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('import-all-data', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [{ name: 'Harmonia Backup', extensions: ['json'] }],
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  try {
    const data = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf-8'));
    appData = { ...defaultAppData, ...data };
    saveAppData(appData);
    registerKeybinds();
    return appData;
  } catch {
    return null;
  }
});

ipcMain.handle('set-auto-launch', (_, enabled: boolean) => {
  app.setLoginItemSettings({ openAtLogin: enabled, openAsHidden: appData.settings.startMinimized });
  return true;
});

ipcMain.handle('get-auto-launch', () => app.getLoginItemSettings().openAtLogin);

ipcMain.handle('open-external', (_, url: string) => {
  shell.openExternal(url);
  return true;
});
