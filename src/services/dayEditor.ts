import { NoteChanges } from '@/services/storage';
import { Note, NoteType } from '@/types/note';

// One day + one category is edited as a block of text, one update per line.
// These helpers convert between that text and the individual notes we store.

const BULLET_PREFIX = /^\s*(?:[•\-*–]\s+)?/;

export function notesToEditorText(notes: Note[]): string {
  return sortByCreatedAt(notes)
    .map((note) => note.text)
    .join('\n');
}

// Each non-empty line is one update. Leading bullet characters (from pasted lists) are dropped.
export function parseEditorText(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(BULLET_PREFIX, '').trim())
    .filter((line) => line.length > 0);
}

// The project all notes share, or null if they differ. Empty string when none have one.
export function commonProject(notes: Note[]): string | null {
  const projects = new Set(notes.map((note) => note.project ?? ''));
  return projects.size <= 1 ? [...projects][0] ?? '' : null;
}

function sortByCreatedAt(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

type PlanOptions = {
  type: NoteType;
  date: string; // the date being edited (YYYY-MM-DD): today, or the calendar's selected date
  project: string; // project for new lines (and for every line when projectDirty)
  projectDirty: boolean; // the user changed the project field, so apply it to all lines
  nowMs: number;
};

// Turns "the text as it is now" into storage changes, keeping existing notes (and their ids
// and createdAt) wherever possible:
//  1. a line identical to an existing note keeps that note
//  2. remaining lines take over the remaining notes in order (they count as edits)
//  3. extra lines become new notes; extra notes are deleted
// createdAt doubles as the display order, so it is only rewritten when the order changed.
export function planGroupSave(existing: Note[], lines: string[], options: PlanOptions): NoteChanges {
  const remaining = sortByCreatedAt(existing);
  const assigned: (Note | undefined)[] = lines.map(() => undefined);

  lines.forEach((line, index) => {
    const match = remaining.findIndex((note) => note.text.trim() === line);
    if (match >= 0) assigned[index] = remaining.splice(match, 1)[0];
  });
  lines.forEach((_, index) => {
    if (!assigned[index] && remaining.length > 0) assigned[index] = remaining.shift();
  });

  const baseMs = existing.length > 0 ? Math.min(...existing.map((note) => Date.parse(note.createdAt))) : options.nowMs;
  const project = options.project.trim();
  const changes: NoteChanges = { updates: [], additions: [], deletedIds: remaining.map((note) => note.id) };

  let previousMs = -Infinity;
  lines.forEach((line, index) => {
    const note = assigned[index];
    const own = note ? Date.parse(note.createdAt) : NaN;
    // Keep the note's own time if it still fits the new order; otherwise slot it in just after the previous line.
    const ms = !Number.isNaN(own) && own > previousMs ? own : previousMs === -Infinity ? baseMs : previousMs + 1;
    previousMs = ms;
    const createdAt = new Date(ms).toISOString();

    if (!note) {
      changes.additions.push({ text: line, type: options.type, date: options.date, project, createdAt });
      return;
    }

    const update: NoteChanges['updates'][number] = { id: note.id };
    if (note.text.trim() !== line) update.text = line;
    if (createdAt !== note.createdAt) update.createdAt = createdAt;
    if (options.projectDirty && (note.project ?? '') !== project) update.project = project || undefined;
    if (Object.keys(update).length > 1) changes.updates.push(update);
  });

  return changes;
}
