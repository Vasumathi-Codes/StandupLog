import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { NoteForm, NoteFormValues } from '@/components/NoteForm';
import { useTheme } from '@/hooks/useTheme';
import { deleteNote, getNotes, updateNote } from '@/services/storage';
import { Note } from '@/types/note';
import { useSettings } from '@/hooks/useSettings';
import { allProjects, uniqueProjects } from '@/utils/notes';
import { formatLongDate, parseDateString } from '@/utils/date';

export default function EditNoteScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors } = useTheme();
  const { settings } = useSettings();
  const [note, setNote] = useState<Note | null>(null);
  const [projects, setProjects] = useState<string[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    getNotes()
      .then((notes) => {
        setProjects(uniqueProjects(notes));
        const found = notes.find((n) => n.id === id);
        setNote(found ?? null);
        setStatus(found ? 'ready' : 'missing');
      })
      .catch(() => setStatus('missing'));
  }, [id]);

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!note) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}>
        <EmptyState icon="alert-circle-outline" title="Update not found" message="It may have been deleted." />
      </View>
    );
  }

  const handleSubmit = async (values: NoteFormValues) => {
    await updateNote(note.id, { text: values.text, type: values.type, project: values.project });
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('Delete this update?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteNote(note.id);
            router.back();
          } catch {
            Alert.alert('Could not delete', 'Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <NoteForm
      initialValues={{ type: note.type, text: note.text, project: note.project ?? '' }}
      dateLabel={formatLongDate(parseDateString(note.date))}
      submitLabel="Save"
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      onDelete={handleDelete}
      projectSuggestions={allProjects([], [...settings.projects, ...projects])}
    />
  );
}
