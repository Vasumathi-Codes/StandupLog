import { Note } from '@/types/note';
import { isActiveBlocker } from '@/utils/notes';

function lines(notes: Note[], emptyText: string): string {
  if (notes.length === 0) return `- ${emptyText}`;
  return notes.map((note) => `- ${note.text}`).join('\n');
}

function byCreatedAt(a: Note, b: Note): number {
  return a.createdAt.localeCompare(b.createdAt);
}

// Plain-text timesheet entry for one work date (YYYY-MM-DD):
//  - "Worked on": the DONE notes dated `date`
//  - "Blockers":  the unresolved BLOCKER notes dated `date`
// The user's own note text is used as written. Plans, projects, times and ids are left out.
// Filtering by `date` here means callers can pass every note and still get the right day.
export function generateTimesheetText(
  notes: Note[],
  date: string,
  { includeBlockers = true }: { includeBlockers?: boolean } = {},
): string {
  const forDate = notes.filter((note) => note.date === date);
  const done = forDate.filter((note) => note.type === 'DONE').sort(byCreatedAt);
  const blockers = forDate.filter(isActiveBlocker).sort(byCreatedAt);

  const sections = [`Worked on:\n${lines(done, 'No completed updates recorded')}`];
  if (includeBlockers) sections.push(`Blockers:\n${lines(blockers, 'None')}`);
  return sections.join('\n\n');
}
