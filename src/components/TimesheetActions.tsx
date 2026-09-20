import { StyleSheet, View } from 'react-native';

import { spacing } from '@/constants/theme';
import { useCopyShare } from '@/hooks/useCopyShare';
import { useToast } from '@/hooks/useToast';
import { generateTimesheetText } from '@/services/timesheet';
import { Note } from '@/types/note';

import { Button } from './Button';

type Props = {
  // Any notes; only those dated `date` are used.
  notes: Note[];
  // The day to copy (YYYY-MM-DD): today, or the date selected in the calendar.
  date: string;
};

export function TimesheetActions({ notes, date }: Props) {
  const showToast = useToast();
  const text = generateTimesheetText(notes, date);
  const { copy, share } = useCopyShare(text);

  const handleCopy = async () => {
    if (await copy()) showToast('✓ Copied for timesheet');
  };

  return (
    <View style={styles.row}>
      <Button label="Copy for Timesheet" icon="clipboard-outline" onPress={handleCopy} style={styles.copy} />
      <Button label="Share" icon="share-outline" variant="secondary" onPress={share} style={styles.share} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  copy: { flex: 2 },
  share: { flex: 1 },
});
