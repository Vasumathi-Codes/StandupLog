import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { NoteGroupCard } from '@/components/NoteGroupCard';
import { QuickAddButton } from '@/components/QuickAddButton';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TimesheetActions } from '@/components/TimesheetActions';
import { spacing } from '@/constants/theme';
import { CarryOverCard } from '@/components/CarryOverCard';
import { useCarryOver } from '@/hooks/useCarryOver';
import { useSettings } from '@/hooks/useSettings';
import { useDayBlockEditor } from '@/hooks/useDayBlockEditor';
import { useProjects } from '@/hooks/useProjects';
import { useNoteActions } from '@/hooks/useNoteActions';
import { useNotes } from '@/hooks/useNotes';
import { useTheme } from '@/hooks/useTheme';
import { NoteType } from '@/types/note';
import { formatLongDate, greeting, todayString } from '@/utils/date';

const TYPES: NoteType[] = ['DONE', 'PLAN', 'BLOCKER'];

export default function TodayScreen() {
  const { colors } = useTheme();
  const { notes: allNotes, loading, error, reload } = useNotes();
  const { resolve } = useNoteActions(reload);
  const today = todayString();
  const editor = useDayBlockEditor(today, reload);
  const { projects } = useProjects(allNotes);
  const { settings } = useSettings();
  const carryOver = useCarryOver(allNotes, today, settings.carryOverPlans, reload);
  const notes = allNotes.filter((note) => note.date === today);

  const count = notes.length;
  const summary = count === 0 ? 'No updates yet today' : `${count} ${count === 1 ? 'update' : 'updates'} today`;

  return (
    <Screen>
      <ScreenHeader caption={greeting()} title={formatLongDate()} subtitle={summary} />

      <View style={styles.quickRow}>
        {TYPES.map((type) => (
          <View key={type} style={styles.quickItem}>
            <QuickAddButton type={type} onPress={() => editor.startEditing(type)} />
          </View>
        ))}
      </View>

      <Button
        label="Generate Standup"
        icon="document-text-outline"
        variant="secondary"
        onPress={() => router.push('/standup')}
      />

      {loading && <ActivityIndicator color={colors.primary} style={styles.loading} />}

      {!loading && error && <EmptyState icon="alert-circle-outline" title="Couldn't load updates" message={error} />}

      {!loading && !error && carryOver.candidates.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Carry over" count={carryOver.candidates.length} />
          {carryOver.candidates.map((plan) => (
            <CarryOverCard
              key={plan.id}
              plan={plan}
              onAccept={() => carryOver.accept(plan)}
              onDismiss={() => carryOver.dismiss(plan)}
            />
          ))}
        </View>
      )}

      {!loading && !error && count === 0 && editor.editingType === null && (
        <EmptyState
          icon="create-outline"
          title="No updates yet"
          message="Start logging what you worked on today."
          actionLabel="Add Update"
          onAction={() => editor.startEditing('DONE')}
        />
      )}

      {!loading && !error && count > 0 && <TimesheetActions notes={allNotes} date={today} />}

      {!loading &&
        !error &&
        TYPES.map((type) => {
          const group = notes
            .filter((note) => note.type === type)
            // Active blockers first, resolved ones sink to the bottom; otherwise in the order added.
            .sort((a, b) => Number(a.resolved) - Number(b.resolved) || a.createdAt.localeCompare(b.createdAt));
          // A category with no updates only shows while you are adding its first one.
          if (group.length === 0 && editor.editingType !== type) return null;
          return (
            <NoteGroupCard
              key={type}
              type={type}
              notes={group}
              editing={editor.editingType === type}
              onStartEdit={() => editor.startEditing(type)}
              onCancel={editor.cancel}
              onSave={(values) => editor.save(type, group, values)}
              onResolve={resolve}
              projectSuggestions={projects}
            />
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
