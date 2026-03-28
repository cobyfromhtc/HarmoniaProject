'use client';

import { motion } from 'framer-motion';
import { Play, Square, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Sound } from '@/types';

interface SoundPadProps {
  sound: Sound;
  isPlaying: boolean;
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRecordKeybind: () => void;
  isRecordingKeybind: boolean;
}

export function SoundPad({
  sound,
  isPlaying,
  onPlay,
  onEdit,
  onDelete,
  onRecordKeybind,
  isRecordingKeybind,
}: SoundPadProps) {
  const waveform = sound.waveform ? JSON.parse(sound.waveform) : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'group relative aspect-square rounded-2xl cursor-pointer overflow-hidden',
        'border border-white/10 backdrop-blur-sm',
        'transition-all duration-300 ease-out',
        isPlaying && 'ring-2 ring-offset-2 ring-offset-background'
      )}
      style={{
        background: `linear-gradient(135deg, ${sound.color}20, ${sound.color}40)`,
        borderColor: isPlaying ? sound.color : undefined,
        boxShadow: isPlaying ? `0 0 30px ${sound.color}40` : undefined,
      }}
      onClick={onPlay}
    >
      {/* Background gradient overlay */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${sound.color}30, transparent 70%)`,
        }}
      />

      {/* Playing animation overlay */}
      {isPlaying && (
        <motion.div
          className="absolute inset-0"
          style={{ background: `linear-gradient(45deg, transparent, ${sound.color}20, transparent)` }}
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* Content */}
      <div className="relative h-full flex flex-col p-4">
        {/* Top row: Emoji and menu */}
        <div className="flex items-start justify-between">
          <span className="text-3xl drop-shadow-lg">{sound.emoji}</span>
          <div className="flex items-center gap-1">
            {sound.keybind && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 font-mono">
                {sound.keybind}
              </span>
            )}
          </div>
        </div>

        {/* Sound name */}
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm font-medium text-center text-white/90 line-clamp-2 px-2">
            {sound.name}
          </p>
        </div>

        {/* Bottom row: Waveform and controls */}
        <div className="space-y-2">
          {/* Waveform */}
          {waveform && (
            <div className="flex items-center justify-center gap-[2px] h-8">
              {waveform.map((value: number, i: number) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full"
                  style={{ 
                    backgroundColor: sound.color,
                    opacity: 0.7,
                  }}
                  animate={{
                    height: isPlaying 
                      ? [`${value * 24}px`, `${Math.max(0.1, value * 0.5) * 24}px`, `${value * 24}px`]
                      : `${value * 24}px`,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: isPlaying ? Infinity : 0,
                    delay: i * 0.02,
                  }}
                />
              ))}
            </div>
          )}

          {/* Duration and volume */}
          <div className="flex items-center justify-between text-[10px] text-white/60">
            <span>{formatDuration(sound.duration)}</span>
            <div className="flex items-center gap-1">
              <Volume2 className="w-3 h-3" />
              <span>{Math.round(sound.volume * 100)}%</span>
            </div>
          </div>

          {/* Play button */}
          <motion.button
            className={cn(
              'w-full py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium',
              'transition-colors duration-200'
            )}
            style={{
              backgroundColor: isPlaying ? `${sound.color}80` : `${sound.color}40`,
              color: 'white',
            }}
            whileHover={{ backgroundColor: `${sound.color}60` }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4" fill="currentColor" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4" fill="currentColor" />
                Play
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Context menu button */}
      <div 
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          // Show context menu
        }}
      >
        <button
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Recording keybind indicator */}
      {isRecordingKeybind && (
        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
          <span className="text-xs text-red-400 animate-pulse">Press a key...</span>
        </div>
      )}
    </motion.div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
