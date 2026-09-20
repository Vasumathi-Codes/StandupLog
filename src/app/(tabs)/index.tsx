import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { NoteCard } from '@/components/NoteCard';
import { QuickAddButton } from '@/components/QuickAddButton';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionHeader } from '@/components/SectionHeader';
import { fontSize, NOTE_TYPE_META, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { addNote, getNotesForDate, StorageError } from '@/services/storage';
import { Note, NoteType } from '@/types/note';
import { formatLongDate, greeting, todayString } from '@/utils/date';

const TYPES: NoteType[] = ['DONE', 'PLAN', 'BLOCKER'];

// TEMPORARY until Phase 3: the Add Update flow doesn't exist yet, so the quick-add
// buttons save a sample note of that type so you can see the design with real data.
const SAMPLE_TEXT: Record<NoteType, string> = {
  DONE: 'Fixed appointment API issue',
  PLAN: 'Start QA testing',
  BLOCKER: 'Waiting for QA environment',
};

export default function TodayScreen() {
  const { colors } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const today = todayString();

  const load = useCallback(async () => {
    try {
      setNotes(await getNotesForDate(today));
      setError(null);
    } catch (e) {
      setError(e instanceof StorageError ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [today]);

  // Reload whenever this tab comes into focus (e.g. after adding a note elsewhere).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const quickAdd = async (type: NoteType) => {
    try {
      await addNote({ text: SAMPLE_TEXT[type], type, date: today, project: 'MyEHE' });
      await load();
    } catch (e) {
      Alert.alert('Could not save', e instanceof StorageError ? e.message : 'Please try again.');
    }
  };

  const count = notes.length;
  const summary = count === 0 ? 'No updates yet today' : `${count} ${count === 1 ? 'update' : 'updates'} today`;

  return (
    <Screen>
      <ScreenHeader caption={greeting()} title={formatLongDate()} subtitle={summary} />

      <View style={styles.quickRow}>
        {TYPES.map((type) => (
          <View key={type} style={styles.quickItem}>
            <QuickAddButton type={type} onPress={() => quickAdd(type)} />
          </View>
        ))}
      </View>

      {loading && <ActivityIndicator color={colors.primary} style={styles.loading} />}

      {!loading && error && (
        <EmptyState icon="alert-circle-outline" title="Couldn't load updates" message={error} />
      )}

      {!loading && !error && count === 0 && (
        <EmptyState
          icon="create-outline"
          title="No updates yet"
          message="Start logging what you worked on today. Tap Done, Plan or Blocker above."
        />
      )}

      {!loading &&
        !error &&
        TYPES.map((type) => {
          const group = notes
            .filter((note) => note.type === type)
            // Active blockers first, resolved ones sink to the bottom.
            .sort((a, b) => Number(a.resolved) - Number(b.resolved));
          if (group.length === 0) return null;
          return (
            <View key={type} style={styles.section}>
              <SectionHeader title={NOTE_TYPE_META[type].plural} count={group.length} type={type} />
              {group.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </View>
          );
        })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  quickRow: { flexDirection: 'row', gap: spacing.sm },
  quickItem: { flex: 1 },
  loading: { paddingVertical: spacing.xl },
  section: { gap: spacing.md },
});
