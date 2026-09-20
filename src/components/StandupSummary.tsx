import { StyleSheet, Text, View } from 'react-native';

import { fontSize, radius, spacing } from '@/constants/theme';
import { useCopyShare } from '@/hooks/useCopyShare';
import { useTheme } from '@/hooks/useTheme';

import { Button } from './Button';

type Props = { text: string; copyLabel?: string; shareLabel?: string };

// A card showing generated text (selectable) with Copy and Share buttons.
export function StandupSummary({ text, copyLabel = 'Copy', shareLabel = 'Share' }: Props) {
  const { colors, cardShadow } = useTheme();
  const { copied, copy, share } = useCopyShare(text);
  return (
    <View style={styles.container}>
      <View style={[styles.card, cardShadow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text selectable style={[styles.text, { color: colors.text }]}>
          {text}
        </Text>
      </View>
      <View style={styles.actions}>
        <Button
          label={copied ? 'Copied!' : copyLabel}
          icon={copied ? 'checkmark' : 'copy-outline'}
          onPress={copy}
          style={styles.action}
        />
        <Button label={shareLabel} icon="share-outline" variant="secondary" onPress={share} style={styles.action} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  card: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth },
  text: { fontSize: fontSize.bodyLarge, lineHeight: 24 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
