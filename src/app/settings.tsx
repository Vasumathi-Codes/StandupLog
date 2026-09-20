import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';

export default function SettingsScreen() {
  return (
    <Screen>
      <EmptyState
        icon="settings-outline"
        title="Settings coming soon"
        message="Reminders, theme and carry-over options will live here."
      />
    </Screen>
  );
}
