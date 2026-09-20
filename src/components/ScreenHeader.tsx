import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, iconSize, MIN_TOUCH, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

import { PressableScale } from './PressableScale';

type Props = { title: string; subtitle?: string; caption?: string };

export function ScreenHeader({ title, subtitle, caption }: Props) {
  const { colors } = useTheme();
  const iconButton = (icon: 'search-outline' | 'settings-outline', label: string, href: '/search' | '/settings') => (
    <PressableScale
      onPress={() => router.push(href)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name={icon} size={iconSize.md} color={colors.textSecondary} />
    </PressableScale>
  );

  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        {caption && <Text style={[styles.caption, { color: colors.textSecondary }]}>{caption}</Text>}
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
        {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      <View style={styles.buttons}>
        {iconButton('search-outline', 'Search', '/search')}
        {iconButton('settings-outline', 'Settings', '/settings')}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  texts: { flex: 1, gap: spacing.xs },
  caption: { fontSize: fontSize.small, fontWeight: fontWeight.medium },
  title: { fontSize: fontSize.title, fontWeight: fontWeight.bold, letterSpacing: -0.5 },
  subtitle: { fontSize: fontSize.body },
  buttons: { flexDirection: 'row', gap: spacing.sm },
  iconButton: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
