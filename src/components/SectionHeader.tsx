import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, getTypeColors, iconSize, NOTE_TYPE_META, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { NoteType } from '@/types/note';

type Props = { title: string; count?: number; type?: NoteType };

export function SectionHeader({ title, count, type }: Props) {
  const { colors } = useTheme();
  const typeColors = type ? getTypeColors(colors, type) : undefined;
  return (
    <View style={styles.row}>
      {type && <Ionicons name={NOTE_TYPE_META[type].icon} size={iconSize.md} color={typeColors?.accent} />}
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      {count !== undefined && <Text style={[styles.count, { color: colors.textMuted }]}>{count}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontSize: fontSize.section, fontWeight: fontWeight.semibold },
  count: { fontSize: fontSize.small, fontWeight: fontWeight.medium },
});
