import * as Clipboard from 'expo-clipboard';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { fontSize, fontWeight, MIN_TOUCH, radius, spacing } from '@/constants/theme';
import { useNotes } from '@/hooks/useNotes';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { BackupError, ImportPlan, mergeNotes, parseBackup, planImport } from '@/services/backup';
import { saveNotes } from '@/services/storage';
import { allProjects } from '@/utils/notes';

type Review = { plan: ImportPlan; projects: string[]; skipped: number; incomingCount: number };

// Import is a two-step flow: paste, then review what would change, then confirm.
// It only adds notes or replaces older copies; it never deletes anything.
export default function ImportDataScreen() {
  const { colors } = useTheme();
  const { settings, updateSettings } = useSettings();
  const { notes, reload } = useNotes();
  const showToast = useToast();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [busy, setBusy] = useState(false);

  const newProjects = useMemo(() => {
    if (!review) return [];
    const known = new Set(allProjects(notes, settings.projects).map((p) => p.toLowerCase()));
    return review.projects.filter((p) => !known.has(p.toLowerCase()));
  }, [review, notes, settings.projects]);

  const pasteFromClipboard = async () => {
    try {
      setText(await Clipboard.getStringAsync());
      setReview(null);
      setError(null);
    } catch {
      Alert.alert('Could not paste', 'Please paste the backup into the box instead.');
    }
  };

  const checkBackup = () => {
    try {
      const parsed = parseBackup(text.trim());
      setReview({ plan: planImport(notes, parsed.notes), projects: parsed.projects, skipped: parsed.skipped, incomingCount: parsed.notes.length });
      setError(null);
    } catch (e) {
      setReview(null);
      setError(e instanceof BackupError ? e.message : 'Could not read that backup.');
    }
  };

  const applyImport = async () => {
    if (!review) return;
    setBusy(true);
    try {
      await saveNotes(mergeNotes(notes, review.plan));
      if (newProjects.length > 0) await updateSettings({ projects: [...settings.projects, ...newProjects] });
      await reload();
      showToast('✓ Backup imported');
      setText('');
      setReview(null);
    } catch {
      setError('Could not import the backup. Nothing was changed.');
    }
    setBusy(false);
  };

  const changes = review ? review.plan.additions.length + review.plan.updates.length : 0;

  return (
    <Screen edges={[]}>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        Paste a backup you exported from Standup Log. You will see what would change before anything is imported.
      </Text>
      <TextInput
        value={text}
        onChangeText={(value) => {
          setText(value);
          setReview(null);
          setError(null);
        }}
        placeholder="Paste backup here"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Backup text"
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        textAlignVertical="top"
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
      />
      <View style={styles.row}>
        <Button label="Paste" icon="clipboard-outline" variant="secondary" onPress={pasteFromClipboard} style={styles.flex} />
        <Button label="Review" onPress={checkBackup} disabled={!text.trim()} style={styles.flex} />
      </View>

      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}

      {review && (
        <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            {changes === 0 && newProjects.length === 0 ? 'Nothing new to import' : 'Ready to import'}
          </Text>
          <Text style={[styles.summaryLine, { color: colors.textSecondary }]}>
            {review.incomingCount} {review.incomingCount === 1 ? 'update' : 'updates'} in this backup
          </Text>
          <Text style={[styles.summaryLine, { color: colors.text }]}>• {review.plan.additions.length} new</Text>
          <Text style={[styles.summaryLine, { color: colors.text }]}>• {review.plan.updates.length} newer than the copy on this device</Text>
          <Text style={[styles.summaryLine, { color: colors.textSecondary }]}>• {review.plan.unchanged} already here, left as they are</Text>
          {newProjects.length > 0 && (
            <Text style={[styles.summaryLine, { color: colors.text }]}>• {newProjects.length} new {newProjects.length === 1 ? 'project' : 'projects'}</Text>
          )}
          {review.skipped > 0 && (
            <Text style={[styles.summaryLine, { color: colors.textMuted }]}>{review.skipped} damaged {review.skipped === 1 ? 'entry was' : 'entries were'} skipped</Text>
          )}
          <Text style={[styles.note, { color: colors.textMuted }]}>Nothing on this device is deleted. Newer local edits are never overwritten.</Text>
          <Button label="Import" onPress={applyImport} disabled={busy || (changes === 0 && newProjects.length === 0)} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: fontSize.small, lineHeight: 18 },
  input: { minHeight: 160, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.small },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  error: { fontSize: fontSize.small },
  summary: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, gap: spacing.xs },
  summaryTitle: { fontSize: fontSize.section, fontWeight: fontWeight.semibold, marginBottom: spacing.xs },
  summaryLine: { fontSize: fontSize.body, lineHeight: 22 },
  note: { fontSize: fontSize.caption, marginVertical: spacing.sm, minHeight: MIN_TOUCH / 2 },
});
