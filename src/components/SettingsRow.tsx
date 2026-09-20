import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { fontSize, fontWeight, iconSize, MIN_TOUCH, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  title: string;
  description?: string;
  // Show a switch on the right.
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  switchDisabled?: boolean;
  // Make the whole row a button with a chevron. `value` is the current choice shown on the right.
  onPress?: () => void;
  value?: string;
  destructive?: boolean;
  // Extra content under the text (a picker, a time field...).
  children?: ReactNode;
};

export function SettingsRow({ title, description, switchValue, onSwitchChange, switchDisabled, onPress, value, destructive, children }: Props) {
  const { colors } = useTheme();
  const hasSwitch = switchValue !== undefined && onSwitchChange !== undefined;

  const content = (
    <>
      <View style={styles.top}>
        <View style={styles.texts}>
          <Text style={[styles.title, { color: destructive ? colors.error : colors.text }]}>{title}</Text>
          {description && <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>}
        </View>
        {value !== undefined && <Text style={[styles.value, { color: colors.textSecondary }]}>{value}</Text>}
        {hasSwitch && (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            disabled={switchDisabled}
            accessibilityLabel={title}
            trackColor={{ true: colors.primaryDark, false: colors.border }}
          />
        )}
        {onPress && <Ionicons name="chevron-forward" size={iconSize.md} color={colors.textMuted} />}
      </View>
      {children}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={value ? `${title}, ${value}` : title}
        style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceSecondary }]}>
        {content}
      </Pressable>
    );
  }
  return <View style={styles.row}>{content}</View>;
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md, minHeight: MIN_TOUCH + spacing.md },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  texts: { flex: 1, gap: 2 },
  title: { fontSize: fontSize.bodyLarge, fontWeight: fontWeight.medium },
  description: { fontSize: fontSize.small, lineHeight: 18 },
  value: { fontSize: fontSize.body },
});
