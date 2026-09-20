import { StyleSheet, View } from 'react-native';

import { spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { DaySummary } from '@/utils/notes';

// Circles for Done/Plan, a small diamond for an active Blocker: distinguishable without colour.
export function CalendarDayIndicators({ summary }: { summary?: DaySummary }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {summary && summary.done > 0 && <View style={[styles.dot, { backgroundColor: colors.done }]} />}
      {summary && summary.plan > 0 && <View style={[styles.dot, { backgroundColor: colors.plan }]} />}
      {summary && summary.activeBlockers > 0 && <View style={[styles.diamond, { backgroundColor: colors.blocker }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 3, height: 7, alignItems: 'center', marginTop: spacing.xs },
  dot: { width: 6, height: 6, borderRadius: 3 },
  diamond: { width: 6, height: 6, transform: [{ rotate: '45deg' }] },
});
