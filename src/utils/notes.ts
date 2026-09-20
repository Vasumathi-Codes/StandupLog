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

// Distinct project names, case-insensitively unique, alphabetical.
export function uniqueProjects(notes: Note[]): string[] {
  const seen = new Map<string, string>();
  for (const note of notes) {
    if (note.project && !seen.has(note.project.toLowerCase())) seen.set(note.project.toLowerCase(), note.project);
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

export function matchesProject(note: Note, project: string | null): boolean {
  return project === null || note.project?.toLowerCase() === project.toLowerCase();
}

// Matches note text or project, case-insensitively. Newest first.
export function searchNotes(notes: Note[], query: string, project: string | null = null): Note[] {
  const needle = query.trim().toLowerCase();
  return notes
    .filter((note) => matchesProject(note, project))
    .filter(
      (note) => needle === '' || note.text.toLowerCase().includes(needle) || (note.project ?? '').toLowerCase().includes(needle),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

// Input must already be sorted by date; keeps that order.
export function groupByDate(notes: Note[]): { date: string; notes: Note[] }[] {
  const groups: { date: string; notes: Note[] }[] = [];
  for (const note of notes) {
    const last = groups[groups.length - 1];
    if (last && last.date === note.date) last.notes.push(note);
    else groups.push({ date: note.date, notes: [note] });
  }
  return groups;
}

// Projects used in notes plus ones added by hand, case-insensitively unique, alphabetical.
export function allProjects(notes: Note[], savedProjects: string[]): string[] {
  const seen = new Map<string, string>();
  for (const name of [...savedProjects, ...uniqueProjects(notes)]) {
    if (!seen.has(name.toLowerCase())) seen.set(name.toLowerCase(), name);
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}
