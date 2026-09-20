import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { fontSize, fontWeight, MIN_TOUCH, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { NoteType } from '@/types/note';

import { Button } from './Button';
import { NoteTypeSelector } from './NoteTypeSelector';

export type NoteFormValues = { type: NoteType; text: string; project: string };

type Props = {
  initialValues: NoteFormValues;
  dateLabel: string;
  submitLabel: string;
  // Should throw an Error with a friendly message if saving fails.
  onSubmit: (values: NoteFormValues) => Promise<void>;
  onCancel: () => void;
  // When provided (editing), shows a Delete button.
  onDelete?: () => void;
};

const PLACEHOLDER: Record<NoteType, string> = {
  DONE: 'What did you finish?',
  PLAN: 'What do you plan to do?',
  BLOCKER: "What's blocking you?",
};

export function NoteForm({ initialValues, dateLabel, submitLabel, onSubmit, onCancel, onDelete }: Props) {
  const { colors } = useTheme();
  const [type, setType] = useState(initialValues.type);
  const [text, setText] = useState(initialValues.text);
  const [project, setProject] = useState(initialValues.project);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = text.trim().length > 0 && !saving;

  const handleSubmit = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ type, text, project });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save. Please try again.');
      setSaving(false);
    }
  };

  const inputStyle = [styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }];

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.date, { color: colors.textSecondary }]}>{dateLabel}</Text>

        <NoteTypeSelector value={type} onChange={setType} />

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={PLACEHOLDER[type]}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Update text"
          autoFocus
          multiline
          textAlignVertical="top"
          style={[...inputStyle, styles.textInput]}
        />

        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Project (optional)</Text>
          <TextInput
            value={project}
            onChangeText={setProject}
            placeholder="e.g. MyEHE"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Project or tag"
            autoCapitalize="none"
            returnKeyType="done"
            style={inputStyle}
          />
        </View>

        {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}

        <View style={styles.actions}>
          <Button label="Cancel" variant="secondary" onPress={onCancel} style={styles.action} />
          <Button label={submitLabel} onPress={handleSubmit} disabled={!canSave} style={styles.action} />
        </View>

        {onDelete && <Button label="Delete update" variant="destructive" icon="trash-outline" onPress={onDelete} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg },
  date: { fontSize: fontSize.small, fontWeight: fontWeight.medium },
  input: {
    minHeight: MIN_TOUCH,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.bodyLarge,
  },
  textInput: { minHeight: 120 },
  field: { gap: spacing.xs },
  fieldLabel: { fontSize: fontSize.small, fontWeight: fontWeight.medium },
  error: { fontSize: fontSize.small },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
