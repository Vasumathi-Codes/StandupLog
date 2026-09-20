import { useEffect, useState } from 'react';
import { LayoutAnimation } from 'react-native';

import { parseEditorText, planGroupSave } from '@/services/dayEditor';
import { applyNoteChanges, StorageError } from '@/services/storage';
import { Note, NoteType } from '@/types/note';

export type BlockValues = { text: string; project: string; projectDirty: boolean };

// Which category (if any) is being edited for `date`, and how to save it.
// Used by Today (date = today) and the Calendar (date = the selected day).
export function useDayBlockEditor(date: string, reload: () => Promise<void>) {
  const [editingType, setEditingType] = useState<NoteType | null>(null);

  // Switching to another day closes any open editor, so edits can never land on the wrong date.
  useEffect(() => setEditingType(null), [date]);

  // `existing` are the notes the card shows for this type; the save only touches those.
  // Resolves to an error message, or null on success.
  const save = async (type: NoteType, existing: Note[], values: BlockValues): Promise<string | null> => {
    try {
      // Resolved blockers stay in history and aren't part of the editable text.
      const editable = existing.filter((note) => !note.resolved);
      const changes = planGroupSave(editable, parseEditorText(values.text), {
        type,
        date,
        project: values.project,
        projectDirty: values.projectDirty,
        nowMs: Date.now(),
      });
      await applyNoteChanges(changes);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await reload();
      setEditingType(null);
      return null;
    } catch (e) {
      return e instanceof StorageError ? e.message : 'Could not save. Please try again.';
    }
  };

  return {
    editingType,
    startEditing: (type: NoteType) => setEditingType(type),
    cancel: () => setEditingType(null),
    save,
  };
}
