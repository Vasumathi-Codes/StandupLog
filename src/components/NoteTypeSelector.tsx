import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, getTypeColors, iconSize, MIN_TOUCH, NOTE_TYPE_META, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { NoteType } from '@/types/note';

import { PressableScale } from './PressableScale';

const TYPES: NoteType[] = ['DONE', 'PLAN', 'BLOCKER'];

type Props = { value: NoteType; onChange: (type: NoteType) => void };

export function NoteTypeSelector({ value, onChange }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {TYPES.map((type) => {
        const selected = type === value;
        const typeColors = getTypeColors(colors, type);
        const { label, icon } = NOTE_TYPE_META[type];
        return (
          <View key={type} style={styles.item}>
            <PressableScale
              onPress={() => onChange(type)}
              accessibilityRole="radio"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
              style={[
                styles.option,
                {
                  backgroundColor: selected ? typeColors.tint : colors.surface,
                  borderColor: selected ? typeColors.accent : colors.border,
                },
              ]}>
              <Ionicons name={icon} size={iconSize.md} color={selected ? typeColors.accent : colors.textMuted} />
              <Text style={[styles.label, { color: selected ? typeColors.text : colors.textSecondary }]}>{label}</Text>
            </PressableScale>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  item: { flex: 1 },
  option: {
    minHeight: MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  label: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
});
