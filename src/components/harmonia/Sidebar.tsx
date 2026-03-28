'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, 
  Keyboard, 
  Settings, 
  ChevronLeft,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHarmoniaStore } from '@/store';
import type { Page } from '@/types';
import { Slider } from '@/components/ui/slider';
import { useState, useRef } from 'react';

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'soundboard', label: 'Soundboard', icon: <Music className="w-5 h-5" /> },
  { id: 'keybinds', label: 'Keybinds', icon: <Keyboard className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export function Sidebar() {
  const currentPage = useHarmoniaStore((s) => s.currentPage);
  const setCurrentPage = useHarmoniaStore((s) => s.setCurrentPage);
  const sidebarCollapsed = useHarmoniaStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useHarmoniaStore((s) => s.setSidebarCollapsed);
  const settings = useHarmoniaStore((s) => s.settings);
  const setSettings = useHarmoniaStore((s) => s.setSettings);
  const [isMuted, setIsMuted] = useState(false);
  const prevVolumeRef = useRef(settings.masterVolume);

  const handleVolumeChange = (value: number[]) => {
    setSettings({ ...settings, masterVolume: value[0] });
    prevVolumeRef.current = value[0];
  };

  const toggleMute = () => {
    if (isMuted) {
      setSettings({ ...settings, masterVolume: prevVolumeRef.current || 0.5 });
    } else {
      prevVolumeRef.current = settings.masterVolume;
      setSettings({ ...settings, masterVolume: 0 });
    }
    setIsMuted(!isMuted);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      className="h-full bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-white/5">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
            <Music className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-shrink-0"
              >
                <h1 className="text-lg font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Harmonia
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                'overflow-hidden',
                isActive 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={cn(
                'flex-shrink-0 transition-colors',
                isActive && 'text-violet-400'
              )}>
                {item.icon}
              </div>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* Master Volume */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors flex-shrink-0"
          >
            {isMuted || settings.masterVolume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0"
              >
                <Slider
                  value={[settings.masterVolume]}
                  onValueChange={handleVolumeChange}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!sidebarCollapsed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[10px] text-white/30 mt-1 text-center"
          >
            Master Volume: {Math.round(settings.masterVolume * 100)}%
          </motion.p>
        )}
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="h-10 flex items-center justify-center border-t border-white/5 text-white/30 hover:text-white transition-colors"
      >
        <motion.div
          animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.div>
      </button>
    </motion.aside>
  );
}
