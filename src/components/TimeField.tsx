import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, MIN_TOUCH, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

import { PressableScale } from './PressableScale';

type Props = { label: string; hour: number; minute: number; onChange: (hour: number, minute: number) => void };

function formatTime(hour: number, minute: number): string {
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function TimeField({ label, hour, minute, onChange }: Props) {
  const { colors, isDark } = useTheme();
  const value = new Date(2000, 0, 1, hour, minute);

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      {Platform.OS === 'ios' ? (
        // iOS has an inline compact picker that opens by tapping the time.
        <DateTimePicker
          value={value}
          mode="time"
          display="compact"
          themeVariant={isDark ? 'dark' : 'light'}
          onChange={(_, selected) => selected && onChange(selected.getHours(), selected.getMinutes())}
        />
      ) : (
        // Android shows a dialog, opened imperatively.
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${formatTime(hour, minute)}. Change`}
          onPress={() =>
            DateTimePickerAndroid.open({
              value,
              mode: 'time',
              onChange: (_, selected) => selected && onChange(selected.getHours(), selected.getMinutes()),
            })
          }
          style={[styles.androidButton, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[styles.androidText, { color: colors.text }]}>{formatTime(hour, minute)}</Text>
        </PressableScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: MIN_TOUCH },
  label: { fontSize: fontSize.body },
  androidButton: { minHeight: MIN_TOUCH - 4, paddingHorizontal: spacing.lg, borderRadius: radius.md, justifyContent: 'center' },
  androidText: { fontSize: fontSize.bodyLarge, fontWeight: fontWeight.semibold },
});
