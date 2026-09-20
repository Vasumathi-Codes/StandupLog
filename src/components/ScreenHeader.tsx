import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, iconSize, MIN_TOUCH, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

import { PressableScale } from './PressableScale';

type Props = { title: string; subtitle?: string; caption?: string };

export function ScreenHeader({ title, subtitle, caption }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        {caption && <Text style={[styles.caption, { color: colors.textSecondary }]}>{caption}</Text>}
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
        {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      <PressableScale
        onPress={() => router.push('/settings')}
        accessibilityRole="button"
        accessibilityLabel="Settings"
        style={[styles.settings, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="settings-outline" size={iconSize.md} color={colors.textSecondary} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  texts: { flex: 1, gap: spacing.xs },
  caption: { fontSize: fontSize.small, fontWeight: fontWeight.medium },
  title: { fontSize: fontSize.title, fontWeight: fontWeight.bold, letterSpacing: -0.5 },
  subtitle: { fontSize: fontSize.body },
  settings: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
