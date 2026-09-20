import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text } from 'react-native';

import { fontSize, fontWeight, getTypeColors, iconSize, MIN_TOUCH, NOTE_TYPE_META, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { NoteType } from '@/types/note';

import { PressableScale } from './PressableScale';

export function QuickAddButton({ type, onPress }: { type: NoteType; onPress: () => void }) {
  const { colors, cardShadow } = useTheme();
  const typeColors = getTypeColors(colors, type);
  const { label, icon } = NOTE_TYPE_META[type];
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Add ${label} update`}
      style={[styles.button, cardShadow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name={icon} size={iconSize.md} color={typeColors.accent} />
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_TOUCH + 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
});
