import { Note } from '@/types/note';

// Made-up notes used only to preview formats in Settings.
export const SAMPLE_TODAY = '2026-09-18';
const SAMPLE_YESTERDAY = '2026-09-17';

function sample(id: string, type: Note['type'], date: string, text: string, minute: number): Note {
  const stamp = `${date}T09:${String(minute).padStart(2, '0')}:00.000Z`;
  return { id, type, date, text, resolved: false, createdAt: stamp, updatedAt: stamp };
}

export const SAMPLE_NOTES: Note[] = [
  sample('s1', 'DONE', SAMPLE_YESTERDAY, 'Fixed appointment API issue', 1),
  sample('s2', 'DONE', SAMPLE_YESTERDAY, 'Completed QA testing', 2),
  sample('s3', 'DONE', SAMPLE_TODAY, 'Fixed appointment API issue', 1),
  sample('s4', 'DONE', SAMPLE_TODAY, 'Completed QA testing', 2),
  sample('s5', 'PLAN', SAMPLE_TODAY, 'Work on scheduling changes', 3),
  sample('s6', 'BLOCKER', SAMPLE_TODAY, 'Waiting for backend response', 4),
];
