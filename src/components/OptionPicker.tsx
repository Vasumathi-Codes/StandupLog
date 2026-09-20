import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, MIN_TOUCH, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

import { PressableScale } from './PressableScale';

type Props<T extends string> = {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

// Segmented control: pick one of a few options.
export function OptionPicker<T extends string>({ label, value, options, onChange }: Props<T>) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={[styles.track, { backgroundColor: colors.surfaceSecondary }]} accessibilityRole="radiogroup">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <PressableScale
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ selected }}
              scaleTo={0.98}
              style={[styles.option, selected && { backgroundColor: colors.primaryDark }]}>
              <Text style={[styles.optionText, { color: selected ? colors.onPrimary : colors.textSecondary }]}>
                {option.label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  label: { fontSize: fontSize.bodyLarge, fontWeight: fontWeight.medium },
  track: { flexDirection: 'row', padding: 3, borderRadius: radius.md },
  option: { flex: 1, minHeight: MIN_TOUCH - 6, borderRadius: radius.md - 3, alignItems: 'center', justifyContent: 'center' },
  optionText: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
});
