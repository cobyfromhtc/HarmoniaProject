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
  createdAt: Date;
  updatedAt: Date;
}

export interface Board {
  id: string;
  name: string;
  order: number;
  sounds: Sound[];
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

export interface AudioState {
  isPlaying: boolean;
  currentSoundId: string | null;
  currentTime: number;
}

export type Page = 'soundboard' | 'keybinds' | 'settings';
