import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, iconSize, MIN_TOUCH, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { formatMonthYear, getMonthGrid, todayString, YearMonth } from '@/utils/date';
import { DaySummary } from '@/utils/notes';

import { CalendarDay } from './CalendarDay';
import { PressableScale } from './PressableScale';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type Props = {
  visibleMonth: YearMonth;
  selectedDate: string;
  summaries: Record<string, DaySummary>;
  onSelectDate: (date: string) => void;
  onChangeMonth: (delta: number) => void;
  onGoToToday: () => void;
};

export function CalendarView({ visibleMonth, selectedDate, summaries, onSelectDate, onChangeMonth, onGoToToday }: Props) {
  const { colors, cardShadow } = useTheme();
  const today = todayString();
  const weeks = getMonthGrid(visibleMonth);

  const navButton = (icon: 'chevron-back' | 'chevron-forward', label: string, delta: number) => (
    <PressableScale
      onPress={() => onChangeMonth(delta)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.navButton}>
      <Ionicons name={icon} size={iconSize.lg} color={colors.textSecondary} />
    </PressableScale>
  );

  return (
    <View style={[styles.card, cardShadow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={[styles.month, { color: colors.text }]}>
          {formatMonthYear(visibleMonth)}
        </Text>
        <View style={styles.nav}>
          {navButton('chevron-back', 'Previous month', -1)}
          <PressableScale
            onPress={onGoToToday}
            accessibilityRole="button"
            accessibilityLabel="Go to today"
            style={[styles.todayButton, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.todayText, { color: colors.primary }]}>Today</Text>
          </PressableScale>
          {navButton('chevron-forward', 'Next month', 1)}
        </View>
      </View>

      <View style={styles.week}>
        {WEEKDAYS.map((day) => (
          <Text key={day} style={[styles.weekday, { color: colors.textMuted }]}>
            {day}
          </Text>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.week}>
          {week.map((date, dayIndex) => (
            <View key={dayIndex} style={styles.dayCell}>
              {date && (
                <CalendarDay
                  date={date}
                  summary={summaries[date]}
                  isSelected={date === selectedDate}
                  isToday={date === today}
                  onPress={onSelectDate}
                />
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  month: { fontSize: fontSize.section, fontWeight: fontWeight.semibold },
  nav: { flexDirection: 'row', alignItems: 'center' },
  navButton: { width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  todayButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill },
  todayText: { fontSize: fontSize.small, fontWeight: fontWeight.semibold },
  week: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontSize: fontSize.caption, fontWeight: fontWeight.medium, paddingVertical: spacing.xs },
  dayCell: { flex: 1 },
});
