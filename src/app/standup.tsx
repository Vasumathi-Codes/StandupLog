import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { StandupSummary } from '@/components/StandupSummary';
import { useNotes } from '@/hooks/useNotes';
import { useTheme } from '@/hooks/useTheme';
import { generateStandup } from '@/services/standupGenerator';
import { todayString } from '@/utils/date';

export default function StandupScreen() {
  const { colors } = useTheme();
  const { notes, loading, error } = useNotes();
  const standup = useMemo(() => generateStandup(notes, todayString()), [notes]);

  return (
    <Screen>
      {loading && <ActivityIndicator color={colors.primary} style={styles.loading} />}
      {!loading && error && <EmptyState icon="alert-circle-outline" title="Couldn't load updates" message={error} />}
      {!loading && !error && <StandupSummary text={standup} />}
    </Screen>
  );
}

const styles = StyleSheet.create({ loading: { paddingVertical: 40 } });
