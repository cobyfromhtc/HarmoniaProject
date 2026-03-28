'use client';

import { motion } from 'framer-motion';
import { Minus, Square, X, Maximize2 } from 'lucide-react';
import { Music } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useHarmoniaStore } from '@/store';

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI;

export function CustomTitlebar() {
  const isMaximized = useHarmoniaStore((s) => s.isMaximized);
  const setMaximized = useHarmoniaStore((s) => s.setMaximized);

  useEffect(() => {
    if (isElectron) {
      // Listen for maximize state changes
      window.electronAPI.onMaximizedChange((maximized) => {
        setMaximized(maximized);
      });
    }
  }, [setMaximized]);

  const handleMinimize = useCallback(() => {
    if (isElectron) {
      window.electronAPI.minimizeWindow();
    }
  }, []);

  const handleMaximize = useCallback(async () => {
    if (isElectron) {
      window.electronAPI.maximizeWindow();
    }
  }, []);

  const handleClose = useCallback(() => {
    if (isElectron) {
      window.electronAPI.closeWindow();
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-12 bg-black/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left: Logo and App Name */}
      <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <Music className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-semibold text-white/90">Harmonia</span>
        <span className="text-[10px] text-white/30 mt-0.5">v1.0.0</span>
      </div>

      {/* Center: Drag area (empty, for dragging window) */}
      <div className="flex-1 h-full" />

      {/* Right: Window controls */}
      <div 
        className="flex items-center gap-1" 
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <motion.button
          onClick={handleMinimize}
          className="w-10 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Minus className="w-4 h-4" />
        </motion.button>
        <motion.button
          onClick={handleMaximize}
          className="w-10 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMaximized ? (
            <Square className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </motion.button>
        <motion.button
          onClick={handleClose}
          className="w-10 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-red-500/80 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
