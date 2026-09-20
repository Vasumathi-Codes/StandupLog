jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';

import { BackupError, clearAllData, createBackup, mergeNotes, parseBackup, planImport, serializeBackup } from '@/services/backup';
import { addNote, getNotes } from '@/services/storage';

import { makeNote } from './helpers';

describe('backup round trip', () => {
  it('parses what it exports', () => {
    const notes = [makeNote({ type: 'DONE', date: '2026-09-18', text: 'Hello', project: 'MyEHE' })];
    const parsed = parseBackup(serializeBackup(createBackup(notes, ['MyEHE', 'Other'])));
    expect(parsed.notes).toEqual(notes);
    expect(parsed.projects).toEqual(['MyEHE', 'Other']);
    expect(parsed.skipped).toBe(0);
  });

  it('rejects things that are not backups with a friendly error', () => {
    expect(() => parseBackup('not json')).toThrow(BackupError);
    expect(() => parseBackup('{"hello":1}')).toThrow(BackupError);
    expect(() => parseBackup(JSON.stringify({ app: 'standup-log', version: 99, notes: [] }))).toThrow(/newer version/);
  });

  it('skips malformed notes and counts them', () => {
    const good = makeNote({ type: 'PLAN', date: '2026-09-18' });
    const text = JSON.stringify({ app: 'standup-log', version: 1, notes: [good, { id: 'x' }, { ...good, id: 'y', date: '2026-02-30' }], projects: [] });
    const parsed = parseBackup(text);
    expect(parsed.notes).toHaveLength(1);
    expect(parsed.skipped).toBe(2);
  });
});

describe('planImport / mergeNotes', () => {
  it('adds new notes, updates only older local copies, and never deletes', () => {
    const local = makeNote({ type: 'DONE', date: '2026-09-18', text: 'local', updatedAt: '2026-09-18T10:00:00.000Z' });
    const localNewer = makeNote({ type: 'DONE', date: '2026-09-18', text: 'local newer', updatedAt: '2026-09-19T10:00:00.000Z' });
    const localOnly = makeNote({ type: 'DONE', date: '2026-09-17', text: 'only here' });
    const incoming = [
      { ...local, text: 'from backup', updatedAt: '2026-09-18T12:00:00.000Z' },
      { ...localNewer, text: 'older backup copy', updatedAt: '2026-09-18T12:00:00.000Z' },
      makeNote({ type: 'PLAN', date: '2026-09-18', text: 'brand new' }),
    ];

    const plan = planImport([local, localNewer, localOnly], incoming);
    expect(plan.additions.map((n) => n.text)).toEqual(['brand new']);
    expect(plan.updates.map((n) => n.text)).toEqual(['from backup']);
    expect(plan.unchanged).toBe(1);

    const merged = mergeNotes([local, localNewer, localOnly], plan);
    expect(merged.map((n) => n.text)).toEqual(['from backup', 'local newer', 'only here', 'brand new']);
  });

  it('importing the same backup twice changes nothing', () => {
    const notes = [makeNote({ type: 'DONE', date: '2026-09-18' })];
    const plan = planImport(notes, notes);
    expect(plan).toEqual({ additions: [], updates: [], unchanged: 1 });
  });
});

describe('clearAllData', () => {
  it('removes notes, settings and dismissed suggestions', async () => {
    await addNote({ text: 'x', type: 'DONE', date: '2026-09-18' });
    await AsyncStorage.setItem('standuplog:settings:v1', '{}');
    await AsyncStorage.setItem('standuplog:carryover-dismissed:v1', '[]');
    await clearAllData();
    expect(await getNotes()).toEqual([]);
    expect(await AsyncStorage.getItem('standuplog:settings:v1')).toBeNull();
    expect(await AsyncStorage.getItem('standuplog:carryover-dismissed:v1')).toBeNull();
  });
});
