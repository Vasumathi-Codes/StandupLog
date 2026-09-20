import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatCard } from '@/components/StatCard';
import { spacing } from '@/constants/theme';

export default function ReportsScreen() {
  return (
    <Screen>
      <ScreenHeader title="Reports" subtitle="Weekly summary" />
      {/* Placeholder values: real weekly numbers arrive in Phase 8. */}
      <View style={styles.stats}>
        <StatCard value="–" label="Done" type="DONE" />
        <StatCard value="–" label="Plans" type="PLAN" />
        <StatCard value="–" label="Blockers" type="BLOCKER" />
      </View>
      <EmptyState
        icon="bar-chart-outline"
        title="Weekly report coming soon"
        message="Complete a few updates to see your weekly summary. This arrives in Phase 8."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: spacing.sm },
});
