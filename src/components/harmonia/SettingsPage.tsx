'use client';

import { motion } from 'framer-motion';
import { 
  Palette, 
  Monitor, 
  Moon, 
  Sun, 
  Play, 
  Volume2, 
  FolderOpen,
  RotateCcw,
  Github,
  Info,
  Sparkles,
} from 'lucide-react';
import { useHarmoniaStore } from '@/store';
import { useState, useEffect, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI;

const accentColors = [
  { name: 'Violet', value: '#6366f1' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Sky', value: '#0ea5e9' },
];

export function SettingsPage() {
  const settings = useHarmoniaStore((s) => s.settings);
  const setSettings = useHarmoniaStore((s) => s.setSettings);
  const sounds = useHarmoniaStore((s) => s.sounds);
  const boards = useHarmoniaStore((s) => s.boards);
  const setSounds = useHarmoniaStore((s) => s.setSounds);
  const setBoards = useHarmoniaStore((s) => s.setBoards);

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [autoLaunchEnabled, setAutoLaunchEnabled] = useState(false);

  // Load auto-launch status on mount
  useEffect(() => {
    if (isElectron) {
      window.electronAPI.getAutoLaunch().then((enabled) => {
        setAutoLaunchEnabled(enabled);
      });
    }
  }, []);

  const handleExportAll = useCallback(async () => {
    if (isElectron) {
      const success = await window.electronAPI.exportAllData();
      if (success) {
        toast.success('Data exported successfully');
      }
    } else {
      // Fallback for web
      const exportData = {
        boards,
        sounds,
        settings,
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `harmonia-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    }
  }, [boards, sounds, settings]);

  const handleImportAll = useCallback(async () => {
    if (isElectron) {
      const data = await window.electronAPI.importAllData();
      if (data) {
        setBoards(data.boards || []);
        setSounds(data.sounds || []);
        if (data.settings) setSettings(data.settings);
        toast.success('Data imported successfully');
      }
    } else {
      // Fallback for web
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          const text = await file.text();
          const data = JSON.parse(text);
          
          if (data.boards && data.sounds) {
            setBoards(data.boards);
            setSounds(data.sounds);
            if (data.settings) setSettings(data.settings);
            toast.success('Data imported successfully');
          } else {
            throw new Error('Invalid backup file');
          }
        } catch (error) {
          toast.error('Failed to import data');
          console.error(error);
        }
      };
      input.click();
    }
  }, [setBoards, setSounds, setSettings]);

  const handleAutoLaunchChange = useCallback(async (enabled: boolean) => {
    if (isElectron) {
      await window.electronAPI.setAutoLaunch(enabled);
      setAutoLaunchEnabled(enabled);
    }
    setSettings({ ...settings, startMinimized: enabled });
  }, [settings, setSettings]);

  const handleReset = () => {
    setBoards([]);
    setSounds([]);
    setSettings({
      masterVolume: 0.8,
      playbackMode: 'overlap',
      outputDevice: 'default',
      accentColor: '#6366f1',
      theme: 'dark',
      startMinimized: false,
      minimizeToTray: false,
      keybindsEnabled: true,
      storagePath: '',
    });
    toast.success('Settings reset to defaults');
    setShowResetDialog(false);
  };

  const handleOpenGitHub = useCallback(() => {
    if (isElectron) {
      window.electronAPI.openExternal('https://github.com/harmonia/harmonia');
    } else {
      window.open('https://github.com/harmonia/harmonia', '_blank');
    }
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-white/50 mt-1">Customize your Harmonia experience</p>
          {isElectron && (
            <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              Running as Desktop App
            </p>
          )}
        </div>

        {/* Appearance */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-violet-400" />
            Appearance
          </h3>
          <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
            {/* Accent Color */}
            <div className="space-y-3">
              <Label className="text-white/70">Accent Color</Label>
              <div className="flex flex-wrap gap-2">
                {accentColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSettings({ ...settings, accentColor: color.value })}
                    className={`
                      w-8 h-8 rounded-lg transition-all duration-200
                      ${settings.accentColor === color.value 
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' 
                        : 'hover:scale-105'}
                    `}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <Separator className="bg-white/5" />

            {/* Theme */}
            <div className="space-y-3">
              <Label className="text-white/70">Theme</Label>
              <RadioGroup
                value={settings.theme}
                onValueChange={(value) => setSettings({ ...settings, theme: value as typeof settings.theme })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="text-white/70 flex items-center gap-2">
                    <Moon className="w-4 h-4" /> Dark
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="text-white/70 flex items-center gap-2">
                    <Sun className="w-4 h-4" /> Light
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system" className="text-white/70 flex items-center gap-2">
                    <Monitor className="w-4 h-4" /> System
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </section>

        {/* Behavior */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            Behavior
          </h3>
          <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white/70">Launch at startup</Label>
                <p className="text-xs text-white/40 mt-1">
                  Start Harmonia when your computer starts
                </p>
              </div>
              <Switch
                checked={autoLaunchEnabled}
                onCheckedChange={handleAutoLaunchChange}
              />
            </div>

            <Separator className="bg-white/5" />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white/70">Minimize to system tray</Label>
                <p className="text-xs text-white/40 mt-1">
                  Keep running in the background when closed
                </p>
              </div>
              <Switch
                checked={settings.minimizeToTray}
                onCheckedChange={(checked) => setSettings({ ...settings, minimizeToTray: checked })}
              />
            </div>
          </div>
        </section>

        {/* Audio */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-violet-400" />
            Audio
          </h3>
          <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
            {/* Playback Mode */}
            <div className="space-y-3">
              <Label className="text-white/70">Default Playback Mode</Label>
              <RadioGroup
                value={settings.playbackMode}
                onValueChange={(value) => setSettings({ ...settings, playbackMode: value as typeof settings.playbackMode })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="overlap" id="overlap" />
                  <Label htmlFor="overlap" className="text-white/70 flex items-center gap-2">
                    <Play className="w-4 h-4" /> Overlap
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="exclusive" id="exclusive" />
                  <Label htmlFor="exclusive" className="text-white/70 flex items-center gap-2">
                    Exclusive
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-white/40">
                {settings.playbackMode === 'overlap' 
                  ? 'Multiple sounds can play at the same time' 
                  : 'New sounds will stop currently playing sounds'}
              </p>
            </div>

            <Separator className="bg-white/5" />

            {/* Master Volume */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white/70">Default Output Device</Label>
              </div>
              <p className="text-xs text-white/40">
                {isElectron 
                  ? 'Audio plays through your system default output device'
                  : 'Note: Output device selection is simulated in web version'}
              </p>
            </div>
          </div>
        </section>

        {/* Keybinds */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-violet-400" />
            Keybinds
          </h3>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white/70">Enable Keybinds</Label>
                <p className="text-xs text-white/40 mt-1">
                  {isElectron 
                    ? 'Trigger sounds with keyboard shortcuts (works even when minimized)'
                    : 'Trigger sounds with keyboard shortcuts'}
                </p>
              </div>
              <Switch
                checked={settings.keybindsEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, keybindsEnabled: checked })}
              />
            </div>
          </div>
        </section>

        {/* Data */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-violet-400" />
            Data
          </h3>
          <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleExportAll}>
                Export All Data
              </Button>
              <Button variant="outline" onClick={handleImportAll}>
                Import Data
              </Button>
            </div>
            <p className="text-xs text-white/40">
              Export all your boards, sounds, and settings to a backup file
            </p>
            {isElectron && (
              <p className="text-xs text-green-400/60">
                Audio files are stored separately on disk for better performance
              </p>
            )}
          </div>
        </section>

        {/* About */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-violet-400" />
            About
          </h3>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Harmonia</h4>
                <p className="text-sm text-white/40">Version 1.0.0</p>
                {isElectron && (
                  <p className="text-xs text-green-400">Electron Desktop App</p>
                )}
              </div>
            </div>
            
            <p className="text-sm text-white/60">
              A premium, open-source desktop soundboard application designed for content creators, 
              streamers, and anyone who wants instant access to sound effects.
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={handleOpenGitHub}
                className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                <Github className="w-4 h-4" />
                View on GitHub
              </button>
            </div>

            <Separator className="bg-white/5" />

            <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset to Defaults</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all your boards, sounds, and settings. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} className="bg-red-600 hover:bg-red-500">
                    Reset Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>

        {/* Stats */}
        <section className="text-center py-4 text-white/30 text-xs">
          <p>{boards.length} boards • {sounds.length} sounds</p>
        </section>
      </div>
    </div>
  );
}
