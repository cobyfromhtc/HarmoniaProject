'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Music, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useHarmoniaStore } from '@/store';
import { useAudioEngine } from '@/lib/audio/engine';
import { toast } from 'sonner';

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI;

interface AddSoundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emojiOptions = ['🎵', '🎸', '🎹', '🎺', '🥁', '🎷', '🎻', '🎤', '🎧', '🔊', '💿', '🎶', '🎼', '✨', '🔥', '💫', '⭐', '🌟', '🎨', '🎭'];
const colorOptions = [
  '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#a855f7', '#7c3aed',
];

export function AddSoundModal({ open, onOpenChange }: AddSoundModalProps) {
  const [step, setStep] = useState<'upload' | 'configure'>('upload');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎵');
  const [color, setColor] = useState('#6366f1');
  const [volume, setVolume] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [keybind, setKeybind] = useState<string | null>(null);
  const [isRecordingKeybind, setIsRecordingKeybind] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const addSound = useHarmoniaStore((s) => s.addSound);
  const currentBoardId = useHarmoniaStore((s) => s.currentBoardId);
  const sounds = useHarmoniaStore((s) => s.sounds);
  const { processAudioFile } = useAudioEngine();

  const handleFileSelect = useCallback(async (file: File, data?: string) => {
    const audioDataStr = data || await fileToBase64(file);
    
    setAudioFile(file);
    setAudioData(audioDataStr);
    setName(file.name.replace(/\.[^/.]+$/, ''));
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setAudioPreview(url);
    
    setStep('configure');
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleElectronFileSelect = useCallback(async () => {
    if (!isElectron) return;
    
    const result = await window.electronAPI.selectAudioFile();
    if (result) {
      // Create a pseudo-file from the result
      const file = new File([], result.name);
      handleFileSelect(file, result.data);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleKeybindRecord = useCallback(() => {
    setIsRecordingKeybind(true);
    
    const handler = (e: KeyboardEvent) => {
      const parts: string[] = [];
      if (e.ctrlKey) parts.push('Ctrl');
      if (e.altKey) parts.push('Alt');
      if (e.shiftKey) parts.push('Shift');
      if (e.metaKey) parts.push('Meta');
      
      if (e.key.length === 1) {
        parts.push(e.key.toUpperCase());
      } else if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        parts.push(e.key);
      }

      if (parts.length > 0) {
        const newKeybind = parts.join(' + ');
        
        // Check for conflicts
        const conflict = sounds.find(s => s.keybind === newKeybind);
        if (conflict) {
          toast.warning(`Keybind already assigned to "${conflict.name}"`);
        } else {
          setKeybind(newKeybind);
        }
        
        setIsRecordingKeybind(false);
        window.removeEventListener('keydown', handler);
      }
    };

    window.addEventListener('keydown', handler);
    
    // Timeout after 5 seconds
    setTimeout(() => {
      setIsRecordingKeybind(false);
      window.removeEventListener('keydown', handler);
    }, 5000);
  }, [sounds]);

  const handleSave = async () => {
    if ((!audioFile && !audioData) || !currentBoardId) return;

    setIsLoading(true);
    try {
      const soundId = crypto.randomUUID();
      const audioDataStr = audioData || await fileToBase64(audioFile!);
      
      // Process audio for waveform/duration
      const processed = await processAudioFile(audioFile || new File([], 'audio.webm'));
      
      // Save audio file to disk if in Electron
      if (isElectron && audioDataStr) {
        await window.electronAPI.saveAudioFile(audioDataStr, soundId);
      }
      
      const newSound = {
        id: soundId,
        name: name.trim() || (audioFile?.name || 'Sound'),
        emoji,
        color,
        keybind,
        volume,
        pitch,
        speed,
        duration: processed.duration,
        waveform: JSON.stringify(processed.waveform),
        tags: [],
        order: sounds.filter(s => s.boardId === currentBoardId).length,
        boardId: currentBoardId,
        audioData: isElectron ? null : audioDataStr, // Don't store in JSON if Electron
        audioPath: isElectron ? `${soundId}.webm` : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addSound(newSound);
      toast.success('Sound added successfully');
      handleClose();
    } catch (error) {
      console.error('Error saving sound:', error);
      toast.error('Failed to save sound');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('upload');
    setAudioFile(null);
    setAudioData(null);
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    setAudioPreview(null);
    setName('');
    setEmoji('🎵');
    setColor('#6366f1');
    setVolume(1);
    setPitch(1);
    setSpeed(1);
    setKeybind(null);
    setIsRecordingKeybind(false);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h2 className="text-lg font-semibold text-white">Add New Sound</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {step === 'upload' ? (
              <div
                ref={dropRef}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-violet-500/50 transition-colors cursor-pointer"
                onClick={() => {
                  if (isElectron) {
                    handleElectronFileSelect();
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
              >
                <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-violet-400" />
                </div>
                <p className="text-white/80 mb-2">Drop your audio file here</p>
                <p className="text-white/40 text-sm">or click to browse</p>
                <p className="text-white/20 text-xs mt-4">Supports MP3, WAV, OGG, FLAC, M4A, WebM</p>
                {!isElectron && (
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Preview */}
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${color}30` }}
                  >
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{name}</p>
                    {audioPreview && (
                      <audio 
                        src={audioPreview} 
                        controls 
                        className="h-8 w-full mt-1"
                      />
                    )}
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label className="text-white/70">Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sound name"
                    className="bg-white/5 border-white/10 focus:border-violet-500"
                  />
                </div>

                {/* Emoji */}
                <div className="space-y-2">
                  <Label className="text-white/70">Icon</Label>
                  <div className="flex flex-wrap gap-2">
                    {emojiOptions.map((e) => (
                      <button
                        key={e}
                        onClick={() => setEmoji(e)}
                        className={cn(
                          'w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all',
                          emoji === e ? 'bg-violet-500/30 ring-2 ring-violet-500' : 'bg-white/5 hover:bg-white/10'
                        )}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <Label className="text-white/70">Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={cn(
                          'w-8 h-8 rounded-lg transition-all',
                          color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : ''
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Volume */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-white/70">Volume</Label>
                    <span className="text-white/50 text-sm">{Math.round(volume * 100)}%</span>
                  </div>
                  <Slider
                    value={[volume]}
                    onValueChange={(v) => setVolume(v[0])}
                    max={1}
                    step={0.01}
                  />
                </div>

                {/* Pitch */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-white/70">Pitch</Label>
                    <span className="text-white/50 text-sm">{pitch.toFixed(2)}x</span>
                  </div>
                  <Slider
                    value={[pitch]}
                    onValueChange={(v) => setPitch(v[0])}
                    min={0.5}
                    max={2}
                    step={0.01}
                  />
                </div>

                {/* Speed */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-white/70">Speed</Label>
                    <span className="text-white/50 text-sm">{speed.toFixed(2)}x</span>
                  </div>
                  <Slider
                    value={[speed]}
                    onValueChange={(v) => setSpeed(v[0])}
                    min={0.5}
                    max={2}
                    step={0.01}
                  />
                </div>

                {/* Keybind */}
                <div className="space-y-2">
                  <Label className="text-white/70">Keybind</Label>
                  <button
                    onClick={handleKeybindRecord}
                    className={cn(
                      'w-full h-10 rounded-lg border flex items-center justify-center gap-2 transition-colors',
                      isRecordingKeybind 
                        ? 'border-red-500 bg-red-500/10 text-red-400' 
                        : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                    )}
                  >
                    <Keyboard className="w-4 h-4" />
                    {isRecordingKeybind ? 'Press a key combination...' : keybind || 'Click to record keybind'}
                  </button>
                  {keybind && !isRecordingKeybind && (
                    <button
                      onClick={() => setKeybind(null)}
                      className="text-xs text-white/40 hover:text-white/60 transition-colors"
                    >
                      Clear keybind
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {step === 'configure' && (
            <div className="flex items-center justify-end gap-3 p-4 border-t border-white/5">
              <Button
                variant="ghost"
                onClick={() => setStep('upload')}
                className="text-white/70 hover:text-white"
              >
                Back
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-violet-600 hover:bg-violet-500"
              >
                {isLoading ? 'Adding...' : 'Add Sound'}
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
