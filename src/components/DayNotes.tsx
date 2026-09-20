import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, spacing } from '@/constants/theme';
import { useDayBlockEditor } from '@/hooks/useDayBlockEditor';
import { useTheme } from '@/hooks/useTheme';
import { Note, NoteType } from '@/types/note';
import { formatMonthDay } from '@/utils/date';

import { EmptyState } from './EmptyState';
import { NoteGroupCard } from './NoteGroupCard';
import { QuickAddButton } from './QuickAddButton';
import { TimesheetActions } from './TimesheetActions';

const TYPES: NoteType[] = ['DONE', 'PLAN', 'BLOCKER'];

type Props = {
  date: string;
  notes: Note[]; // the notes shown for this date (may be filtered by project)
  // Every note (not just the ones shown), so a project filter can't silently trim the timesheet.
  timesheetNotes: Note[];
  editor: ReturnType<typeof useDayBlockEditor>;
  onResolve: (note: Note) => void;
  projectSuggestions: string[];
};

export function DayNotes({ date, notes, timesheetNotes, editor, onResolve, projectSuggestions }: Props) {
  const { colors } = useTheme();
  const groups = TYPES.map((type) => ({
    type,
    notes: notes
      .filter((note) => note.type === type)
      .sort((a, b) => Number(a.resolved) - Number(b.resolved) || a.createdAt.localeCompare(b.createdAt)),
  }));
  const visible = groups.filter((group) => group.notes.length > 0 || editor.editingType === group.type);
  const missing = groups.filter((group) => !visible.includes(group));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
          {formatMonthDay(date, true)}
        </Text>
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {notes.length === 0 ? 'No updates' : `${notes.length} ${notes.length === 1 ? 'update' : 'updates'}`}
        </Text>
      </View>

      {notes.length > 0 && <TimesheetActions notes={timesheetNotes} date={date} />}

      {visible.length === 0 && (
        <EmptyState
          icon="create-outline"
          title="No updates yet"
          message="Nothing logged for this day."
          actionLabel="Add Update"
          onAction={() => editor.startEditing('DONE')}
        />
      )}

      {visible.map(({ type, notes: groupNotes }) => (
        <NoteGroupCard
          key={type}
          type={type}
          notes={groupNotes}
          editing={editor.editingType === type}
          onStartEdit={() => editor.startEditing(type)}
          onCancel={editor.cancel}
          onSave={(values) => editor.save(type, groupNotes, values)}
          onResolve={onResolve}
          projectSuggestions={projectSuggestions}
        />
      ))}

      {visible.length > 0 && missing.length > 0 && (
        <View style={styles.addRow}>
          {missing.map(({ type }) => (
            <View key={type} style={styles.addItem}>
              <QuickAddButton type={type} onPress={() => editor.startEditing(type)} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  header: { gap: spacing.xs },
  title: { fontSize: fontSize.section + 2, fontWeight: fontWeight.bold },
  count: { fontSize: fontSize.body },
  addRow: { flexDirection: 'row', gap: spacing.sm },
  addItem: { flex: 1 },
});
