import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

// Read-only sample of generated text, produced by the real generators.
export function FormatPreview({ title, description, text, footnote }: { title: string; description: string; text: string; footnote?: string }) {
  const { colors, cardShadow } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{title.toUpperCase()}</Text>
      <View style={[styles.card, cardShadow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text selectable style={[styles.text, { color: colors.text }]}>
          {text}
        </Text>
      </View>
      {footnote && <Text style={[styles.footnote, { color: colors.textMuted }]}>{footnote}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  description: { fontSize: fontSize.body, lineHeight: 21 },
  label: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold, letterSpacing: 0.6 },
  card: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth },
  text: { fontSize: fontSize.bodyLarge, lineHeight: 24 },
  footnote: { fontSize: fontSize.small },
});
