'use client';

import { create } from 'zustand';
import type { Sound, Board, Settings, Page } from '@/types';

// Check if we're running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI;

interface HarmoniaState {
  // Initialization
  isInitialized: boolean;
  setInitialized: (initialized: boolean) => void;

  // Navigation
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Boards
  boards: Board[];
  currentBoardId: string | null;
  setBoards: (boards: Board[]) => void;
  setCurrentBoardId: (id: string | null) => void;
  addBoard: (board: Board) => void;
  updateBoard: (id: string, updates: Partial<Board>) => void;
  deleteBoard: (id: string) => void;

  // Sounds
  sounds: Sound[];
  setSounds: (sounds: Sound[]) => void;
  addSound: (sound: Sound) => void;
  updateSound: (id: string, updates: Partial<Sound>) => void;
  deleteSound: (id: string) => void;

  // Settings
  settings: Settings;
  setSettings: (settings: Settings) => void;

  // Audio State
  playingSounds: Set<string>;
  addPlayingSound: (id: string) => void;
  removePlayingSound: (id: string) => void;

  // Keybind recording
  recordingKeybind: string | null;
  setRecordingKeybind: (id: string | null) => void;

  // Modal state
  addSoundModalOpen: boolean;
  setAddSoundModalOpen: (open: boolean) => void;
  editingSound: Sound | null;
  setEditingSound: (sound: Sound | null) => void;
  deletingSoundId: string | null;
  setDeletingSoundId: (id: string | null) => void;

  // Window state
  isMaximized: boolean;
  setMaximized: (maximized: boolean) => void;
}

// Default settings
const defaultSettings: Settings = {
  masterVolume: 0.8,
  playbackMode: 'overlap',
  outputDevice: 'default',
  accentColor: '#6366f1',
  theme: 'dark',
  startMinimized: false,
  minimizeToTray: false,
  keybindsEnabled: true,
  storagePath: '',
};

export const useHarmoniaStore = create<HarmoniaState>()((set, get) => ({
  // Initialization
  isInitialized: false,
  setInitialized: (initialized) => set({ isInitialized: initialized }),

  // Navigation
  currentPage: 'soundboard',
  setCurrentPage: (page) => set({ currentPage: page }),
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  // Boards
  boards: [],
  currentBoardId: null,
  setBoards: (boards) => {
    set({ boards });
    // Save to Electron if available
    if (isElectron) {
      window.electronAPI.saveBoards(boards);
    }
  },
  setCurrentBoardId: (id) => set({ currentBoardId: id }),
  addBoard: (board) => set((state) => {
    const newBoards = [...state.boards, board];
    if (isElectron) {
      window.electronAPI.saveBoards(newBoards);
    }
    return { boards: newBoards };
  }),
  updateBoard: (id, updates) => set((state) => {
    const newBoards = state.boards.map((b) => (b.id === id ? { ...b, ...updates } : b));
    if (isElectron) {
      window.electronAPI.saveBoards(newBoards);
    }
    return { boards: newBoards };
  }),
  deleteBoard: (id) => set((state) => {
    const newBoards = state.boards.filter((b) => b.id !== id);
    if (isElectron) {
      window.electronAPI.saveBoards(newBoards);
    }
    return {
      boards: newBoards,
      currentBoardId: state.currentBoardId === id ? newBoards[0]?.id || null : state.currentBoardId,
    };
  }),

  // Sounds
  sounds: [],
  setSounds: (sounds) => {
    set({ sounds });
    if (isElectron) {
      window.electronAPI.saveSounds(sounds);
    }
  },
  addSound: (sound) => set((state) => {
    const newSounds = [...state.sounds, sound];
    if (isElectron) {
      window.electronAPI.saveSounds(newSounds);
    }
    return { sounds: newSounds };
  }),
  updateSound: (id, updates) => set((state) => {
    const newSounds = state.sounds.map((s) => (s.id === id ? { ...s, ...updates } : s));
    if (isElectron) {
      window.electronAPI.saveSounds(newSounds);
    }
    return { sounds: newSounds };
  }),
  deleteSound: (id) => set((state) => {
    const newSounds = state.sounds.filter((s) => s.id !== id);
    if (isElectron) {
      window.electronAPI.saveSounds(newSounds);
      window.electronAPI.deleteAudioFile(id);
    }
    return { sounds: newSounds };
  }),

  // Settings
  settings: defaultSettings,
  setSettings: (settings) => {
    set({ settings });
    if (isElectron) {
      window.electronAPI.saveSettings(settings);
    }
  },

  // Audio State
  playingSounds: new Set(),
  addPlayingSound: (id) => set((state) => ({
    playingSounds: new Set(state.playingSounds).add(id),
  })),
  removePlayingSound: (id) => set((state) => {
    const newSet = new Set(state.playingSounds);
    newSet.delete(id);
    return { playingSounds: newSet };
  }),

  // Keybind recording
  recordingKeybind: null,
  setRecordingKeybind: (id) => set({ recordingKeybind: id }),

  // Modal state
  addSoundModalOpen: false,
  setAddSoundModalOpen: (open) => set({ addSoundModalOpen: open }),
  editingSound: null,
  setEditingSound: (sound) => set({ editingSound: sound }),
  deletingSoundId: null,
  setDeletingSoundId: (id) => set({ deletingSoundId: id }),

  // Window state
  isMaximized: false,
  setMaximized: (maximized) => set({ isMaximized: maximized }),
}));
