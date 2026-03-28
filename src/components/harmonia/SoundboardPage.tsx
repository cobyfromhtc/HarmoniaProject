'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Tag, Plus, Music } from 'lucide-react';
import { useHarmoniaStore } from '@/store';
import { SoundPad } from './SoundPad';
import { useAudioEngine } from '@/lib/audio/engine';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BoardTabs } from './BoardTabs';
import { AddSoundModal } from './AddSoundModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function SoundboardPage() {
  const boards = useHarmoniaStore((s) => s.boards);
  const sounds = useHarmoniaStore((s) => s.sounds);
  const currentBoardId = useHarmoniaStore((s) => s.currentBoardId);
  const playingSounds = useHarmoniaStore((s) => s.playingSounds);
  const recordingKeybind = useHarmoniaStore((s) => s.recordingKeybind);
  const setRecordingKeybind = useHarmoniaStore((s) => s.setRecordingKeybind);
  const updateSound = useHarmoniaStore((s) => s.updateSound);
  const deleteSound = useHarmoniaStore((s) => s.deleteSound);
  const setEditingSound = useHarmoniaStore((s) => s.setEditingSound);
  const setDeletingSoundId = useHarmoniaStore((s) => s.setDeletingSoundId);
  const addSoundModalOpen = useHarmoniaStore((s) => s.addSoundModalOpen);
  const setAddSoundModalOpen = useHarmoniaStore((s) => s.setAddSoundModalOpen);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { playSound, stopSound } = useAudioEngine();

  const currentBoardSounds = useMemo(() => {
    if (!currentBoardId) return [];
    return sounds
      .filter((s) => s.boardId === currentBoardId)
      .sort((a, b) => a.order - b.order);
  }, [sounds, currentBoardId]);

  const filteredSounds = useMemo(() => {
    return currentBoardSounds.filter((sound) => {
      const matchesSearch = sound.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => sound.tags.includes(tag));
      return matchesSearch && matchesTags;
    });
  }, [currentBoardSounds, searchQuery, selectedTags]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    sounds.forEach(s => s.tags.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [sounds]);

  const handlePlaySound = (sound: typeof sounds[0]) => {
    const isPlaying = playingSounds.has(sound.id);
    if (isPlaying) {
      stopSound(sound.id);
    } else {
      playSound(sound);
    }
  };

  const handleEdit = (sound: typeof sounds[0]) => {
    setEditingSound(sound);
    setAddSoundModalOpen(true);
  };

  const handleDelete = (soundId: string) => {
    setDeletingSoundId(soundId);
  };

  const handleRecordKeybind = (soundId: string) => {
    setRecordingKeybind(soundId);
    toast.info('Press a key combination to assign');
  };

  const currentBoard = boards.find(b => b.id === currentBoardId);

  return (
    <div className="h-full flex flex-col">
      {/* Board Tabs */}
      <BoardTabs />

      {/* Search and filters */}
      <div className="px-4 py-3 border-b border-white/5 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sounds..."
            className="pl-10 bg-white/5 border-white/10 focus:border-violet-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Tag className="w-4 h-4 text-white/40 flex-shrink-0" />
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer whitespace-nowrap transition-colors',
                  selectedTags.includes(tag) 
                    ? 'bg-violet-600 hover:bg-violet-500' 
                    : 'border-white/20 hover:border-white/40'
                )}
                onClick={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag)
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  );
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Sound Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredSounds.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredSounds.map((sound) => (
                <SoundPad
                  key={sound.id}
                  sound={sound}
                  isPlaying={playingSounds.has(sound.id)}
                  onPlay={() => handlePlaySound(sound)}
                  onEdit={() => handleEdit(sound)}
                  onDelete={() => handleDelete(sound.id)}
                  onRecordKeybind={() => handleRecordKeybind(sound.id)}
                  isRecordingKeybind={recordingKeybind === sound.id}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-center text-center p-8"
          >
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Music className="w-12 h-12 text-white/20" />
            </div>
            <h3 className="text-xl font-semibold text-white/80 mb-2">
              {currentBoard ? `No sounds in ${currentBoard.name}` : 'No board selected'}
            </h3>
            <p className="text-white/40 mb-6 max-w-sm">
              {currentBoard 
                ? 'Add your first sound to get started with your soundboard.'
                : 'Create a board to start adding sounds.'}
            </p>
            {currentBoard && (
              <Button
                onClick={() => setAddSoundModalOpen(true)}
                className="bg-violet-600 hover:bg-violet-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Sound
              </Button>
            )}
          </motion.div>
        )}
      </div>

      {/* Add Sound Modal */}
      <AddSoundModal
        open={addSoundModalOpen}
        onOpenChange={setAddSoundModalOpen}
      />
    </div>
  );
}
