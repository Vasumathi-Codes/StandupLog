import { Ionicons } from '@expo/vector-icons';
import { StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { fontSize, fontWeight, iconSize, MIN_TOUCH, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

import { PressableScale } from './PressableScale';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = 'primary', icon, disabled, style }: Props) {
  const { colors } = useTheme();
  const look = {
    primary: { bg: colors.primaryDark, fg: colors.onPrimary },
    secondary: { bg: colors.surfaceSecondary, fg: colors.text },
    destructive: { bg: colors.errorLight, fg: colors.error },
  }[variant];

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[styles.button, { backgroundColor: look.bg, opacity: disabled ? 0.5 : 1 }, style]}>
      {icon && <Ionicons name={icon} size={iconSize.md} color={look.fg} />}
      <Text style={[styles.label, { color: look.fg }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_TOUCH,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  label: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
});
