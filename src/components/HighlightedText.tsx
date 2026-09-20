import { StyleProp, Text, TextStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Renders `text` with every occurrence of `query` emphasised.
export function HighlightedText({ text, query, style }: { text: string; query?: string; style?: StyleProp<TextStyle> }) {
  const { colors } = useTheme();
  const needle = query?.trim();
  if (!needle) return <Text style={style}>{text}</Text>;

  // A capture group in split() keeps the matched pieces, at odd indexes.
  const parts = text.split(new RegExp(`(${escapeRegExp(needle)})`, 'i'));
  return (
    <Text style={style}>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <Text key={index} style={{ backgroundColor: colors.primaryLight, color: colors.primary, fontWeight: '700' }}>
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}
