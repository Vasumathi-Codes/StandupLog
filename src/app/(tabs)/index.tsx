import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { NoteCard } from '@/components/NoteCard';
import { QuickAddButton } from '@/components/QuickAddButton';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionHeader } from '@/components/SectionHeader';
import { TimesheetActions } from '@/components/TimesheetActions';
import { NOTE_TYPE_META, spacing } from '@/constants/theme';
import { CarryOverCard } from '@/components/CarryOverCard';
import { useCarryOver } from '@/hooks/useCarryOver';
import { useSettings } from '@/hooks/useSettings';
import { useNoteActions } from '@/hooks/useNoteActions';
import { useNotes } from '@/hooks/useNotes';
import { useTheme } from '@/hooks/useTheme';
import { NoteType } from '@/types/note';
import { formatLongDate, greeting, todayString } from '@/utils/date';

const TYPES: NoteType[] = ['DONE', 'PLAN', 'BLOCKER'];

export default function TodayScreen() {
  const { colors } = useTheme();
  const { notes: allNotes, loading, error, reload } = useNotes();
  const { edit, openMenu, resolve } = useNoteActions(reload);
  const today = todayString();
  const { settings } = useSettings();
  const carryOver = useCarryOver(allNotes, today, settings.carryOverPlans, reload);
  const notes = allNotes.filter((note) => note.date === today);

  const openAdd = (type: NoteType) => router.push({ pathname: '/add-note', params: { type, date: today } });

  const count = notes.length;
  const summary = count === 0 ? 'No updates yet today' : `${count} ${count === 1 ? 'update' : 'updates'} today`;

  return (
    <Screen>
      <ScreenHeader caption={greeting()} title={formatLongDate()} subtitle={summary} />

      <View style={styles.quickRow}>
        {TYPES.map((type) => (
          <View key={type} style={styles.quickItem}>
            <QuickAddButton type={type} onPress={() => openAdd(type)} />
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

      {!loading && !error && count === 0 && (
        <EmptyState
          icon="create-outline"
          title="No updates yet"
          message="Start logging what you worked on today."
          actionLabel="Add Update"
          onAction={() => openAdd('DONE')}
        />
      )}

      {!loading && !error && count > 0 && <TimesheetActions notes={allNotes} date={today} />}

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
                <NoteCard
                  key={note.id}
                  note={note}
                  onPress={() => edit(note)}
                  onMorePress={() => openMenu(note)}
                  onResolve={() => resolve(note)}
                />
              ))}
            </View>
          );
        })}

      {!loading && !error && count > 0 && <Button label="Add Update" icon="add" onPress={() => openAdd('DONE')} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  quickRow: { flexDirection: 'row', gap: spacing.sm },
  quickItem: { flex: 1 },
  loading: { paddingVertical: spacing.xl },
  section: { gap: spacing.md },
});
