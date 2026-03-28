'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useHarmoniaStore } from '@/store';

export function FloatingAddButton() {
  const setAddSoundModalOpen = useHarmoniaStore((s) => s.setAddSoundModalOpen);
  const currentPage = useHarmoniaStore((s) => s.currentPage);

  if (currentPage !== 'soundboard') return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setAddSoundModalOpen(true)}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 flex items-center justify-center z-40 hover:shadow-violet-500/50 transition-shadow"
    >
      <Plus className="w-6 h-6" />
    </motion.button>
  );
}
