import { Note } from '@/types/note';

export type DaySummary = {
  total: number;
  done: number;
  plan: number;
  // Resolved blockers stay in history but don't count here.
  activeBlockers: number;
};

export function isActiveBlocker(note: Note): boolean {
  return note.type === 'BLOCKER' && !note.resolved;
}

// One pass over the notes -> summary per work date, used for the calendar indicators.
export function summarizeByDate(notes: Note[]): Record<string, DaySummary> {
  const summaries: Record<string, DaySummary> = {};
  for (const note of notes) {
    const summary = (summaries[note.date] ??= { total: 0, done: 0, plan: 0, activeBlockers: 0 });
    summary.total += 1;
    if (note.type === 'DONE') summary.done += 1;
    if (note.type === 'PLAN') summary.plan += 1;
    if (isActiveBlocker(note)) summary.activeBlockers += 1;
  }
  return summaries;
}
