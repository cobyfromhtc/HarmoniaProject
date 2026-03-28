'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
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
import { useHarmoniaStore } from '@/store';
import { toast } from 'sonner';

export function DeleteSoundDialog() {
  const deletingSoundId = useHarmoniaStore((s) => s.deletingSoundId);
  const setDeletingSoundId = useHarmoniaStore((s) => s.setDeletingSoundId);
  const sounds = useHarmoniaStore((s) => s.sounds);
  const deleteSound = useHarmoniaStore((s) => s.deleteSound);

  const sound = sounds.find(s => s.id === deletingSoundId);

  const handleDelete = () => {
    if (deletingSoundId) {
      deleteSound(deletingSoundId);
      toast.success('Sound deleted');
      setDeletingSoundId(null);
    }
  };

  return (
    <AlertDialog open={!!deletingSoundId} onOpenChange={() => setDeletingSoundId(null)}>
      <AlertDialogContent className="bg-zinc-900 border-white/10">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Delete Sound
          </AlertDialogTitle>
          <AlertDialogDescription className="text-white/60">
            Are you sure you want to delete <span className="text-white font-medium">{sound?.name}</span>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-500"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
