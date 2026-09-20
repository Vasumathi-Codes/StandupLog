import { Ionicons } from '@expo/vector-icons';
import { Children, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, iconSize, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  children: ReactNode;
  destructive?: boolean;
};

// A titled group of settings rows in ONE card, with thin separators between rows.
export function SettingsSection({ title, icon, children, destructive }: Props) {
  const { colors, cardShadow } = useTheme();
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Ionicons name={icon} size={iconSize.sm} color={colors.textSecondary} />
        <Text accessibilityRole="header" style={[styles.title, { color: colors.textSecondary }]}>
          {title.toUpperCase()}
        </Text>
      </View>
      <View
        style={[
          styles.card,
          cardShadow,
          { backgroundColor: colors.surface, borderColor: destructive ? colors.error : colors.border },
        ]}>
        {rows.map((row, index) => (
          <View key={index}>
            {index > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            {row}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.xs },
  title: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold, letterSpacing: 0.6 },
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: spacing.lg },
});
