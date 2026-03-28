'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useHarmoniaStore } from '@/store';
import type { Sound } from '@/types';

interface AudioNode {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  soundId: string;
}

export function useAudioEngine() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferCache = useRef<Map<string, AudioBuffer>>(new Map());
  const activeNodesRef = useRef<Map<string, AudioNode[]>>(new Map());
  
  const settings = useHarmoniaStore((s) => s.settings);
  const addPlayingSound = useHarmoniaStore((s) => s.addPlayingSound);
  const removePlayingSound = useHarmoniaStore((s) => s.removePlayingSound);
  const updateSound = useHarmoniaStore((s) => s.updateSound);
  const sounds = useHarmoniaStore((s) => s.sounds);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const decodeAudioData = useCallback(async (audioData: string): Promise<AudioBuffer> => {
    const ctx = getAudioContext();
    
    // Check cache first
    if (audioBufferCache.current.has(audioData)) {
      return audioBufferCache.current.get(audioData)!;
    }

    // Decode base64 audio data
    const binaryString = atob(audioData.split(',')[1]);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const buffer = await ctx.decodeAudioData(bytes.buffer);
    audioBufferCache.current.set(audioData, buffer);
    return buffer;
  }, [getAudioContext]);

  const generateWaveform = useCallback((buffer: AudioBuffer): number[] => {
    const rawData = buffer.getChannelData(0);
    const samples = 50;
    const blockSize = Math.floor(rawData.length / samples);
    const filteredData: number[] = [];
    
    for (let i = 0; i < samples; i++) {
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[i * blockSize + j]);
      }
      filteredData.push(sum / blockSize);
    }
    
    // Normalize
    const max = Math.max(...filteredData);
    return filteredData.map(v => v / max);
  }, []);

  const stopAllSounds = useCallback(() => {
    activeNodesRef.current.forEach((nodes) => {
      nodes.forEach(({ source }) => {
        try {
          source.stop();
        } catch {
          // Already stopped
        }
      });
    });
    activeNodesRef.current.clear();
  }, []);

  const stopSound = useCallback((soundId: string) => {
    const nodes = activeNodesRef.current.get(soundId);
    if (nodes) {
      nodes.forEach(({ source }) => {
        try {
          source.stop();
        } catch {
          // Already stopped
        }
      });
      activeNodesRef.current.delete(soundId);
    }
    removePlayingSound(soundId);
  }, [removePlayingSound]);

  const playSound = useCallback(async (sound: Sound) => {
    if (!sound.audioData) return;

    const ctx = getAudioContext();
    
    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    // Stop all sounds if in exclusive mode
    if (settings.playbackMode === 'exclusive') {
      stopAllSounds();
    }

    try {
      const buffer = await decodeAudioData(sound.audioData);
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = sound.speed;
      source.detune.value = (sound.pitch - 1) * 1200; // Convert pitch ratio to cents

      const gainNode = ctx.createGain();
      gainNode.gain.value = sound.volume * settings.masterVolume;

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      const soundId = sound.id;
      addPlayingSound(soundId);

      // Track this node
      if (!activeNodesRef.current.has(soundId)) {
        activeNodesRef.current.set(soundId, []);
      }
      activeNodesRef.current.get(soundId)!.push({ source, gainNode, soundId });

      source.onended = () => {
        removePlayingSound(soundId);
        const nodes = activeNodesRef.current.get(soundId);
        if (nodes) {
          activeNodesRef.current.set(soundId, nodes.filter(n => n.source !== source));
        }
      };

      source.start(0);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [settings, decodeAudioData, getAudioContext, addPlayingSound, removePlayingSound, stopAllSounds]);

  const processAudioFile = useCallback(async (file: File): Promise<{
    audioData: string;
    duration: number;
    waveform: number[];
  }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const audioData = e.target?.result as string;
          const buffer = await decodeAudioData(audioData);
          const waveform = generateWaveform(buffer);
          
          resolve({
            audioData,
            duration: buffer.duration,
            waveform,
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, [decodeAudioData, generateWaveform]);

  // Handle keybinds
  useEffect(() => {
    if (!settings.keybindsEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const recordingKeybind = useHarmoniaStore.getState().recordingKeybind;
      
      if (recordingKeybind) {
        // Recording mode - capture the keybind
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
          const keybind = parts.join(' + ');
          updateSound(recordingKeybind, { keybind });
          useHarmoniaStore.getState().setRecordingKeybind(null);
          e.preventDefault();
        }
        return;
      }

      // Normal mode - trigger sound
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

      const pressedKey = parts.join(' + ');
      
      const sound = sounds.find(s => s.keybind === pressedKey);
      if (sound) {
        const isPlaying = useHarmoniaStore.getState().playingSounds.has(sound.id);
        if (isPlaying) {
          stopSound(sound.id);
        } else {
          playSound(sound);
        }
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.keybindsEnabled, sounds, playSound, stopSound, updateSound]);

  return {
    playSound,
    stopSound,
    stopAllSounds,
    processAudioFile,
    generateWaveform,
    getAudioContext,
  };
}
