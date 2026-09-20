import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { SettingRow } from '@/components/SettingRow';
import { TimeField } from '@/components/TimeField';
import { OptionPicker } from '@/components/OptionPicker';
import { fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import { cancelReminder, ensureNotificationPermission, ReminderKind, remindersSupported, scheduleReminder } from '@/services/notifications';
import { ReminderSetting, ThemePreference } from '@/services/settings';

export default function SettingsScreen() {
  const { colors, cardShadow } = useTheme();
  const { settings, updateSettings } = useSettings();

  const reminderKey = { evening: 'eveningReminder', morning: 'morningReminder' } as const;

  const changeReminder = async (kind: ReminderKind, changes: Partial<ReminderSetting>) => {
    const next = { ...settings[reminderKey[kind]], ...changes };
    try {
      if (next.enabled) {
        // Permission is requested here, the first time a reminder is switched on.
        const allowed = await ensureNotificationPermission();
        if (!allowed) {
          Alert.alert(
            'Notifications are turned off',
            'Allow notifications for Standup Log in your phone settings to get reminders.',
            [{ text: 'Not now', style: 'cancel' }, { text: 'Open Settings', onPress: () => Linking.openSettings() }],
          );
          return; // leave the switch off
        }
        await scheduleReminder(kind, next);
      } else {
        await cancelReminder(kind);
      }
      await updateSettings({ [reminderKey[kind]]: next });
    } catch (error) {
      console.error('[settings] reminder change failed', error);
      Alert.alert('Could not update reminder', 'Please try again.');
    }
  };

  const reminderRow = (kind: ReminderKind, title: string, description: string) => {
    const reminder = settings[reminderKey[kind]];
    return (
      <SettingRow
        title={title}
        description={description}
        value={reminder.enabled}
        disabled={!remindersSupported}
        onValueChange={(enabled) => changeReminder(kind, { enabled })}>
        {reminder.enabled && (
          <TimeField
            label="Time"
            hour={reminder.hour}
            minute={reminder.minute}
            onChange={(hour, minute) => changeReminder(kind, { hour, minute })}
          />
        )}
      </SettingRow>
    );
  };

  return (
    <Screen edges={[]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>
        <View style={[styles.card, cardShadow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <OptionPicker<ThemePreference>
            label="Theme"
            value={settings.theme}
            options={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
            onChange={(theme) => updateSettings({ theme })}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PLANNING</Text>
        <View style={[styles.card, cardShadow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingRow
            title="Carry over unfinished plans"
            description="Suggest plans from previous days on Today. You choose whether to add or dismiss each one."
            value={settings.carryOverPlans}
            onValueChange={(carryOverPlans) => updateSettings({ carryOverPlans })}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>REMINDERS</Text>
        {!remindersSupported && (
          <Text style={[styles.note, { color: colors.textSecondary }]}>
            Reminders only work in the phone app, not in the web preview.
          </Text>
        )}
        <View style={[styles.card, cardShadow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {reminderRow('evening', 'Evening reminder', '"What did you finish today?"')}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {reminderRow('morning', 'Morning reminder', '"Your standup is ready."')}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold, letterSpacing: 0.6 },
  note: { fontSize: fontSize.small },
  divider: { height: StyleSheet.hairlineWidth },
  card: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, gap: spacing.lg },
});
