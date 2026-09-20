import { ReactNode } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { fontSize, fontWeight, MIN_TOUCH, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  children?: ReactNode; // extra controls shown under the row when relevant
};

export function SettingRow({ title, description, value, onValueChange, disabled, children }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.texts}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {description && <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>}
        </View>
        <Switch
          value={value}
          disabled={disabled}
          onValueChange={onValueChange}
          accessibilityLabel={title}
          trackColor={{ true: colors.primaryDark, false: colors.border }}
        />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: MIN_TOUCH },
  texts: { flex: 1, gap: 2 },
  title: { fontSize: fontSize.bodyLarge, fontWeight: fontWeight.medium },
  description: { fontSize: fontSize.small, lineHeight: 18 },
});
