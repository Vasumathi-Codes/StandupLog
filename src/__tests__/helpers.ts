import { Note, NoteType } from '@/types/note';

let counter = 0;

export function makeNote(overrides: Partial<Note> & { type: NoteType; date: string }): Note {
  counter += 1;
  return {
    id: `n${counter}`,
    text: `Note ${counter}`,
    resolved: false,
    createdAt: `2026-09-20T10:${String(counter % 60).padStart(2, '0')}:00.000Z`,
    updatedAt: `2026-09-20T10:00:00.000Z`,
    ...overrides,
  };
}
