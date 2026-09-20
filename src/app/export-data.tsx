import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { fontSize, spacing } from '@/constants/theme';
import { useCopyShare } from '@/hooks/useCopyShare';
import { useNotes } from '@/hooks/useNotes';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { createBackup, serializeBackup } from '@/services/backup';
import { allProjects } from '@/utils/notes';

export default function ExportDataScreen() {
  const { colors } = useTheme();
  const { settings } = useSettings();
  const { notes } = useNotes();
  const showToast = useToast();

  const projects = allProjects(notes, settings.projects);
  const backupText = serializeBackup(createBackup(notes, projects));
  const { copy, share } = useCopyShare(backupText);

  return (
    <Screen edges={[]}>
      <Text style={[styles.text, { color: colors.text }]}>
        Your backup has {notes.length} {notes.length === 1 ? 'update' : 'updates'} and {projects.length} {projects.length === 1 ? 'project' : 'projects'}.
      </Text>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        The backup is plain text. Share it to somewhere safe, like Notes, Files or an email to yourself. To restore it, use Import data.
      </Text>
      <View style={styles.actions}>
        <Button label="Share backup" icon="share-outline" onPress={share} disabled={notes.length === 0} />
        <Button
          label="Copy backup"
          icon="copy-outline"
          variant="secondary"
          disabled={notes.length === 0}
          onPress={async () => {
            if (await copy()) showToast('✓ Backup copied');
          }}
        />
      </View>
      {notes.length === 0 && <Text style={[styles.hint, { color: colors.textMuted }]}>There is nothing to back up yet.</Text>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: fontSize.bodyLarge, lineHeight: 24 },
  hint: { fontSize: fontSize.small, lineHeight: 18 },
  actions: { gap: spacing.sm },
});
