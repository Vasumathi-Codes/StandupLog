import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'system' | 'light' | 'dark';

export type ReminderSetting = { enabled: boolean; hour: number; minute: number };

export interface Settings {
  carryOverPlans: boolean;
  theme: ThemePreference;
  eveningReminder: ReminderSetting;
  morningReminder: ReminderSetting;
}

export const DEFAULT_SETTINGS: Settings = {
  carryOverPlans: false,
  theme: 'system',
  eveningReminder: { enabled: false, hour: 17, minute: 0 },
  morningReminder: { enabled: false, hour: 9, minute: 0 },
};

const SETTINGS_KEY = 'standuplog:settings:v1';

// Missing or malformed fields fall back to defaults, so adding a setting later never breaks old data.
export async function getSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const saved = JSON.parse(raw) as Partial<Settings>;
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      eveningReminder: { ...DEFAULT_SETTINGS.eveningReminder, ...saved.eveningReminder },
      morningReminder: { ...DEFAULT_SETTINGS.morningReminder, ...saved.morningReminder },
    };
  } catch (error) {
    console.error('[settings] load failed', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('[settings] save failed', error);
    throw error;
  }
}
