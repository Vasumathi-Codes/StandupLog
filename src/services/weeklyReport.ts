import { Note } from '@/types/note';
import { addDays, formatShortDate, startOfWeek } from '@/utils/date';

export type WeeklyReport = {
  start: string; // Monday, YYYY-MM-DD
  end: string; // Sunday, YYYY-MM-DD
  done: Note[];
  plans: Note[];
  // Every blocker dated in the week, including ones since resolved.
  blockers: Note[];
};

// `weekOffset` 0 = the week containing `today`, -1 = last week, and so on.
export function buildWeeklyReport(notes: Note[], today: string, weekOffset = 0): WeeklyReport {
  const start = addDays(startOfWeek(today), weekOffset * 7);
  const end = addDays(start, 6);
  const inWeek = notes
    .filter((n) => n.date >= start && n.date <= end)
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));

  return {
    start,
    end,
    done: inWeek.filter((n) => n.type === 'DONE'),
    plans: inWeek.filter((n) => n.type === 'PLAN'),
    blockers: inWeek.filter((n) => n.type === 'BLOCKER'),
  };
}

export function formatWeekRange(report: Pick<WeeklyReport, 'start' | 'end'>): string {
  return `${formatShortDate(report.start)} – ${formatShortDate(report.end)}`;
}

function bullet(note: Note): string {
  const project = note.project ? `[${note.project}] ` : '';
  const resolved = note.type === 'BLOCKER' && note.resolved ? ' (resolved)' : '';
  return `• ${project}${note.text}${resolved}`;
}

function section(title: string, notes: Note[]): string {
  const lines = notes.length > 0 ? notes.map(bullet) : ['• None'];
  return `${title} (${notes.length})\n\n${lines.join('\n')}`;
}

export function generateWeeklyText(report: WeeklyReport): string {
  return [
    `Weekly Report: ${formatWeekRange(report)}`,
    section('Completed', report.done),
    section('Plans', report.plans),
    section('Blockers', report.blockers),
  ].join('\n\n');
}
