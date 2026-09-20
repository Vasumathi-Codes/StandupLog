import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, getTypeColors, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { NoteType } from '@/types/note';

type Props = { value: string | number; label: string; type: NoteType };

export function StatCard({ value, label, type }: Props) {
  const { colors, cardShadow } = useTheme();
  const typeColors = getTypeColors(colors, type);
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.card, cardShadow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <View style={styles.labelRow}>
        <View style={[styles.dot, { backgroundColor: typeColors.accent }]} />
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, padding: spacing.md, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, gap: spacing.xs },
  value: { fontSize: fontSize.stat, fontWeight: fontWeight.bold, letterSpacing: -0.5 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: radius.pill },
  label: { fontSize: fontSize.small, fontWeight: fontWeight.medium },
});
