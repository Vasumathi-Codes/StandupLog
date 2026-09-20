import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { fontSize, fontWeight, getTypeColors, iconSize, MIN_TOUCH, NOTE_TYPE_META, radius, spacing } from '@/constants/theme';
import { BlockValues } from '@/hooks/useDayBlockEditor';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import { commonProject, notesToEditorText } from '@/services/dayEditor';
import { Note, NoteType } from '@/types/note';

import { Button } from './Button';
import { PressableScale } from './PressableScale';
import { ProjectChips } from './ProjectChips';

type Props = {
  type: NoteType;
  notes: Note[]; // this day's notes of this type, in display order (may be empty while adding)
  editing: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  // Resolves to an error message, or null on success.
  onSave: (values: BlockValues) => Promise<string | null>;
  onResolve: (note: Note) => void;
  projectSuggestions: string[];
};

// One card per category per day. "Edit" turns all its updates into one text box (one update per line).
export function NoteGroupCard({ type, notes, editing, onStartEdit, onCancel, onSave, onResolve, projectSuggestions }: Props) {
  const { colors, cardShadow } = useTheme();
  const { settings } = useSettings();
  const typeColors = getTypeColors(colors, type);
  const { plural, icon } = NOTE_TYPE_META[type];
  const hasActiveBlocker = type === 'BLOCKER' && notes.some((note) => !note.resolved);

  const [text, setText] = useState('');
  const [project, setProject] = useState('');
  const [projectDirty, setProjectDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editable = notes.filter((note) => !note.resolved);
  const shared = commonProject(editable);

  // Fill the editor from the current notes each time editing starts.
  useEffect(() => {
    if (!editing) return;
    setText(notesToEditorText(editable));
    // No shared project (empty group, or none set): start from the default project from Settings.
    setProject(shared === '' ? settings.defaultProject : (shared ?? ''));
    setProjectDirty(false);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const save = async () => {
    setSaving(true);
    setError(await onSave({ text, project, projectDirty }));
    setSaving(false);
  };

  const inputStyle = [styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }];

  return (
    <View
      style={[
        styles.card,
        cardShadow,
        { backgroundColor: typeColors.tint, borderColor: colors.border },
        hasActiveBlocker && !editing && { borderLeftColor: typeColors.accent, borderLeftWidth: 3 },
      ]}>
      <View style={styles.header}>
        <Ionicons name={icon} size={iconSize.md} color={typeColors.accent} />
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
          {plural}
        </Text>
        {!editing && <Text style={[styles.count, { color: colors.textMuted }]}>{notes.length}</Text>}
        <View style={styles.spacer} />
        {!editing && (
          <PressableScale
            onPress={onStartEdit}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${plural}`}
            style={[styles.editButton, { backgroundColor: colors.surface }]}>
            <Ionicons name="pencil" size={iconSize.sm} color={colors.textSecondary} />
            <Text style={[styles.editLabel, { color: colors.textSecondary }]}>Edit</Text>
          </PressableScale>
        )}
      </View>

      {editing ? (
        <View style={styles.editor}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="One update per line"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel={`${plural} updates, one per line`}
            autoFocus
            multiline
            textAlignVertical="top"
            editable={!saving}
            style={[inputStyle, styles.textBlock]}
          />
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Project (optional)</Text>
            <TextInput
              value={project}
              onChangeText={(value) => {
                setProject(value);
                setProjectDirty(true);
              }}
              placeholder={shared === null ? 'Mixed. Leave as is to keep each one' : 'e.g. MyEHE'}
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Project or tag"
              autoCapitalize="none"
              editable={!saving}
              style={inputStyle}
            />
            <ProjectChips
              projects={projectSuggestions}
              selected={project || null}
              onSelect={(value) => {
                setProject(value ?? '');
                setProjectDirty(true);
              }}
              showAll={false}
            />
          </View>
          {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
          <View style={styles.actions}>
            <Button label="Cancel" variant="secondary" onPress={onCancel} disabled={saving} style={styles.action} />
            <Button label="Save" onPress={save} disabled={saving} style={styles.action} />
          </View>
        </View>
      ) : (
        notes.map((note) => {
          const isResolved = type === 'BLOCKER' && note.resolved;
          return (
            <View key={note.id} style={[styles.row, isResolved && styles.dim]}>
              <Text style={[styles.bullet, { color: typeColors.accent }]}>•</Text>
              <Text style={[styles.text, { color: colors.text }, isResolved && styles.strike]}>
                {note.text}
                {note.project ? <Text style={[styles.project, { color: colors.textMuted }]}>{`  ${note.project}`}</Text> : null}
              </Text>
              {type === 'BLOCKER' && !isResolved && (
                <PressableScale
                  onPress={() => onResolve(note)}
                  accessibilityRole="button"
                  accessibilityLabel={`Resolve: ${note.text}`}
                  style={[styles.resolve, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="checkmark" size={iconSize.sm} color={colors.textSecondary} />
                  <Text style={[styles.resolveLabel, { color: colors.textSecondary }]}>Resolve</Text>
                </PressableScale>
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg, gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontSize: fontSize.section, fontWeight: fontWeight.semibold },
  count: { fontSize: fontSize.small, fontWeight: fontWeight.medium },
  spacer: { flex: 1 },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minHeight: 32, paddingHorizontal: spacing.md, borderRadius: radius.pill },
  editLabel: { fontSize: fontSize.small, fontWeight: fontWeight.semibold },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  dim: { opacity: 0.55 },
  bullet: { fontSize: fontSize.bodyLarge, lineHeight: 22, fontWeight: fontWeight.bold },
  text: { flex: 1, fontSize: fontSize.bodyLarge, lineHeight: 22 },
  project: { fontSize: fontSize.small },
  strike: { textDecorationLine: 'line-through' },
  resolve: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 28, paddingHorizontal: spacing.sm, borderRadius: radius.pill, borderWidth: StyleSheet.hairlineWidth },
  resolveLabel: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold },
  editor: { gap: spacing.md },
  input: { minHeight: MIN_TOUCH, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: fontSize.bodyLarge, lineHeight: 22 },
  textBlock: { minHeight: 140 },
  field: { gap: spacing.xs },
  fieldLabel: { fontSize: fontSize.small, fontWeight: fontWeight.medium },
  error: { fontSize: fontSize.small },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
