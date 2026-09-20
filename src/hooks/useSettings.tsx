import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { DEFAULT_SETTINGS, getSettings, saveSettings, Settings } from '@/services/settings';

type SettingsContextValue = {
  settings: Settings;
  loaded: boolean;
  updateSettings: (changes: Partial<Settings>) => Promise<void>;
};

// Context = one shared copy of the settings for the whole app, so a change made on
// the Settings screen is instantly visible on Today, the theme, and so on.
const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSettings().then((saved) => {
      setSettings(saved);
      setLoaded(true);
    });
  }, []);

  const updateSettings = useCallback(
    async (changes: Partial<Settings>) => {
      const next = { ...settings, ...changes };
      setSettings(next);
      try {
        await saveSettings(next);
      } catch {
        setSettings(settings);
        Alert.alert('Could not save settings', 'Please try again.');
      }
    },
    [settings],
  );

  return <SettingsContext.Provider value={{ settings, loaded, updateSettings }}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside SettingsProvider');
  return value;
}
