import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  onMaximizedChange: (callback: (isMaximized: boolean) => void) => {
    ipcRenderer.on('window-is-maximized-reply', (_, isMaximized) => callback(isMaximized));
  },

  // Data management
  getAppData: () => ipcRenderer.invoke('get-app-data'),
  saveAppData: (data: unknown) => ipcRenderer.invoke('save-app-data', data),
  
  getBoards: () => ipcRenderer.invoke('get-boards'),
  saveBoards: (boards: unknown) => ipcRenderer.invoke('save-boards', boards),
  
  getSounds: () => ipcRenderer.invoke('get-sounds'),
  saveSounds: (sounds: unknown) => ipcRenderer.invoke('save-sounds', sounds),
  
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: unknown) => ipcRenderer.invoke('save-settings', settings),
  
  onSettingsUpdated: (callback: (settings: unknown) => void) => {
    ipcRenderer.on('settings-updated', (_, settings) => callback(settings));
  },
  
  onPlaySound: (callback: (soundId: string) => void) => {
    ipcRenderer.on('play-sound', (_, soundId) => callback(soundId));
  },

  // Audio file management
  saveAudioFile: (audioData: string, soundId: string) => 
    ipcRenderer.invoke('save-audio-file', audioData, soundId),
  loadAudioFile: (soundId: string) => 
    ipcRenderer.invoke('load-audio-file', soundId),
  deleteAudioFile: (soundId: string) => 
    ipcRenderer.invoke('delete-audio-file', soundId),

  // File dialogs
  selectAudioFile: () => ipcRenderer.invoke('select-audio-file'),
  exportBoard: (board: unknown, sounds: unknown) => 
    ipcRenderer.invoke('export-board', board, sounds),
  importBoard: () => ipcRenderer.invoke('import-board'),
  exportAllData: () => ipcRenderer.invoke('export-all-data'),
  importAllData: () => ipcRenderer.invoke('import-all-data'),

  // Auto-launch
  setAutoLaunch: (enabled: boolean) => ipcRenderer.invoke('set-auto-launch', enabled),
  getAutoLaunch: () => ipcRenderer.invoke('get-auto-launch'),

  // Shell
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
});

// Type definition for the exposed API
export interface ElectronAPI {
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  isMaximized: () => Promise<boolean>;
  onMaximizedChange: (callback: (isMaximized: boolean) => void) => void;
  
  getAppData: () => Promise<unknown>;
  saveAppData: (data: unknown) => Promise<boolean>;
  
  getBoards: () => Promise<unknown[]>;
  saveBoards: (boards: unknown[]) => Promise<boolean>;
  
  getSounds: () => Promise<unknown[]>;
  saveSounds: (sounds: unknown[]) => Promise<boolean>;
  
  getSettings: () => Promise<unknown>;
  saveSettings: (settings: unknown) => Promise<boolean>;
  
  onSettingsUpdated: (callback: (settings: unknown) => void) => void;
  onPlaySound: (callback: (soundId: string) => void) => void;
  
  saveAudioFile: (audioData: string, soundId: string) => Promise<string | null>;
  loadAudioFile: (soundId: string) => Promise<string | null>;
  deleteAudioFile: (soundId: string) => Promise<boolean>;
  
  selectAudioFile: () => Promise<{ name: string; data: string } | null>;
  exportBoard: (board: unknown, sounds: unknown[]) => Promise<boolean>;
  importBoard: () => Promise<unknown>;
  exportAllData: () => Promise<boolean>;
  importAllData: () => Promise<unknown>;
  
  setAutoLaunch: (enabled: boolean) => Promise<boolean>;
  getAutoLaunch: () => Promise<boolean>;
  
  openExternal: (url: string) => Promise<boolean>;
}
