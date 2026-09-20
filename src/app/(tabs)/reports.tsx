import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BulletList } from '@/components/BulletList';
import { EmptyState } from '@/components/EmptyState';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionHeader } from '@/components/SectionHeader';
import { StandupSummary } from '@/components/StandupSummary';
import { StatCard } from '@/components/StatCard';
import { fontSize, fontWeight, iconSize, MIN_TOUCH, spacing } from '@/constants/theme';
import { useNotes } from '@/hooks/useNotes';
import { useTheme } from '@/hooks/useTheme';
import { buildWeeklyReport, formatWeekRange, generateWeeklyText } from '@/services/weeklyReport';
import { Note } from '@/types/note';
import { todayString } from '@/utils/date';

function describe(note: Note): string {
  const project = note.project ? `[${note.project}] ` : '';
  const resolved = note.type === 'BLOCKER' && note.resolved ? ' (resolved)' : '';
  return `${project}${note.text}${resolved}`;
}

export default function ReportsScreen() {
  const { colors } = useTheme();
  const { notes, loading, error } = useNotes();
  const [weekOffset, setWeekOffset] = useState(0);

  const report = useMemo(() => buildWeeklyReport(notes, todayString(), weekOffset), [notes, weekOffset]);
  const text = useMemo(() => generateWeeklyText(report), [report]);
  const isEmpty = report.done.length + report.plans.length + report.blockers.length === 0;

  const weekButton = (icon: 'chevron-back' | 'chevron-forward', label: string, delta: number) => (
    <PressableScale
      onPress={() => setWeekOffset((offset) => offset + delta)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.weekButton}>
      <Ionicons name={icon} size={iconSize.lg} color={colors.textSecondary} />
    </PressableScale>
  );

  return (
    <Screen>
      <ScreenHeader title="Reports" subtitle="Weekly summary" />

      <View style={styles.weekRow}>
        {weekButton('chevron-back', 'Previous week', -1)}
        <Text accessibilityRole="header" style={[styles.weekLabel, { color: colors.text }]}>
          {formatWeekRange(report)}
        </Text>
        {weekButton('chevron-forward', 'Next week', 1)}
      </View>

      {loading && <ActivityIndicator color={colors.primary} />}
      {!loading && error && <EmptyState icon="alert-circle-outline" title="Couldn't load updates" message={error} />}

      {!loading && !error && (
        <>
          <View style={styles.stats}>
            <StatCard value={report.done.length} label="Completed" type="DONE" />
            <StatCard value={report.plans.length} label="Plans" type="PLAN" />
            <StatCard value={report.blockers.length} label="Blockers" type="BLOCKER" />
          </View>

          {isEmpty ? (
            <EmptyState
              icon="bar-chart-outline"
              title="Nothing this week"
              message="Complete a few updates to see your weekly summary."
            />
          ) : (
            <>
              {report.done.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader title="Completed" type="DONE" count={report.done.length} />
                  <BulletList items={report.done.map(describe)} />
                </View>
              )}
              {report.plans.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader title="Planned" type="PLAN" count={report.plans.length} />
                  <BulletList items={report.plans.map(describe)} />
                </View>
              )}
              {report.blockers.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader title="Blockers" type="BLOCKER" count={report.blockers.length} />
                  <BulletList items={report.blockers.map(describe)} />
                </View>
              )}
              <StandupSummary text={text} copyLabel="Copy Report" shareLabel="Share Report" />
            </>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  weekRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  weekButton: { width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  weekLabel: { fontSize: fontSize.section, fontWeight: fontWeight.semibold },
  stats: { flexDirection: 'row', gap: spacing.sm },
  section: { gap: spacing.md },
});
