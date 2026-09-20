import AsyncStorage from '@react-native-async-storage/async-storage';

import { DISMISSED_KEY } from '@/services/carryOver';
import { SETTINGS_KEY } from '@/services/settings';
import { isNote, NOTES_KEY } from '@/services/storage';
import { Note } from '@/types/note';
import { isValidDateString } from '@/utils/date';

export const BACKUP_VERSION = 1;

export type Backup = {
  app: 'standup-log';
  version: number;
  exportedAt: string;
  notes: Note[];
  projects: string[];
};

// Thrown with a message that is safe to show to the user.
export class BackupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackupError';
  }
}

export function createBackup(notes: Note[], projects: string[], now: Date = new Date()): Backup {
  return { app: 'standup-log', version: BACKUP_VERSION, exportedAt: now.toISOString(), notes, projects };
}

export function serializeBackup(backup: Backup): string {
  return JSON.stringify(backup, null, 2);
}

// Reads a backup made by serializeBackup. Notes that are malformed are skipped and counted.
export function parseBackup(text: string): { notes: Note[]; projects: string[]; skipped: number } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new BackupError('That does not look like a Standup Log backup.');
  }
  const backup = data as Partial<Backup> | null;
  if (!backup || backup.app !== 'standup-log' || !Array.isArray(backup.notes)) {
    throw new BackupError('That does not look like a Standup Log backup.');
  }
  if (typeof backup.version === 'number' && backup.version > BACKUP_VERSION) {
    throw new BackupError('This backup was made by a newer version of Standup Log.');
  }

  const now = new Date().toISOString();
  const notes: Note[] = [];
  let skipped = 0;
  for (const raw of backup.notes as unknown[]) {
    if (!isNote(raw) || !isValidDateString(raw.date) || !raw.text.trim()) {
      skipped += 1;
      continue;
    }
    notes.push({
      id: raw.id,
      text: raw.text,
      type: raw.type,
      date: raw.date,
      project: typeof raw.project === 'string' && raw.project ? raw.project : undefined,
      carriedFrom: typeof raw.carriedFrom === 'string' ? raw.carriedFrom : undefined,
      resolved: raw.resolved,
      createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : now,
      updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : now,
    });
  }
  const projects = Array.isArray(backup.projects) ? backup.projects.filter((p): p is string => typeof p === 'string' && !!p.trim()) : [];
  return { notes, projects, skipped };
}

export type ImportPlan = {
  additions: Note[]; // not on this device yet
  updates: Note[]; // same id, but the backup's copy was edited more recently
  unchanged: number; // same id, and this device's copy is as new or newer: left alone
};

// Merging never deletes anything and never overwrites a note that is newer on this device.
export function planImport(existing: Note[], incoming: Note[]): ImportPlan {
  const byId = new Map(existing.map((note) => [note.id, note]));
  const plan: ImportPlan = { additions: [], updates: [], unchanged: 0 };
  for (const note of incoming) {
    const current = byId.get(note.id);
    if (!current) plan.additions.push(note);
    else if (note.updatedAt > current.updatedAt) plan.updates.push(note);
    else plan.unchanged += 1;
  }
  return plan;
}

export function mergeNotes(existing: Note[], plan: ImportPlan): Note[] {
  const replacements = new Map(plan.updates.map((note) => [note.id, note]));
  return [...existing.map((note) => replacements.get(note.id) ?? note), ...plan.additions];
}

// Removes everything Standup Log keeps on this device: updates, settings (which include
// projects) and dismissed carry-over suggestions.
export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([NOTES_KEY, SETTINGS_KEY, DISMISSED_KEY]);
}
