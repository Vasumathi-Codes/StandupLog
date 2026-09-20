import { useColorScheme } from 'react-native';

import { palettes, shadows } from '@/constants/theme';
import { useSettings } from '@/hooks/useSettings';

// Uses the theme chosen in Settings; "system" follows the phone's light/dark setting.
export function useTheme() {
  const systemScheme = useColorScheme();
  const { settings } = useSettings();
  const isDark = settings.theme === 'system' ? systemScheme === 'dark' : settings.theme === 'dark';
  return {
    isDark,
    colors: isDark ? palettes.dark : palettes.light,
    // Shadows are barely visible on dark surfaces, so we rely on borders there.
    cardShadow: isDark ? {} : shadows.card,
  };
}
