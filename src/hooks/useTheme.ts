import { useColorScheme } from 'react-native';

import { palettes, shadows } from '@/constants/theme';

// Follows the phone's light/dark setting. A manual override arrives in Phase 13.
export function useTheme() {
  const isDark = useColorScheme() === 'dark';
  return {
    isDark,
    colors: isDark ? palettes.dark : palettes.light,
    // Shadows are barely visible on dark surfaces, so we rely on borders there.
    cardShadow: isDark ? {} : shadows.card,
  };
}
