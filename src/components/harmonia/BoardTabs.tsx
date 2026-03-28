'use client';

import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, X, MoreHorizontal, Download, Upload, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHarmoniaStore } from '@/store';
import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function BoardTabs() {
  const boards = useHarmoniaStore((s) => s.boards);
  const currentBoardId = useHarmoniaStore((s) => s.currentBoardId);
  const setCurrentBoardId = useHarmoniaStore((s) => s.setCurrentBoardId);
  const addBoard = useHarmoniaStore((s) => s.addBoard);
  const updateBoard = useHarmoniaStore((s) => s.updateBoard);
  const deleteBoard = useHarmoniaStore((s) => s.deleteBoard);
  const sounds = useHarmoniaStore((s) => s.sounds);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCreateBoard = () => {
    const newBoard = {
      id: crypto.randomUUID(),
      name: `Board ${boards.length + 1}`,
      order: boards.length,
      sounds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addBoard(newBoard);
    setCurrentBoardId(newBoard.id);
    setEditingId(newBoard.id);
    setEditName(newBoard.name);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      updateBoard(id, { name: editName.trim() });
    }
    setEditingId(null);
  };

  const handleExport = (boardId: string) => {
    const board = boards.find(b => b.id === boardId);
    const boardSounds = sounds.filter(s => s.boardId === boardId);
    
    const exportData = {
      board,
      sounds: boardSounds,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${board?.name || 'board'}.harmonia.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-white/5 overflow-x-auto">
      <Reorder.Group
        axis="x"
        values={boards}
        onReorder={(newOrder) => {
          newOrder.forEach((board, index) => {
            updateBoard(board.id, { order: index });
          });
        }}
        className="flex items-center gap-1"
      >
        <AnimatePresence>
          {boards.map((board) => (
            <Reorder.Item
              key={board.id}
              value={board}
              className="flex-shrink-0"
            >
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  'group flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200',
                  currentBoardId === board.id
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                )}
                onClick={() => setCurrentBoardId(board.id)}
              >
                {editingId === board.id ? (
                  <Input
                    ref={inputRef}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleRename(board.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(board.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="h-6 w-24 text-xs bg-transparent border-white/20 focus:border-violet-500"
                    autoFocus
                  />
                ) : (
                  <span 
                    className="text-sm font-medium whitespace-nowrap"
                    onDoubleClick={() => {
                      setEditingId(board.id);
                      setEditName(board.name);
                    }}
                  >
                    {board.name}
                  </span>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 bg-zinc-900 border-white/10 text-white">
                    <DropdownMenuItem 
                      className="hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                      onClick={() => {
                        setEditingId(board.id);
                        setEditName(board.name);
                      }}>
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                      onClick={() => handleExport(board.id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem 
                      className="text-red-400 focus:text-red-400 hover:bg-white/10 focus:bg-red-500/10 cursor-pointer"
                      onClick={() => deleteBoard(board.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      <motion.button
        onClick={handleCreateBoard}
        className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all duration-200"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm">New Board</span>
      </motion.button>
    </div>
  );
}
