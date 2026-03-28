'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, AlertTriangle, Pencil, X } from 'lucide-react';
import { useHarmoniaStore } from '@/store';
import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface KeybindRowProps {
  sound: ReturnType<typeof useHarmoniaStore.getState>['sounds'][0];
  onEdit: () => void;
  onClear: () => void;
  isRecording: boolean;
}

function KeybindRow({ sound, onEdit, onClear, isRecording }: KeybindRowProps) {
  const recordingKeybind = useHarmoniaStore((s) => s.recordingKeybind);
  const updateSound = useHarmoniaStore((s) => s.updateSound);

  useEffect(() => {
    if (recordingKeybind === sound.id && !isRecording) {
      // Start recording
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
          updateSound(sound.id, { keybind: newKeybind });
          useHarmoniaStore.getState().setRecordingKeybind(null);
          toast.success('Keybind updated');
          window.removeEventListener('keydown', handler);
        }
      };

      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, [recordingKeybind, sound.id, isRecording, updateSound]);

  const formatKeybind = (keybind: string) => {
    return keybind.split(' + ').map((key, i, arr) => (
      <span key={i} className="flex items-center">
        <kbd className="px-2 py-1 text-xs font-mono bg-white/10 rounded border border-white/20 text-white/90">
          {key}
        </kbd>
        {i < arr.length - 1 && <span className="mx-1 text-white/40">+</span>}
      </span>
    ));
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        flex items-center gap-4 p-4 rounded-xl border border-white/5 
        ${isRecording ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 hover:bg-white/10'}
        transition-colors
      `}
    >
      {/* Sound info */}
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ backgroundColor: `${sound.color}30` }}
      >
        {sound.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{sound.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: sound.color }}
          />
          <span className="text-xs text-white/40">{sound.duration.toFixed(1)}s</span>
        </div>
      </div>

      {/* Keybind display */}
      <div className="flex items-center gap-2">
        {isRecording ? (
          <span className="text-red-400 text-sm animate-pulse">Press a key...</span>
        ) : sound.keybind ? (
          formatKeybind(sound.keybind)
        ) : (
          <span className="text-white/30 text-sm">No keybind</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={onEdit}
          className="text-white/50 hover:text-white"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        {sound.keybind && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClear}
            className="text-white/50 hover:text-red-400"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export function KeybindsPage() {
  const sounds = useHarmoniaStore((s) => s.sounds);
  const settings = useHarmoniaStore((s) => s.settings);
  const setSettings = useHarmoniaStore((s) => s.setSettings);
  const recordingKeybind = useHarmoniaStore((s) => s.recordingKeybind);
  const setRecordingKeybind = useHarmoniaStore((s) => s.setRecordingKeybind);
  const updateSound = useHarmoniaStore((s) => s.updateSound);

  const [clearingKeybind, setClearingKeybind] = useState<string | null>(null);

  const soundsWithKeybinds = sounds.filter(s => s.keybind);

  // Check for conflicts
  const conflicts = new Map<string, string[]>();
  soundsWithKeybinds.forEach(sound => {
    if (sound.keybind) {
      const same = sounds.filter(s => s.keybind === sound.keybind);
      if (same.length > 1) {
        conflicts.set(sound.keybind, same.map(s => s.name));
      }
    }
  });

  const handleClearKeybind = (soundId: string) => {
    updateSound(soundId, { keybind: null });
    toast.success('Keybind cleared');
    setClearingKeybind(null);
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Keybinds</h2>
            <p className="text-white/50 mt-1">
              Manage keyboard shortcuts for your sounds
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/60">Enable Keybinds</span>
            <Switch
              checked={settings.keybindsEnabled}
              onCheckedChange={(checked) => {
                setSettings({ ...settings, keybindsEnabled: checked });
                toast.success(checked ? 'Keybinds enabled' : 'Keybinds disabled');
              }}
            />
          </div>
        </div>

        {/* Conflicts warning */}
        {conflicts.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-400">Keybind Conflicts Detected</h4>
                <p className="text-sm text-white/60 mt-1">
                  The following keybinds are assigned to multiple sounds:
                </p>
                <ul className="mt-2 space-y-1">
                  {Array.from(conflicts.entries()).map(([keybind, names]) => (
                    <li key={keybind} className="text-sm text-white/40">
                      <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs">{keybind}</span>
                      {' '} → {names.join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Keybind list */}
        {sounds.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
              All Sounds ({sounds.length})
            </h3>
            <AnimatePresence mode="popLayout">
              {sounds.map((sound) => (
                <KeybindRow
                  key={sound.id}
                  sound={sound}
                  onEdit={() => setRecordingKeybind(sound.id)}
                  onClear={() => setClearingKeybind(sound.id)}
                  isRecording={recordingKeybind === sound.id}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Keyboard className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-xl font-semibold text-white/80 mb-2">No sounds yet</h3>
            <p className="text-white/40 max-w-sm mx-auto">
              Add some sounds to your soundboard first, then you can assign keybinds to trigger them.
            </p>
          </motion.div>
        )}
      </div>

      {/* Clear keybind confirmation */}
      <AlertDialog open={!!clearingKeybind} onOpenChange={() => setClearingKeybind(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Keybind</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the keybind from this sound?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clearingKeybind && handleClearKeybind(clearingKeybind)}
              className="bg-red-600 hover:bg-red-500"
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
