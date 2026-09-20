import { Note } from '@/types/note';
import { addDays } from '@/utils/date';
import { isActiveBlocker } from '@/utils/notes';

const EMPTY_LINE = '• Nothing to report';

function bullet(note: Note): string {
  return note.project ? `• [${note.project}] ${note.text}` : `• ${note.text}`;
}

function section(title: string, notes: Note[]): string {
  const lines = notes.length > 0 ? notes.map(bullet) : [EMPTY_LINE];
  return `${title}\n\n${lines.join('\n')}`;
}

function byCreatedAt(a: Note, b: Note): number {
  return a.createdAt.localeCompare(b.createdAt);
}

// Plain-text standup for `today` (YYYY-MM-DD):
//  - Yesterday: DONE notes dated yesterday
//  - Today:     PLAN notes dated today
//  - Blockers:  every unresolved blocker dated today or earlier
export function generateStandup(notes: Note[], today: string): string {
  const yesterday = addDays(today, -1);

  const done = notes.filter((n) => n.type === 'DONE' && n.date === yesterday).sort(byCreatedAt);
  const plans = notes.filter((n) => n.type === 'PLAN' && n.date === today).sort(byCreatedAt);
  const blockers = notes.filter((n) => isActiveBlocker(n) && n.date <= today).sort(byCreatedAt);

  return [section('Yesterday', done), section('Today', plans), section('Blockers', blockers)].join('\n\n');
}
