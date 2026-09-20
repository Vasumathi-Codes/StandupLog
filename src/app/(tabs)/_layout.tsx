import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { ColorValue, Pressable } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IconName) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} size={size} color={color} />
  );
}

function SettingsButton() {
  return (
    <Link href="/settings" asChild>
      <Pressable accessibilityRole="button" accessibilityLabel="Settings" hitSlop={12} style={{ marginRight: 16 }}>
        <Ionicons name="settings-outline" size={24} />
      </Pressable>
    </Link>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerRight: () => <SettingsButton /> }}>
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: tabIcon('today-outline') }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar', tabBarIcon: tabIcon('calendar-outline') }} />
      <Tabs.Screen name="reports" options={{ title: 'Reports', tabBarIcon: tabIcon('bar-chart-outline') }} />
    </Tabs>
  );
}
