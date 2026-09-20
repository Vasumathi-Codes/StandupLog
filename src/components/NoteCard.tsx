import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, getTypeColors, iconSize, MIN_TOUCH, NOTE_TYPE_META, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Note } from '@/types/note';

import { Button } from './Button';
import { HighlightedText } from './HighlightedText';
import { NoteTypeBadge } from './NoteTypeBadge';
import { PressableScale } from './PressableScale';

type Props = {
  note: Note;
  onPress?: () => void;
  onMorePress?: () => void;
  onResolve?: () => void;
  // Search term to emphasise in the text.
  highlight?: string;
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function NoteCard({ note, onPress, onMorePress, onResolve, highlight }: Props) {
  const { colors, cardShadow } = useTheme();
  const isBlocker = note.type === 'BLOCKER';
  const isResolved = isBlocker && note.resolved;
  const typeColors = getTypeColors(colors, note.type);

  // Only active blockers get the tinted background; resolved ones fade back to a plain card.
  const backgroundColor = isBlocker && !isResolved ? typeColors.tint : colors.surface;
  const meta = [note.project, formatTime(note.createdAt)].filter(Boolean).join(' • ');

  return (
    <PressableScale
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${NOTE_TYPE_META[note.type].label}${isResolved ? ', resolved' : ''}: ${note.text}`}
      style={[
        styles.card,
        cardShadow,
        { backgroundColor, borderColor: colors.border, opacity: isResolved ? 0.6 : 1 },
        isBlocker && !isResolved && { borderLeftColor: typeColors.accent, borderLeftWidth: 3 },
      ]}>
      <View style={styles.topRow}>
        <NoteTypeBadge type={note.type} label={isResolved ? 'Resolved' : undefined} />
        {onMorePress && (
          <PressableScale
            onPress={onMorePress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="More actions"
            style={styles.more}>
            <Ionicons name="ellipsis-horizontal" size={iconSize.md} color={colors.textMuted} />
          </PressableScale>
        )}
      </View>
      <HighlightedText
        text={note.text}
        query={highlight}
        style={[styles.text, { color: colors.text }, isResolved && styles.strike]}
      />
      <Text style={[styles.meta, { color: colors.textSecondary }]}>{meta}</Text>
      {isBlocker && !isResolved && onResolve && (
        <Button label="Resolve" variant="secondary" icon="checkmark" onPress={onResolve} style={styles.resolve} />
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  more: { width: MIN_TOUCH, height: 32, alignItems: 'flex-end', justifyContent: 'center', marginRight: -spacing.xs },
  text: { fontSize: fontSize.bodyLarge, fontWeight: fontWeight.medium, lineHeight: 22 },
  strike: { textDecorationLine: 'line-through' },
  meta: { fontSize: fontSize.small },
  resolve: { alignSelf: 'flex-start', marginTop: spacing.xs },
});
