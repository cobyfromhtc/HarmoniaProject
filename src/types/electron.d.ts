// Type definitions for Electron API

export interface ElectronAPI {
  // Window controls
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  isMaximized: () => Promise<boolean>;
  onMaximizedChange: (callback: (isMaximized: boolean) => void) => void;
  
  // Data management
  getAppData: () => Promise<AppData>;
  saveAppData: (data: AppData) => Promise<boolean>;
  
  getBoards: () => Promise<Board[]>;
  saveBoards: (boards: Board[]) => Promise<boolean>;
  
  getSounds: () => Promise<Sound[]>;
  saveSounds: (sounds: Sound[]) => Promise<boolean>;
  
  getSettings: () => Promise<Settings>;
  saveSettings: (settings: Settings) => Promise<boolean>;
  
  onSettingsUpdated: (callback: (settings: Settings) => void) => void;
  onPlaySound: (callback: (soundId: string) => void) => void;
  
  // Audio file management
  saveAudioFile: (audioData: string, soundId: string) => Promise<string | null>;
  loadAudioFile: (soundId: string) => Promise<string | null>;
  deleteAudioFile: (soundId: string) => Promise<boolean>;
  
  // File dialogs
  selectAudioFile: () => Promise<{ name: string; data: string } | null>;
  exportBoard: (board: Board, sounds: Sound[]) => Promise<boolean>;
  importBoard: () => Promise<{ board: Board; sounds: Sound[] } | null>;
  exportAllData: () => Promise<boolean>;
  importAllData: () => Promise<AppData | null>;
  
  // Auto-launch
  setAutoLaunch: (enabled: boolean) => Promise<boolean>;
  getAutoLaunch: () => Promise<boolean>;
  
  // Shell
  openExternal: (url: string) => Promise<boolean>;
}

export interface AppData {
  boards: Board[];
  sounds: Sound[];
  settings: Settings;
}

export interface Board {
  id: string;
  name: string;
  order: number;
  sounds: Sound[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Sound {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
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

// Extend Window interface
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
