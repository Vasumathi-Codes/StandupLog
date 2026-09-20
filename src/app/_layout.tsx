import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { fontWeight } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export default function RootLayout() {
  const { colors, isDark } = useTheme();
  const base = isDark ? DarkTheme : DefaultTheme;

  // Tell React Navigation (which Expo Router uses) about our colours so its
  // built-in backgrounds, headers and transitions match the app.
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShadowVisible: false, headerTitleStyle: { fontWeight: fontWeight.semibold } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="add-note" options={{ title: 'Add Update', presentation: 'modal' }} />
        <Stack.Screen name="edit-note" options={{ title: 'Edit Update', presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
