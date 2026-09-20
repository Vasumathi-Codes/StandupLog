import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { ReminderSetting } from '@/services/settings';

export type ReminderKind = 'evening' | 'morning';

const REMINDERS: Record<ReminderKind, { id: string; body: string }> = {
  evening: { id: 'standuplog-evening-reminder', body: 'What did you finish today?' },
  morning: { id: 'standuplog-morning-reminder', body: 'Your standup is ready.' },
};

const CHANNEL_ID = 'reminders';

// Local notifications need a phone; the web preview has no notification scheduling.
export const remindersSupported = Platform.OS !== 'web';

// Show reminders as a banner even if the app happens to be open.
if (remindersSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Daily reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

// Asks the OS for permission if we don't have it yet. Returns true if reminders are allowed.
// iOS: shows a one-time system prompt. Android 13+: shows the POST_NOTIFICATIONS prompt.
// If the user denied it before, the OS won't ask again; they must enable it in system settings.
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!remindersSupported) return false;
  try {
    await ensureAndroidChannel(); // Android requires a channel to exist before asking
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch (error) {
    console.error('[notifications] permission check failed', error);
    return false;
  }
}

export async function cancelReminder(kind: ReminderKind): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(REMINDERS[kind].id);
}

// Schedules (or reschedules) a repeating daily local notification at the given time.
export async function scheduleReminder(kind: ReminderKind, time: Pick<ReminderSetting, 'hour' | 'minute'>): Promise<void> {
  const { id, body } = REMINDERS[kind];
  await cancelReminder(kind);
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title: 'Standup Log', body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: time.hour,
      minute: time.minute,
      channelId: CHANNEL_ID,
    },
  });
}
