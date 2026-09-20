import { router, useLocalSearchParams } from 'expo-router';

import { NoteForm, NoteFormValues } from '@/components/NoteForm';
import { useNotes } from '@/hooks/useNotes';
import { useProjects } from '@/hooks/useProjects';
import { addNote } from '@/services/storage';
import { NoteType } from '@/types/note';
import { formatLongDate, isValidDateString, parseDateString, todayString } from '@/utils/date';

const TYPES: NoteType[] = ['DONE', 'PLAN', 'BLOCKER'];

// Route params arrive as strings, so validate them instead of trusting them.
// Callers pass ?date=YYYY-MM-DD (Calendar will use this in Phase 5) and ?type=DONE|PLAN|BLOCKER.
export default function AddNoteScreen() {
  const { notes } = useNotes();
  const { projects } = useProjects(notes);
  const params = useLocalSearchParams<{ date?: string; type?: string }>();
  const date = params.date && isValidDateString(params.date) ? params.date : todayString();
  const type = TYPES.find((t) => t === params.type) ?? 'DONE';

  const handleSubmit = async (values: NoteFormValues) => {
    // Stay open so several updates can be added in a row; "Done" closes the modal.
    await addNote({ text: values.text, type: values.type, project: values.project, date });
  };

  return (
    <NoteForm
      initialValues={{ type, text: '', project: '' }}
      dateLabel={`For ${formatLongDate(parseDateString(date))}`}
      submitLabel="Add Update"
      keepOpen
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      projectSuggestions={projects}
    />
  );
}
