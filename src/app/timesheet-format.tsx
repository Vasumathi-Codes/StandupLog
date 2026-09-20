import { FormatPreview } from '@/components/FormatPreview';
import { Screen } from '@/components/Screen';
import { SAMPLE_NOTES, SAMPLE_TODAY } from '@/constants/sampleNotes';
import { useSettings } from '@/hooks/useSettings';
import { generateTimesheetText } from '@/services/timesheet';

export default function TimesheetFormatScreen() {
  const { settings } = useSettings();
  return (
    <Screen edges={[]}>
      <FormatPreview
        title="Default format"
        description="Choose what gets copied when you copy updates for your timesheet."
        text={generateTimesheetText(SAMPLE_NOTES, SAMPLE_TODAY, { includeBlockers: settings.includeBlockersInTimesheet })}
        footnote="Only your Done updates and active blockers are copied. Turn blockers on or off in Settings. Custom formats are planned for later."
      />
    </Screen>
  );
}
