import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, getTypeColors, iconSize, NOTE_TYPE_META, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { NoteType } from '@/types/note';

// Icon + text + colour, so the type never depends on colour alone.
export function NoteTypeBadge({ type, label }: { type: NoteType; label?: string }) {
  const { colors } = useTheme();
  const typeColors = getTypeColors(colors, type);
  return (
    <View style={[styles.badge, { backgroundColor: typeColors.tint }]}>
      <Ionicons name={NOTE_TYPE_META[type].icon} size={iconSize.sm} color={typeColors.accent} />
      <Text style={[styles.label, { color: typeColors.text }]}>{label ?? NOTE_TYPE_META[type].label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  label: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold, letterSpacing: 0.3 },
});
