import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { fontWeight } from '@/constants/theme';
import { SettingsProvider } from '@/hooks/useSettings';
import { ToastProvider } from '@/hooks/useToast';
import { useTheme } from '@/hooks/useTheme';

export default function RootLayout() {
  return (
    <SettingsProvider>
      <ToastProvider>
        <ThemedStack />
      </ToastProvider>
    </SettingsProvider>
  );
}

function ThemedStack() {
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
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShadowVisible: false, headerTitleStyle: { fontWeight: fontWeight.semibold } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="search" options={{ title: 'Search' }} />
        <Stack.Screen name="standup" options={{ title: 'Standup' }} />
        <Stack.Screen name="edit-note" options={{ title: 'Edit Update', presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
