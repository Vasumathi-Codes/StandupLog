import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { fontSize, fontWeight, iconSize, MIN_TOUCH, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

import { PressableScale } from './PressableScale';

type Props = {
  projects: string[];
  selected: string | null;
  onSelect: (project: string | null) => void;
  // Show an "All" chip that clears the selection (filters). Form suggestions leave it off.
  showAll?: boolean;
  // When provided, a "+ New" chip lets the user type a new project name.
  onAddProject?: (name: string) => void;
  // When provided, long-pressing a project chip asks to delete it.
  onRemoveProject?: (name: string) => void;
};

export function ProjectChips({ projects, selected, onSelect, showAll = true, onAddProject, onRemoveProject }: Props) {
  const { colors } = useTheme();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  if (projects.length === 0 && !onAddProject) return null;

  const finishAdding = (save: boolean) => {
    if (save && draft.trim()) onAddProject?.(draft.trim());
    setDraft('');
    setAdding(false);
  };

  const chip = (label: string, value: string | null) => {
    const active = selected === value;
    return (
      <PressableScale
        key={label}
        onPress={() => onSelect(active && value !== null && !showAll ? null : value)}
        onLongPress={value !== null && onRemoveProject ? () => onRemoveProject(value) : undefined}
        accessibilityHint={value !== null && onRemoveProject ? 'Long press to delete this project' : undefined}
        accessibilityRole="button"
        accessibilityLabel={`${label}${active ? ', selected' : ''}`}
        accessibilityState={{ selected: active }}
        style={[styles.chip, { backgroundColor: active ? colors.primaryDark : colors.surfaceSecondary }]}>
        <Text style={[styles.label, { color: active ? colors.onPrimary : colors.textSecondary }]}>{label}</Text>
      </PressableScale>
    );
  };

  return (
    <View style={styles.container}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} keyboardShouldPersistTaps="handled">
      {showAll && chip('All', null)}
      {projects.map((project) => chip(project, project))}
      {onAddProject &&
        (adding ? (
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => finishAdding(true)}
            onBlur={() => finishAdding(true)}
            placeholder="Project name"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="New project name"
            autoFocus
            autoCapitalize="none"
            returnKeyType="done"
            maxLength={30}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.primary, color: colors.text }]}
          />
        ) : (
          <PressableScale
            onPress={() => setAdding(true)}
            accessibilityRole="button"
            accessibilityLabel="Add new project"
            style={[styles.chip, styles.addChip, { borderColor: colors.border }]}>
            <Ionicons name="add" size={iconSize.sm} color={colors.textSecondary} />
            <Text style={[styles.label, { color: colors.textSecondary }]}>New</Text>
          </PressableScale>
        ))}
    </ScrollView>
    {onRemoveProject && projects.length > 0 && (
      <Text style={[styles.hint, { color: colors.textMuted }]}>Long-press a project to delete it</Text>
    )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  hint: { fontSize: fontSize.caption },
  row: { gap: spacing.sm, alignItems: 'center' },
  chip: { minHeight: MIN_TOUCH - 8, paddingHorizontal: spacing.md, borderRadius: radius.pill, justifyContent: 'center' },
  addChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderWidth: 1, borderStyle: 'dashed' },
  label: { fontSize: fontSize.small, fontWeight: fontWeight.semibold },
  input: {
    minWidth: 130,
    minHeight: MIN_TOUCH - 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    fontSize: fontSize.small,
  },
});
