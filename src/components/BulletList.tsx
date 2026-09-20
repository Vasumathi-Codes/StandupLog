import { StyleSheet, Text, View } from 'react-native';

import { fontSize, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export function BulletList({ items }: { items: string[] }) {
  const { colors } = useTheme();
  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <View key={index} style={styles.row}>
          <Text style={[styles.bullet, { color: colors.textMuted }]}>•</Text>
          <Text style={[styles.text, { color: colors.text }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  bullet: { fontSize: fontSize.bodyLarge, lineHeight: 22 },
  text: { flex: 1, fontSize: fontSize.body, lineHeight: 22 },
});
