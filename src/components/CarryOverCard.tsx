import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, iconSize, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Note } from '@/types/note';
import { formatMonthDay } from '@/utils/date';

import { Button } from './Button';

type Props = { plan: Note; onAccept: () => void; onDismiss: () => void };

export function CarryOverCard({ plan, onAccept, onDismiss }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.plan }]}>
      <View style={styles.origin}>
        <Ionicons name="arrow-redo-outline" size={iconSize.sm} color={colors.planText} />
        <Text style={[styles.originText, { color: colors.planText }]}>Carried over from {formatMonthDay(plan.date)}</Text>
      </View>
      <Text style={[styles.text, { color: colors.text }]}>{plan.text}</Text>
      {plan.project && <Text style={[styles.meta, { color: colors.textSecondary }]}>{plan.project}</Text>}
      <View style={styles.actions}>
        <Button label="Add to today" icon="add" onPress={onAccept} style={styles.action} />
        <Button label="Dismiss" variant="secondary" onPress={onDismiss} style={styles.action} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderStyle: 'dashed', gap: spacing.sm },
  origin: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  originText: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold },
  text: { fontSize: fontSize.bodyLarge, fontWeight: fontWeight.medium, lineHeight: 22 },
  meta: { fontSize: fontSize.small },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  action: { flex: 1 },
});
