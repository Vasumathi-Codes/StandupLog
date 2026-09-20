import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, NOTE_TYPE_META, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Note, NoteType } from '@/types/note';
import { formatMonthDay } from '@/utils/date';

import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { NoteCard } from './NoteCard';
import { SectionHeader } from './SectionHeader';

const TYPES: NoteType[] = ['DONE', 'PLAN', 'BLOCKER'];

type Props = {
  date: string;
  notes: Note[];
  onAdd: () => void;
  onEdit: (note: Note) => void;
  onMore: (note: Note) => void;
  onResolve: (note: Note) => void;
};

export function DayNotes({ date, notes, onAdd, onEdit, onMore, onResolve }: Props) {
  const { colors } = useTheme();
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

      {notes.length === 0 ? (
        <EmptyState
          icon="create-outline"
          title="No updates yet"
          message="Nothing logged for this day."
          actionLabel="Add Update"
          onAction={onAdd}
        />
      ) : (
        <>
          {TYPES.map((type) => {
            const group = notes
              .filter((note) => note.type === type)
              .sort((a, b) => Number(a.resolved) - Number(b.resolved));
            if (group.length === 0) return null;
            return (
              <View key={type} style={styles.section}>
                <SectionHeader title={NOTE_TYPE_META[type].plural} count={group.length} type={type} />
                {group.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onPress={() => onEdit(note)}
                    onMorePress={() => onMore(note)}
                    onResolve={() => onResolve(note)}
                  />
                ))}
              </View>
            );
          })}
          <Button label="Add Update" icon="add" onPress={onAdd} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  header: { gap: spacing.xs },
  title: { fontSize: fontSize.section + 2, fontWeight: fontWeight.bold },
  count: { fontSize: fontSize.body },
  section: { gap: spacing.md },
});
