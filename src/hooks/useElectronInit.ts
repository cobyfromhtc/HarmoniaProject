'use client';

import { useEffect, useCallback } from 'react';
import { useHarmoniaStore } from '@/store';
import { toast } from 'sonner';

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI;

export function useElectronInit() {
  const isInitialized = useHarmoniaStore((s) => s.isInitialized);
  const setInitialized = useHarmoniaStore((s) => s.setInitialized);
  const setBoards = useHarmoniaStore((s) => s.setBoards);
  const setSounds = useHarmoniaStore((s) => s.setSounds);
  const setSettings = useHarmoniaStore((s) => s.setSettings);
  const setCurrentBoardId = useHarmoniaStore((s) => s.setCurrentBoardId);
  const boards = useHarmoniaStore((s) => s.boards);
  const sounds = useHarmoniaStore((s) => s.sounds);
  const playSound = useHarmoniaStore((s) => s.addPlayingSound);
  const stopSound = useHarmoniaStore((s) => s.removePlayingSound);

  // Initialize data from Electron
  useEffect(() => {
    if (isElectron && !isInitialized) {
      const loadData = async () => {
        try {
          // Load settings
          const settings = await window.electronAPI.getSettings();
          if (settings) {
            setSettings(settings);
          }

          // Load boards
          const boards = await window.electronAPI.getBoards();
          if (boards && boards.length > 0) {
            setBoards(boards);
          }

          // Load sounds
          const sounds = await window.electronAPI.getSounds();
          if (sounds && sounds.length > 0) {
            setSounds(sounds);
          }

          setInitialized(true);
        } catch (error) {
          console.error('Error loading data from Electron:', error);
          setInitialized(true);
        }
      };

      loadData();
    } else if (!isElectron && !isInitialized) {
      // Not in Electron, mark as initialized
      setInitialized(true);
    }
  }, [isInitialized, setBoards, setSounds, setSettings, setInitialized]);

  // Listen for play-sound events from global keybinds
  useEffect(() => {
    if (isElectron) {
      window.electronAPI.onPlaySound((soundId: string) => {
        // Trigger sound playback
        const sound = sounds.find(s => s.id === soundId);
        if (sound) {
          // Dispatch custom event for audio engine to handle
          window.dispatchEvent(new CustomEvent('trigger-sound', { detail: soundId }));
        }
      });
    }
  }, [sounds]);

  // Listen for settings updates from tray
  useEffect(() => {
    if (isElectron) {
      window.electronAPI.onSettingsUpdated((settings: Parameters<typeof setSettings>[0]) => {
        setSettings(settings);
        toast.info('Settings updated');
      });
    }
  }, [setSettings]);

  // Export all data
  const exportAllData = useCallback(async () => {
    if (isElectron) {
      const success = await window.electronAPI.exportAllData();
      if (success) {
        toast.success('Data exported successfully');
      } else {
        toast.error('Export cancelled or failed');
      }
      return success;
    }
    return false;
  }, []);

  // Import all data
  const importAllData = useCallback(async () => {
    if (isElectron) {
      const data = await window.electronAPI.importAllData();
      if (data) {
        setBoards(data.boards || []);
        setSounds(data.sounds || []);
        setSettings(data.settings || {});
        toast.success('Data imported successfully');
        return true;
      } else {
        toast.error('Import cancelled or failed');
      }
      return false;
    }
    return false;
  }, [setBoards, setSounds, setSettings]);

  // Set auto-launch
  const setAutoLaunch = useCallback(async (enabled: boolean) => {
    if (isElectron) {
      await window.electronAPI.setAutoLaunch(enabled);
      toast.success(enabled ? 'Auto-launch enabled' : 'Auto-launch disabled');
    }
  }, []);

  return {
    isElectron,
    isInitialized,
    exportAllData,
    importAllData,
    setAutoLaunch,
  };
}
