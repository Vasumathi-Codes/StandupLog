import { Ionicons } from '@expo/vector-icons';
import { ViewStyle } from 'react-native';

import { NoteType } from '@/types/note';

const lightColors = {
  primary: '#6366F1',
  primaryLight: '#EEF2FF',
  // Darker indigo for filled buttons: white text on #6366F1 is borderline for contrast.
  primaryDark: '#4F46E5',
  onPrimary: '#FFFFFF',

  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',

  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  border: '#E2E8F0',

  success: '#22C55E',
  warning: '#F97316',
  error: '#DC2626',
  errorLight: '#FEF2F2',

  // Accent = dots/icons/borders. Text = readable label colour. Tint = subtle background.
  done: '#22C55E',
  doneText: '#15803D',
  doneTint: '#F0FDF4',
  plan: '#3B82F6',
  planText: '#1D4ED8',
  planTint: '#EFF6FF',
  blocker: '#F97316',
  blockerText: '#C2410C',
  blockerTint: '#FFF7ED',
};

export type ThemeColors = Record<keyof typeof lightColors, string>;

const darkColors: ThemeColors = {
  primary: '#818CF8',
  primaryLight: '#312E81',
  primaryDark: '#6366F1',
  onPrimary: '#FFFFFF',

  background: '#0F172A',
  surface: '#1E293B',
  surfaceSecondary: '#273449',

  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  border: '#334155',

  success: '#22C55E',
  warning: '#FB923C',
  error: '#F87171',
  errorLight: '#3B1D24',

  done: '#22C55E',
  doneText: '#4ADE80',
  doneTint: '#132A22',
  plan: '#3B82F6',
  planText: '#60A5FA',
  planTint: '#172554',
  blocker: '#F97316',
  blockerText: '#FB923C',
  blockerTint: '#2D1D14',
};

export const palettes: Record<'light' | 'dark', ThemeColors> = { light: lightColors, dark: darkColors };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 40 } as const;

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

export const fontSize = {
  caption: 12,
  small: 13,
  body: 15,
  bodyLarge: 16,
  section: 18,
  title: 28,
  stat: 30,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const iconSize = { sm: 16, md: 20, lg: 24 } as const;

// Minimum comfortable tap target (Apple HIG: 44pt, Material: 48dp).
export const MIN_TOUCH = 44;

export const shadows: Record<'card', ViewStyle> = {
  card: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
};

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export const NOTE_TYPE_META: Record<NoteType, { label: string; plural: string; icon: IconName }> = {
  DONE: { label: 'Done', plural: 'Done', icon: 'checkmark-circle' },
  PLAN: { label: 'Plan', plural: 'Plan', icon: 'arrow-forward-circle' },
  BLOCKER: { label: 'Blocker', plural: 'Blockers', icon: 'alert-circle' },
};

export function getTypeColors(colors: ThemeColors, type: NoteType) {
  switch (type) {
    case 'DONE':
      return { accent: colors.done, text: colors.doneText, tint: colors.doneTint };
    case 'PLAN':
      return { accent: colors.plan, text: colors.planText, tint: colors.planTint };
    case 'BLOCKER':
      return { accent: colors.blocker, text: colors.blockerText, tint: colors.blockerTint };
  }
}
