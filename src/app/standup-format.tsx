import { FormatPreview } from '@/components/FormatPreview';
import { Screen } from '@/components/Screen';
import { SAMPLE_NOTES, SAMPLE_TODAY } from '@/constants/sampleNotes';
import { generateStandup } from '@/services/standupGenerator';

export default function StandupFormatScreen() {
  return (
    <Screen edges={[]}>
      <FormatPreview
        title="Default format"
        description="Choose how your daily standup is formatted."
        text={generateStandup(SAMPLE_NOTES, SAMPLE_TODAY)}
        footnote="This is the format used by Generate Standup. Custom formats are planned for later."
      />
    </Screen>
  );
}
