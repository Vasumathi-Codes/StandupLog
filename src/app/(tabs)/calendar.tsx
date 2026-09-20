import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function CalendarScreen() {
  return (
    <Screen>
      <ScreenHeader title="Calendar" subtitle="Your work journal" />
      <EmptyState
        icon="calendar-outline"
        title="Calendar coming soon"
        message="Browse what you worked on for any day. This arrives in Phase 5."
      />
    </Screen>
  );
}
