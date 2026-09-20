import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { SettingRow } from '@/components/SettingRow';
import { fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';

export default function SettingsScreen() {
  const { colors, cardShadow } = useTheme();
  const { settings, updateSettings } = useSettings();

  return (
    <Screen edges={[]}>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold, letterSpacing: 0.6 },
  card: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, gap: spacing.lg },
});
