import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getNotes, StorageError } from '@/services/storage';
import { Note } from '@/types/note';

// Loads all notes and reloads every time the screen comes back into focus,
// so a note saved in the Add Update modal shows up as soon as the modal closes.
export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setNotes(await getNotes());
      setError(null);
    } catch (e) {
      setError(e instanceof StorageError ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { notes, loading, error, reload };
}
