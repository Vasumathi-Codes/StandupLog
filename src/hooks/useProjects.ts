import { useMemo } from 'react';
import { Alert } from 'react-native';

import { useSettings } from '@/hooks/useSettings';
import { clearProjectFromNotes } from '@/services/storage';
import { Note } from '@/types/note';
import { allProjects } from '@/utils/notes';

// The project list for chips and suggestions, plus a way to add a new one.
// `reload` refreshes the notes after a project is deleted.
export function useProjects(notes: Note[], reload?: () => Promise<void>) {
  const { settings, updateSettings } = useSettings();
  const projects = useMemo(() => allProjects(notes, settings.projects), [notes, settings.projects]);

  const addProject = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || projects.some((p) => p.toLowerCase() === trimmed.toLowerCase())) return;
    await updateSettings({ projects: [...settings.projects, trimmed] });
  };

  const removeProject = (name: string) => {
    const used = notes.filter((n) => n.project?.toLowerCase() === name.toLowerCase()).length;
    const message =
      used > 0
        ? `${used} ${used === 1 ? 'update uses' : 'updates use'} it. They will be kept, but lose the project tag.`
        : 'This project is not used by any update.';
    Alert.alert(`Delete "${name}"?`, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearProjectFromNotes(name);
            await updateSettings({ projects: settings.projects.filter((p) => p.toLowerCase() !== name.toLowerCase()) });
            await reload?.();
          } catch {
            Alert.alert('Could not delete project', 'Please try again.');
          }
        },
      },
    ]);
  };

  return { projects, addProject, removeProject };
}
