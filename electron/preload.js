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

// electron/preload.ts
var import_electron = __toESM(require_electron(), 1);
import_electron.contextBridge.exposeInMainWorld("electronAPI", {
  minimizeWindow: () => import_electron.ipcRenderer.send("window-minimize"),
  maximizeWindow: () => import_electron.ipcRenderer.send("window-maximize"),
  closeWindow: () => import_electron.ipcRenderer.send("window-close"),
  isMaximized: () => import_electron.ipcRenderer.invoke("window-is-maximized"),
  onMaximizedChange: (callback) => {
    import_electron.ipcRenderer.on("window-is-maximized-reply", (_, isMaximized) => callback(isMaximized));
  },
  getAppData: () => import_electron.ipcRenderer.invoke("get-app-data"),
  saveAppData: (data) => import_electron.ipcRenderer.invoke("save-app-data", data),
  getBoards: () => import_electron.ipcRenderer.invoke("get-boards"),
  saveBoards: (boards) => import_electron.ipcRenderer.invoke("save-boards", boards),
  getSounds: () => import_electron.ipcRenderer.invoke("get-sounds"),
  saveSounds: (sounds) => import_electron.ipcRenderer.invoke("save-sounds", sounds),
  getSettings: () => import_electron.ipcRenderer.invoke("get-settings"),
  saveSettings: (settings) => import_electron.ipcRenderer.invoke("save-settings", settings),
  onSettingsUpdated: (callback) => {
    import_electron.ipcRenderer.on("settings-updated", (_, settings) => callback(settings));
  },
  onPlaySound: (callback) => {
    import_electron.ipcRenderer.on("play-sound", (_, soundId) => callback(soundId));
  },
  saveAudioFile: (audioData, soundId) => import_electron.ipcRenderer.invoke("save-audio-file", audioData, soundId),
  loadAudioFile: (soundId) => import_electron.ipcRenderer.invoke("load-audio-file", soundId),
  deleteAudioFile: (soundId) => import_electron.ipcRenderer.invoke("delete-audio-file", soundId),
  selectAudioFile: () => import_electron.ipcRenderer.invoke("select-audio-file"),
  exportBoard: (board, sounds) => import_electron.ipcRenderer.invoke("export-board", board, sounds),
  importBoard: () => import_electron.ipcRenderer.invoke("import-board"),
  exportAllData: () => import_electron.ipcRenderer.invoke("export-all-data"),
  importAllData: () => import_electron.ipcRenderer.invoke("import-all-data"),
  setAutoLaunch: (enabled) => import_electron.ipcRenderer.invoke("set-auto-launch", enabled),
  getAutoLaunch: () => import_electron.ipcRenderer.invoke("get-auto-launch"),
  openExternal: (url) => import_electron.ipcRenderer.invoke("open-external", url)
});
