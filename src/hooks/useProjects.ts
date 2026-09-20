import { useMemo } from 'react';

import { useSettings } from '@/hooks/useSettings';
import { Note } from '@/types/note';
import { allProjects } from '@/utils/notes';

// The project list for chips and suggestions, plus a way to add a new one.
export function useProjects(notes: Note[]) {
  const { settings, updateSettings } = useSettings();
  const projects = useMemo(() => allProjects(notes, settings.projects), [notes, settings.projects]);

  const addProject = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || projects.some((p) => p.toLowerCase() === trimmed.toLowerCase())) return;
    await updateSettings({ projects: [...settings.projects, trimmed] });
  };

  return { projects, addProject };
}
