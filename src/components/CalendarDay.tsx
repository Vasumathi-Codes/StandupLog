import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, MIN_TOUCH, radius } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { formatMonthDay } from '@/utils/date';
import { DaySummary } from '@/utils/notes';

import { CalendarDayIndicators } from './CalendarDayIndicators';
import { PressableScale } from './PressableScale';

type Props = {
  date: string; // YYYY-MM-DD
  summary?: DaySummary;
  isSelected: boolean;
  isToday: boolean;
  onPress: (date: string) => void;
};

function describe(date: string, summary?: DaySummary): string {
  const parts = [formatMonthDay(date)];
  const total = summary?.total ?? 0;
  parts.push(total === 0 ? 'no updates' : `${total} ${total === 1 ? 'update' : 'updates'}`);
  const blockers = summary?.activeBlockers ?? 0;
  if (blockers > 0) parts.push(`${blockers} active ${blockers === 1 ? 'blocker' : 'blockers'}`);
  return parts.join(', ');
}

export function CalendarDay({ date, summary, isSelected, isToday, onPress }: Props) {
  const { colors } = useTheme();
  const dayNumber = Number(date.slice(8, 10));

  return (
    <PressableScale
      onPress={() => onPress(date)}
      scaleTo={0.92}
      accessibilityRole="button"
      accessibilityLabel={describe(date, summary)}
      accessibilityState={{ selected: isSelected }}
      style={styles.cell}>
      <View
        style={[
          styles.number,
          isSelected && { backgroundColor: colors.primaryDark },
          !isSelected && isToday && { borderWidth: 1.5, borderColor: colors.primary },
        ]}>
        <Text
          style={[
            styles.numberText,
            { color: isSelected ? colors.onPrimary : colors.text },
            (isSelected || isToday) && { fontWeight: fontWeight.bold },
          ]}>
          {dayNumber}
        </Text>
      </View>
      <CalendarDayIndicators summary={summary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  cell: { minHeight: MIN_TOUCH + 8, alignItems: 'center', justifyContent: 'center' },
  number: { width: 34, height: 34, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontSize: fontSize.body, fontWeight: fontWeight.medium },
});
