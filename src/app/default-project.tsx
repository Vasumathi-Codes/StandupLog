import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/Screen';
import { SettingsRow } from '@/components/SettingsRow';
import { SettingsSection } from '@/components/SettingsSection';
import { fontSize, iconSize, spacing } from '@/constants/theme';
import { useNotes } from '@/hooks/useNotes';
import { useProjects } from '@/hooks/useProjects';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';

export default function DefaultProjectScreen() {
  const { colors } = useTheme();
  const { settings, updateSettings } = useSettings();
  const { notes } = useNotes();
  const { projects } = useProjects(notes);

  const choose = async (project: string) => {
    await updateSettings({ defaultProject: project });
    router.back();
  };

  const option = (label: string, project: string) => (
    <SettingsRow
      key={label}
      title={label}
      onPress={() => choose(project)}
      value={settings.defaultProject === project ? '✓' : undefined}
    />
  );

  return (
    <Screen edges={[]}>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        New updates start with this project filled in. You can still change it each time.
      </Text>
      <SettingsSection title="Project" icon="pricetag-outline">
        {option('None', '')}
        {projects.map((project) => option(project, project))}
      </SettingsSection>
      {projects.length === 0 && (
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          <Ionicons name="information-circle-outline" size={iconSize.sm} /> Add projects from the Calendar or Search screen, or by using them in an update.
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({ hint: { fontSize: fontSize.small, lineHeight: 18, marginBottom: spacing.xs } });
