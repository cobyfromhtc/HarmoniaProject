'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHarmoniaStore } from '@/store';
import { CustomTitlebar } from '@/components/harmonia/CustomTitlebar';
import { Sidebar } from '@/components/harmonia/Sidebar';
import { SoundboardPage } from '@/components/harmonia/SoundboardPage';
import { KeybindsPage } from '@/components/harmonia/KeybindsPage';
import { SettingsPage } from '@/components/harmonia/SettingsPage';
import { FloatingAddButton } from '@/components/harmonia/FloatingAddButton';
import { DeleteSoundDialog } from '@/components/harmonia/DeleteSoundDialog';
import { useAudioEngine } from '@/lib/audio/engine';
import { useElectronInit } from '@/hooks/useElectronInit';
import { Toaster } from '@/components/ui/sonner';

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI;

export default function HarmoniaApp() {
  const currentPage = useHarmoniaStore((s) => s.currentPage);
  const boards = useHarmoniaStore((s) => s.boards);
  const currentBoardId = useHarmoniaStore((s) => s.currentBoardId);
  const setCurrentBoardId = useHarmoniaStore((s) => s.setCurrentBoardId);
  const setBoards = useHarmoniaStore((s) => s.setBoards);
  const settings = useHarmoniaStore((s) => s.settings);
  const isInitialized = useHarmoniaStore((s) => s.isInitialized);
  
  const [localLoaded, setLocalLoaded] = useState(false);
  
  // Initialize from Electron
  const { isInitialized: electronInitialized } = useElectronInit();
  
  // Initialize audio engine
  useAudioEngine();

  // Create default board if none exists (for non-Electron mode or first run)
  useEffect(() => {
    if (!isElectron && !localLoaded) {
      if (boards.length === 0) {
        const defaultBoard = {
          id: crypto.randomUUID(),
          name: 'My Sounds',
          order: 0,
          sounds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setBoards([defaultBoard]);
        setCurrentBoardId(defaultBoard.id);
      } else if (!currentBoardId) {
        setCurrentBoardId(boards[0].id);
      }
      // Defer state update to avoid cascading renders
      const timeout = setTimeout(() => setLocalLoaded(true), 0);
      return () => clearTimeout(timeout);
    }
  }, [boards, currentBoardId, setBoards, setCurrentBoardId, localLoaded]);

  // For Electron mode, ensure we have a default board after data loads
  useEffect(() => {
    if (isElectron && electronInitialized && boards.length === 0) {
      const defaultBoard = {
        id: crypto.randomUUID(),
        name: 'My Sounds',
        order: 0,
        sounds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setBoards([defaultBoard]);
      setCurrentBoardId(defaultBoard.id);
    } else if (isElectron && electronInitialized && !currentBoardId && boards.length > 0) {
      setCurrentBoardId(boards[0].id);
    }
  }, [boards, currentBoardId, setBoards, setCurrentBoardId, electronInitialized]);

  const renderPage = () => {
    switch (currentPage) {
      case 'soundboard':
        return <SoundboardPage />;
      case 'keybinds':
        return <KeybindsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <SoundboardPage />;
    }
  };

  // Show loading state while initializing
  if (!isInitialized && isElectron) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0f]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
            />
          </div>
          <p className="text-white/60">Loading Harmonia...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen flex flex-col overflow-hidden"
      style={{
        backgroundColor: '#0a0a0f',
        backgroundImage: `
          radial-gradient(ellipse at top, ${settings.accentColor}10 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, ${settings.accentColor}05 0%, transparent 50%)
        `,
      }}
    >
      {/* Custom Titlebar */}
      <CustomTitlebar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Add Button */}
      <FloatingAddButton />

      {/* Delete Sound Dialog */}
      <DeleteSoundDialog />

      {/* Toast notifications */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'bg-zinc-900 border border-white/10 text-white',
          duration: 3000,
        }}
      />
    </div>
  );
}
