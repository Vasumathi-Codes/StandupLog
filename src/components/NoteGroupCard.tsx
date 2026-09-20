import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { fontSize, fontWeight, getTypeColors, iconSize, MIN_TOUCH, NOTE_TYPE_META, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Note, NoteType } from '@/types/note';

import { Button } from './Button';
import { PressableScale } from './PressableScale';

export type GroupEdits = { updates: { id: string; text: string }[]; deletedIds: string[] };

type Props = {
  type: NoteType;
  notes: Note[];
  onPress: (note: Note) => void; // open the full editor for one note
  onMorePress: (note: Note) => void;
  onResolve: (note: Note) => void;
  // Saves inline edits. Resolves true on success.
  onSaveEdits: (edits: GroupEdits) => Promise<boolean>;
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// One card holding all of a day's notes of one type, with its own header.
// "Edit" turns every row into a text box so the whole card can be changed at once.
export function NoteGroupCard({ type, notes, onPress, onMorePress, onResolve, onSaveEdits }: Props) {
  const { colors, cardShadow } = useTheme();
  const typeColors = getTypeColors(colors, type);
  const { plural, icon } = NOTE_TYPE_META[type];
  const hasActiveBlocker = type === 'BLOCKER' && notes.some((note) => !note.resolved);

  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setDrafts(Object.fromEntries(notes.map((note) => [note.id, note.text])));
    setRemoved(new Set());
    setError(null);
    setEditing(true);
  };

  const toggleRemoved = (id: string) =>
    setRemoved((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const save = async () => {
    const kept = notes.filter((note) => !removed.has(note.id));
    if (kept.some((note) => !(drafts[note.id] ?? '').trim())) {
      setError('An update can’t be empty. Remove the row instead.');
      return;
    }
    setSaving(true);
    const ok = await onSaveEdits({
      updates: kept.filter((note) => drafts[note.id].trim() !== note.text).map((note) => ({ id: note.id, text: drafts[note.id] })),
      deletedIds: [...removed],
    });
    setSaving(false);
    if (ok) setEditing(false);
  };

  return (
    <View
      style={[
        styles.card,
        cardShadow,
        { backgroundColor: hasActiveBlocker ? typeColors.tint : colors.surface, borderColor: colors.border },
        hasActiveBlocker && { borderLeftColor: typeColors.accent, borderLeftWidth: 3 },
      ]}>
      <View style={styles.header}>
        <Ionicons name={icon} size={iconSize.md} color={typeColors.accent} />
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
          {plural}
        </Text>
        <Text style={[styles.count, { color: colors.textMuted }]}>{notes.length}</Text>
        <View style={styles.spacer} />
        {!editing && (
          <PressableScale
            onPress={startEditing}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${plural}`}
            style={[styles.editButton, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name="pencil" size={iconSize.sm} color={colors.textSecondary} />
            <Text style={[styles.editLabel, { color: colors.textSecondary }]}>Edit</Text>
          </PressableScale>
        )}
      </View>

      {notes.map((note) => {
        const isResolved = type === 'BLOCKER' && note.resolved;
        const isRemoved = removed.has(note.id);
        const rowStyle = [styles.row, { borderTopColor: colors.border }, isResolved && !editing && styles.dim];

        if (editing) {
          return (
            <View key={note.id} style={rowStyle}>
              <Text style={[styles.time, styles.editTime, { color: colors.textMuted }]}>{formatTime(note.createdAt)}</Text>
              <TextInput
                value={drafts[note.id]}
                onChangeText={(text) => setDrafts((current) => ({ ...current, [note.id]: text }))}
                editable={!isRemoved && !saving}
                multiline
                accessibilityLabel={`${plural} update at ${formatTime(note.createdAt)}`}
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  { backgroundColor: colors.surfaceSecondary, color: colors.text },
                  isRemoved && styles.strike,
                  isRemoved && styles.dim,
                ]}
              />
              <PressableScale
                onPress={() => toggleRemoved(note.id)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={isRemoved ? 'Undo remove' : 'Remove update'}
                style={styles.more}>
                <Ionicons
                  name={isRemoved ? 'arrow-undo-outline' : 'trash-outline'}
                  size={iconSize.md}
                  color={isRemoved ? colors.primary : colors.error}
                />
              </PressableScale>
            </View>
          );
        }

        return (
          <View key={note.id} style={rowStyle}>
            {/* Only this area opens the full editor; "more" and Resolve are siblings, never nested. */}
            <PressableScale
              onPress={() => onPress(note)}
              scaleTo={0.985}
              accessibilityRole="button"
              accessibilityLabel={`${NOTE_TYPE_META[type].label}${isResolved ? ', resolved' : ''}, ${formatTime(note.createdAt)}: ${note.text}. Open`}
              style={styles.main}>
              <Text style={[styles.time, { color: colors.textMuted }]}>{formatTime(note.createdAt)}</Text>
              <View style={styles.content}>
                <Text style={[styles.text, { color: colors.text }, isResolved && styles.strike]}>{note.text}</Text>
                {(note.project || isResolved) && (
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>
                    {[note.project, isResolved ? 'Resolved' : null].filter(Boolean).join(' • ')}
                  </Text>
                )}
              </View>
            </PressableScale>
            <PressableScale
              onPress={() => onMorePress(note)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="More actions"
              style={styles.more}>
              <Ionicons name="ellipsis-horizontal" size={iconSize.md} color={colors.textMuted} />
            </PressableScale>
            {type === 'BLOCKER' && !isResolved && (
              <Button label="Resolve" variant="secondary" icon="checkmark" onPress={() => onResolve(note)} style={styles.resolve} />
            )}
          </View>
        );
      })}

      {editing && (
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
          <View style={styles.footerButtons}>
            <Button label="Cancel" variant="secondary" onPress={() => setEditing(false)} disabled={saving} style={styles.footerButton} />
            <Button label="Save" onPress={save} disabled={saving} style={styles.footerButton} />
          </View>
        </View>
      )}
    </View>
  );
}

const TIME_WIDTH = 64;

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingLeft: spacing.lg, paddingRight: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xs },
  title: { fontSize: fontSize.section, fontWeight: fontWeight.semibold },
  count: { fontSize: fontSize.small, fontWeight: fontWeight.medium },
  spacer: { flex: 1 },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minHeight: 32, paddingHorizontal: spacing.md, borderRadius: radius.pill },
  editLabel: { fontSize: fontSize.small, fontWeight: fontWeight.semibold },
  // Wraps so the Resolve button drops onto its own line under the text.
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', paddingLeft: spacing.lg, paddingRight: spacing.xs, paddingVertical: spacing.xs, borderTopWidth: StyleSheet.hairlineWidth },
  dim: { opacity: 0.6 },
  main: { flex: 1, flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm },
  time: { width: TIME_WIDTH - spacing.sm, fontSize: fontSize.small, fontWeight: fontWeight.medium, paddingTop: 2 },
  editTime: { paddingTop: spacing.md },
  content: { flex: 1, gap: 2 },
  text: { fontSize: fontSize.bodyLarge, lineHeight: 22 },
  strike: { textDecorationLine: 'line-through' },
  meta: { fontSize: fontSize.small },
  input: { flex: 1, minHeight: MIN_TOUCH, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.bodyLarge, marginVertical: spacing.xs },
  more: { width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  resolve: { marginLeft: TIME_WIDTH, marginBottom: spacing.sm },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, padding: spacing.md, gap: spacing.sm },
  footerButtons: { flexDirection: 'row', gap: spacing.sm },
  footerButton: { flex: 1 },
  error: { fontSize: fontSize.small },
});
