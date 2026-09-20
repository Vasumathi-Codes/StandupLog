import { Stack } from 'expo-router';

// Root layout: a Stack lets screens push on top of each other (like settings).
// The "(tabs)" folder is a route group: it adds the tab bar without adding "/tabs" to the URL.
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    </Stack>
  );
}
