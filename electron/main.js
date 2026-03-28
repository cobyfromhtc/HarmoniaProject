import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// node_modules/electron/index.js
var require_electron = __commonJS((exports, module) => {
  var __dirname = "C:\\Users\\User\\Downloads\\Harmonia-v1.0.0-SourceV2\\node_modules\\electron";
  var fs = __require("fs");
  var path = __require("path");
  var pathFile = path.join(__dirname, "path.txt");
  function getElectronPath() {
    let executablePath;
    if (fs.existsSync(pathFile)) {
      executablePath = fs.readFileSync(pathFile, "utf-8");
    }
    if (process.env.ELECTRON_OVERRIDE_DIST_PATH) {
      return path.join(process.env.ELECTRON_OVERRIDE_DIST_PATH, executablePath || "electron");
    }
    if (executablePath) {
      return path.join(__dirname, "dist", executablePath);
    } else {
      throw new Error("Electron failed to install correctly, please delete node_modules/electron and try installing again");
    }
  }
  module.exports = getElectronPath();
});

// electron/main.ts
var import_electron = __toESM(require_electron(), 1);
import * as path from "path";
import * as fs from "fs";
var __dirname = "C:\\Users\\User\\Downloads\\Harmonia-v1.0.0-SourceV2\\electron";
var mainWindow = null;
var tray = null;
var isQuitting = false;
var userDataPath = import_electron.app.getPath("userData");
var dataFilePath = path.join(userDataPath, "harmonia-data.json");
var audioDirPath = path.join(userDataPath, "audio");
function ensureDirectories() {
  if (!fs.existsSync(audioDirPath)) {
    fs.mkdirSync(audioDirPath, { recursive: true });
  }
}
var defaultSettings = {
  masterVolume: 0.8,
  playbackMode: "overlap",
  outputDevice: "default",
  accentColor: "#6366f1",
  theme: "dark",
  startMinimized: false,
  minimizeToTray: true,
  keybindsEnabled: true,
  storagePath: audioDirPath
};
var defaultAppData = {
  boards: [],
  sounds: [],
  settings: defaultSettings
};
function loadAppData() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = JSON.parse(fs.readFileSync(dataFilePath, "utf-8"));
      return { ...defaultAppData, ...data };
    }
  } catch (error) {
    console.error("Error loading app data:", error);
  }
  return defaultAppData;
}
function saveAppData(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving app data:", error);
  }
}
var appData = loadAppData();
function createWindow() {
  mainWindow = new import_electron.BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    transparent: false,
    backgroundColor: "#0a0a0f",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    },
    show: !appData.settings.startMinimized,
    autoHideMenuBar: true
  });
  if (import_electron.app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, "../out/index.html"));
  } else {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  }
  mainWindow.on("close", (event) => {
    if (!isQuitting && appData.settings.minimizeToTray) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
function createTray() {
  const icon = import_electron.nativeImage.createFromDataURL("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGkSURBVFiF7ZYxTsNAEEXfOElPQUNPh6goKLgCHAHuwRFyBS5BRU1PQ8UNEqShQyn4f5zFdWhpGBLNk+7CnZ24iR+vGP7LM58LpJ+EC8AD8Bx4AB6AZ6I8sAFPwCnwAnwDz0R54ALoA7gCvoUVYBfYAFaBI+AJWAJe6AJj4JUOYLiBPuLrVwCjBlA2wY4EaID2CJWJgHVgmACmJxXewr2cVrDRBeAV6CLXjwBkB5C+w0QFoErqxrDKOACcIKuGAO5CsAtMAXmLRMAJgCLwJVPwHMJYBJ0RgaAOfBdBz6EdrAfIwTgedwqBXIVwFYEKUB7OgBU5JR4FCSgAVPWoYFz1xpgJAFjJJgBxgxAGoBN4JoApu0NYGsBLDTJlSD2BlAFNqkApvkVwEoErpkATYHbBjABJgUw/cINsFfDmFmgMRzVAEYGYEoEYFjVAGaAaQKYuDMAJgUw/aINsN0A5qkC0w1g0q5X4J8k9QCsHsA0nRqoaxNMF4BmA/jkVQCmg6kCzKd2CrCcgeYKYKoA0wmgrgjT+RrAdAHEwjVkGpgugM30hEu9D/CvOj6AZgEwDaZuBeYKYLIExgKYLsC0DcwEwKQ/ATWTd8ECsB1h/T+YF1PyDTHYCwAAAABJRU5ErkJggg==");
  tray = new import_electron.Tray(icon);
  updateTrayMenu();
  tray.setToolTip("Harmonia Soundboard");
  tray.on("double-click", () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}
function updateTrayMenu() {
  if (!tray)
    return;
  const contextMenu = import_electron.Menu.buildFromTemplate([
    {
      label: "\uD83C\uDFB5 Open Harmonia",
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      }
    },
    { type: "separator" },
    {
      label: appData.settings.keybindsEnabled ? "⏸️ Disable Keybinds" : "▶️ Enable Keybinds",
      click: () => {
        appData.settings.keybindsEnabled = !appData.settings.keybindsEnabled;
        saveAppData(appData);
        updateTrayMenu();
        registerKeybinds();
        mainWindow?.webContents.send("settings-updated", appData.settings);
      }
    },
    { type: "separator" },
    {
      label: "❌ Quit Harmonia",
      click: () => {
        isQuitting = true;
        import_electron.app.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
}
function registerKeybinds() {
  import_electron.globalShortcut.unregisterAll();
  if (!appData.settings.keybindsEnabled)
    return;
  for (const sound of appData.sounds) {
    if (sound.keybind) {
      try {
        import_electron.globalShortcut.register(sound.keybind, () => {
          mainWindow?.webContents.send("play-sound", sound.id);
        });
      } catch (error) {
        console.error(`Failed to register keybind ${sound.keybind}:`, error);
      }
    }
  }
}
import_electron.app.whenReady().then(() => {
  ensureDirectories();
  createWindow();
  createTray();
  setTimeout(() => {
    registerKeybinds();
  }, 1000);
  import_electron.app.setAsDefaultProtocolClient("harmonia");
});
import_electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    import_electron.app.quit();
  }
});
import_electron.app.on("before-quit", () => {
  isQuitting = true;
  import_electron.globalShortcut.unregisterAll();
});
import_electron.app.on("activate", () => {
  if (import_electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else if (mainWindow) {
    mainWindow.show();
  }
});
import_electron.ipcMain.on("window-minimize", () => mainWindow?.minimize());
import_electron.ipcMain.on("window-maximize", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
import_electron.ipcMain.on("window-close", () => {
  if (appData.settings.minimizeToTray) {
    mainWindow?.hide();
  } else {
    mainWindow?.close();
  }
});
import_electron.ipcMain.handle("get-app-data", () => appData);
import_electron.ipcMain.handle("save-app-data", (_, data) => {
  appData = data;
  saveAppData(appData);
  return true;
});
import_electron.ipcMain.handle("get-boards", () => appData.boards);
import_electron.ipcMain.handle("save-boards", (_, boards) => {
  appData.boards = boards;
  saveAppData(appData);
  return true;
});
import_electron.ipcMain.handle("get-sounds", () => appData.sounds);
import_electron.ipcMain.handle("save-sounds", (_, sounds) => {
  appData.sounds = sounds;
  saveAppData(appData);
  registerKeybinds();
  return true;
});
import_electron.ipcMain.handle("get-settings", () => appData.settings);
import_electron.ipcMain.handle("save-settings", (_, settings) => {
  appData.settings = settings;
  saveAppData(appData);
  updateTrayMenu();
  registerKeybinds();
  return true;
});
import_electron.ipcMain.handle("save-audio-file", async (_, audioData, soundId) => {
  try {
    const audioBuffer = Buffer.from(audioData.split(",")[1], "base64");
    const audioPath = path.join(audioDirPath, `${soundId}.webm`);
    fs.writeFileSync(audioPath, audioBuffer);
    return audioPath;
  } catch (error) {
    console.error("Error saving audio file:", error);
    return null;
  }
});
import_electron.ipcMain.handle("load-audio-file", async (_, soundId) => {
  try {
    const audioPath = path.join(audioDirPath, `${soundId}.webm`);
    if (fs.existsSync(audioPath)) {
      const audioBuffer = fs.readFileSync(audioPath);
      return `data:audio/webm;base64,${audioBuffer.toString("base64")}`;
    }
    return null;
  } catch (error) {
    console.error("Error loading audio file:", error);
    return null;
  }
});
import_electron.ipcMain.handle("delete-audio-file", async (_, soundId) => {
  try {
    const audioPath = path.join(audioDirPath, `${soundId}.webm`);
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
    return true;
  } catch (error) {
    console.error("Error deleting audio file:", error);
    return false;
  }
});
import_electron.ipcMain.handle("select-audio-file", async () => {
  const result = await import_electron.dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      { name: "Audio Files", extensions: ["mp3", "wav", "ogg", "flac", "m4a", "webm"] }
    ]
  });
  if (result.canceled || result.filePaths.length === 0)
    return null;
  const filePath = result.filePaths[0];
  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1);
  return {
    name: path.basename(filePath),
    data: `data:audio/${ext};base64,${fileBuffer.toString("base64")}`
  };
});
import_electron.ipcMain.handle("export-board", async (_, board, sounds) => {
  const result = await import_electron.dialog.showSaveDialog(mainWindow, {
    defaultPath: `${board.name}.harmonia.json`,
    filters: [{ name: "Harmonia Board", extensions: ["harmonia.json"] }]
  });
  if (result.canceled || !result.filePath)
    return false;
  try {
    fs.writeFileSync(result.filePath, JSON.stringify({ board, sounds, exportedAt: new Date().toISOString() }, null, 2));
    return true;
  } catch {
    return false;
  }
});
import_electron.ipcMain.handle("import-board", async () => {
  const result = await import_electron.dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [{ name: "Harmonia Board", extensions: ["harmonia.json", "json"] }]
  });
  if (result.canceled || result.filePaths.length === 0)
    return null;
  try {
    return JSON.parse(fs.readFileSync(result.filePaths[0], "utf-8"));
  } catch {
    return null;
  }
});
import_electron.ipcMain.handle("export-all-data", async () => {
  const result = await import_electron.dialog.showSaveDialog(mainWindow, {
    defaultPath: `harmonia-backup-${new Date().toISOString().slice(0, 10)}.json`,
    filters: [{ name: "Harmonia Backup", extensions: ["json"] }]
  });
  if (result.canceled || !result.filePath)
    return false;
  try {
    fs.writeFileSync(result.filePath, JSON.stringify(appData, null, 2));
    return true;
  } catch {
    return false;
  }
});
import_electron.ipcMain.handle("import-all-data", async () => {
  const result = await import_electron.dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [{ name: "Harmonia Backup", extensions: ["json"] }]
  });
  if (result.canceled || result.filePaths.length === 0)
    return null;
  try {
    const data = JSON.parse(fs.readFileSync(result.filePaths[0], "utf-8"));
    appData = { ...defaultAppData, ...data };
    saveAppData(appData);
    registerKeybinds();
    return appData;
  } catch {
    return null;
  }
});
import_electron.ipcMain.handle("set-auto-launch", (_, enabled) => {
  import_electron.app.setLoginItemSettings({ openAtLogin: enabled, openAsHidden: appData.settings.startMinimized });
  return true;
});
import_electron.ipcMain.handle("get-auto-launch", () => import_electron.app.getLoginItemSettings().openAtLogin);
import_electron.ipcMain.handle("open-external", (_, url) => {
  import_electron.shell.openExternal(url);
  return true;
});
