import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking } from 'react-native';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { OptionPicker } from '@/components/OptionPicker';
import { Screen } from '@/components/Screen';
import { SettingsRow } from '@/components/SettingsRow';
import { SettingsSection } from '@/components/SettingsSection';
import { TimeField } from '@/components/TimeField';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/useToast';
import { clearAllData } from '@/services/backup';
import { cancelReminder, ensureNotificationPermission, ReminderKind, remindersSupported, scheduleReminder } from '@/services/notifications';
import { DEFAULT_SETTINGS, ReminderSetting, ThemePreference } from '@/services/settings';

const reminderKey = { evening: 'eveningReminder', morning: 'morningReminder' } as const;

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const showToast = useToast();
  const [confirmingClear, setConfirmingClear] = useState(false);

  const changeReminder = async (kind: ReminderKind, changes: Partial<ReminderSetting>) => {
    const next = { ...settings[reminderKey[kind]], ...changes };
    try {
      if (next.enabled) {
        // Permission is requested here, the first time a reminder is switched on.
        const allowed = await ensureNotificationPermission();
        if (!allowed) {
          Alert.alert('Notifications are turned off', 'Allow notifications for Standup Log in your phone settings to get reminders.', [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]);
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
      <SettingsRow
        title={title}
        description={description}
        switchValue={reminder.enabled}
        switchDisabled={!remindersSupported}
        onSwitchChange={(enabled) => changeReminder(kind, { enabled })}>
        {reminder.enabled && (
          <TimeField label="Time" hour={reminder.hour} minute={reminder.minute} onChange={(hour, minute) => changeReminder(kind, { hour, minute })} />
        )}
      </SettingsRow>
    );
  };

  const deleteEverything = async () => {
    setConfirmingClear(false);
    try {
      await Promise.all([cancelReminder('evening'), cancelReminder('morning')].map((p) => p.catch(() => undefined)));
      await clearAllData();
      await updateSettings(DEFAULT_SETTINGS);
      showToast('All data deleted');
    } catch (error) {
      console.error('[settings] clear all failed', error);
      Alert.alert('Could not delete data', 'Please try again.');
    }
  };

  return (
    <Screen edges={[]}>
      <SettingsSection title="Appearance" icon="color-palette-outline">
        <SettingsRow title="Theme" description="Choose how Standup Log looks.">
          <OptionPicker<ThemePreference>
            value={settings.theme}
            options={[
              { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
              { value: 'light', label: 'Light', icon: 'sunny-outline' },
              { value: 'dark', label: 'Dark', icon: 'moon-outline' },
            ]}
            onChange={(theme) => updateSettings({ theme })}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Planning" icon="list-outline">
        <SettingsRow
          title="Carry over unfinished plans"
          description="Suggest unfinished plans from previous days when starting a new day."
          switchValue={settings.carryOverPlans}
          onSwitchChange={(carryOverPlans) => updateSettings({ carryOverPlans })}
        />
        <SettingsRow
          title="Default project"
          description="Use this project when adding new updates."
          value={settings.defaultProject || 'None'}
          onPress={() => router.push('/default-project')}
        />
      </SettingsSection>

      <SettingsSection title="Reminders" icon="notifications-outline">
        {reminderRow('evening', 'Evening reminder', 'Remind me to record what I finished today.')}
        {reminderRow('morning', 'Morning reminder', 'Remind me to prepare my standup.')}
      </SettingsSection>

      <SettingsSection title="Standup & Timesheet" icon="document-text-outline">
        <SettingsRow title="Standup format" description="Choose how your daily standup is formatted." onPress={() => router.push('/standup-format')} />
        <SettingsRow
          title="Timesheet format"
          description="Choose what gets copied when you copy updates for your timesheet."
          onPress={() => router.push('/timesheet-format')}
        />
        <SettingsRow
          title="Include blockers"
          description="Include active blockers when copying updates for your timesheet."
          switchValue={settings.includeBlockersInTimesheet}
          onSwitchChange={(includeBlockersInTimesheet) => updateSettings({ includeBlockersInTimesheet })}
        />
      </SettingsSection>

      <SettingsSection title="Data" icon="server-outline">
        <SettingsRow title="Export data" description="Save a backup of your Standup Log data." onPress={() => router.push('/export-data')} />
        <SettingsRow title="Import data" description="Restore your Standup Log data from a backup." onPress={() => router.push('/import-data')} />
      </SettingsSection>

      <SettingsSection title="Danger zone" icon="warning-outline" destructive>
        <SettingsRow
          title="Clear all data"
          description="Permanently delete all updates, projects, and local settings."
          destructive
          onPress={() => setConfirmingClear(true)}
        />
      </SettingsSection>

      <ConfirmDialog
        visible={confirmingClear}
        title="Delete all data?"
        message="This will permanently delete all your Standup Log updates and projects from this device. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={deleteEverything}
        onCancel={() => setConfirmingClear(false)}
      />
    </Screen>
  );
}
