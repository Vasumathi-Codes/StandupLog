import { router } from 'expo-router';
import { Alert, LayoutAnimation } from 'react-native';

import type { GroupEdits } from '@/components/NoteGroupCard';
import { deleteNote, StorageError, updateNote } from '@/services/storage';
import { Note } from '@/types/note';

function showError(title: string, error: unknown) {
  Alert.alert(title, error instanceof StorageError ? error.message : 'Please try again.');
}

// Shared edit / delete / resolve behaviour for any list of NoteCards.
// `reload` refreshes the list after a change.
export function useNoteActions(reload: () => Promise<void>) {
  const refreshAnimated = async () => {
    await reload();
    // Animate the list rearranging (a note disappearing or a blocker fading).
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const edit = (note: Note) => router.push({ pathname: '/edit-note', params: { id: note.id } });

  const confirmDelete = (note: Note) => {
    Alert.alert('Delete this update?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            await deleteNote(note.id);
            await reload();
          } catch (error) {
            showError('Could not delete', error);
          }
        },
      },
    ]);
  };

  // Resolving keeps the note in history; it just stops counting as an active blocker.
  const resolve = async (note: Note) => {
    try {
      await updateNote(note.id, { resolved: true });
      await refreshAnimated();
    } catch (error) {
      showError('Could not resolve', error);
    }
  };

  // Applies inline edits from a NoteGroupCard: changed texts and removed rows. Resolves true on success.
  const saveGroupEdits = async ({ updates, deletedIds }: GroupEdits): Promise<boolean> => {
    try {
      for (const { id, text } of updates) await updateNote(id, { text });
      for (const id of deletedIds) await deleteNote(id);
      await refreshAnimated();
      return true;
    } catch (error) {
      showError('Could not save changes', error);
      await reload(); // show whatever did get saved
      return false;
    }
  };

  const openMenu = (note: Note) => {
    Alert.alert('Update', undefined, [
      { text: 'Edit', onPress: () => edit(note) },
      { text: 'Delete', style: 'destructive', onPress: () => confirmDelete(note) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return { edit, confirmDelete, resolve, openMenu, saveGroupEdits };
}
