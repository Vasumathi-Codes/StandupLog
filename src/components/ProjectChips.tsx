import { ScrollView, StyleSheet, Text } from 'react-native';

import { fontSize, fontWeight, MIN_TOUCH, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

import { PressableScale } from './PressableScale';

type Props = {
  projects: string[];
  selected: string | null;
  onSelect: (project: string | null) => void;
  // Show an "All" chip that clears the selection (filters). Form suggestions leave it off.
  showAll?: boolean;
};

export function ProjectChips({ projects, selected, onSelect, showAll = true }: Props) {
  const { colors } = useTheme();
  if (projects.length === 0) return null;

  const chip = (label: string, value: string | null) => {
    const active = selected === value;
    return (
      <PressableScale
        key={label}
        onPress={() => onSelect(active && value !== null && !showAll ? null : value)}
        accessibilityRole="button"
        accessibilityLabel={`${label}${active ? ', selected' : ''}`}
        accessibilityState={{ selected: active }}
        style={[
          styles.chip,
          { backgroundColor: active ? colors.primaryDark : colors.surfaceSecondary },
        ]}>
        <Text style={[styles.label, { color: active ? colors.onPrimary : colors.textSecondary }]}>{label}</Text>
      </PressableScale>
    );
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} keyboardShouldPersistTaps="handled">
      {showAll && chip('All', null)}
      {projects.map((project) => chip(project, project))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm },
  chip: { minHeight: MIN_TOUCH - 8, paddingHorizontal: spacing.md, borderRadius: radius.pill, justifyContent: 'center' },
  label: { fontSize: fontSize.small, fontWeight: fontWeight.semibold },
});
