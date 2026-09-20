import AsyncStorage from '@react-native-async-storage/async-storage';

import { NewNoteInput, Note, NoteUpdate } from '@/types/note';
import { isValidDateString } from '@/utils/date';

// Bump the suffix if the stored shape ever changes, so we can migrate.
const NOTES_KEY = 'standuplog:notes:v1';

// Thrown for anything the UI should show as a friendly message.
export class StorageError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'StorageError';
  }
}

function isNote(value: unknown): value is Note {
  if (typeof value !== 'object' || value === null) return false;
  const note = value as Record<string, unknown>;
  return (
    typeof note.id === 'string' &&
    typeof note.text === 'string' &&
    (note.type === 'DONE' || note.type === 'PLAN' || note.type === 'BLOCKER') &&
    typeof note.date === 'string' &&
    typeof note.resolved === 'boolean'
  );
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function validateText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) throw new StorageError('Please enter some text for your update.');
  return trimmed;
}

function validateDate(date: string): void {
  if (!isValidDateString(date)) throw new StorageError('That date is not valid.');
}

function cleanProject(project?: string): string | undefined {
  const trimmed = project?.trim();
  return trimmed ? trimmed : undefined;
}

export async function getNotes(): Promise<Note[]> {
  try {
    const raw = await AsyncStorage.getItem(NOTES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Stored notes are not an array');
    return parsed.filter(isNote);
  } catch (error) {
    console.error('[storage] getNotes failed', error);
    throw new StorageError('Could not load your updates.', error);
  }
}

export async function saveNotes(notes: Note[]): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('[storage] saveNotes failed', error);
    throw new StorageError('Could not save your updates.', error);
  }
}

export async function addNote(input: NewNoteInput): Promise<Note> {
  const text = validateText(input.text);
  validateDate(input.date);

  const now = new Date().toISOString();
  const note: Note = {
    id: generateId(),
    text,
    type: input.type,
    date: input.date,
    project: cleanProject(input.project),
    carriedFrom: input.carriedFrom,
    resolved: false,
    createdAt: now,
    updatedAt: now,
  };

  const notes = await getNotes();
  await saveNotes([...notes, note]);
  return note;
}

export async function updateNote(id: string, changes: NoteUpdate): Promise<Note> {
  const notes = await getNotes();
  const index = notes.findIndex((note) => note.id === id);
  if (index === -1) throw new StorageError('That update no longer exists.');

  const existing = notes[index];
  const updated: Note = {
    ...existing,
    ...changes,
    text: changes.text !== undefined ? validateText(changes.text) : existing.text,
    project: 'project' in changes ? cleanProject(changes.project) : existing.project,
    updatedAt: new Date().toISOString(),
  };
  validateDate(updated.date);

  const next = [...notes];
  next[index] = updated;
  await saveNotes(next);
  return updated;
}

export async function deleteNote(id: string): Promise<void> {
  const notes = await getNotes();
  await saveNotes(notes.filter((note) => note.id !== id));
}

// Development helper: wipes every note.
export async function clearNotes(): Promise<void> {
  try {
    await AsyncStorage.removeItem(NOTES_KEY);
  } catch (error) {
    console.error('[storage] clearNotes failed', error);
    throw new StorageError('Could not clear your updates.', error);
  }
}

export async function getNotesForDate(date: string): Promise<Note[]> {
  const notes = await getNotes();
  return notes.filter((note) => note.date === date);
}

// Inclusive on both ends. YYYY-MM-DD strings sort correctly as plain strings.
export async function getNotesBetweenDates(startDate: string, endDate: string): Promise<Note[]> {
  const notes = await getNotes();
  return notes.filter((note) => note.date >= startDate && note.date <= endDate);
}

// Removes the project tag from every note that uses it. The notes themselves are kept.
export async function clearProjectFromNotes(project: string): Promise<void> {
  const target = project.toLowerCase();
  const notes = await getNotes();
  await saveNotes(notes.map((note) => (note.project?.toLowerCase() === target ? { ...note, project: undefined } : note)));
}
