jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { addNote, applyNoteChanges, getNotes } from '@/services/storage';

describe('applyNoteChanges', () => {
  it('edits, adds and deletes in one save, keeping ids, dates and createdAt', async () => {
    const keep = await addNote({ text: 'keep me', type: 'DONE', date: '2026-09-18' });
    const edit = await addNote({ text: 'old text', type: 'DONE', date: '2026-09-18' });
    const remove = await addNote({ text: 'remove me', type: 'DONE', date: '2026-09-18' });

    await applyNoteChanges({
      updates: [{ id: edit.id, text: '  new text ' }],
      additions: [{ text: 'brand new', type: 'DONE', date: '2026-09-18', project: 'MyEHE' }],
      deletedIds: [remove.id],
    });

    const notes = await getNotes();
    expect(notes.map((n) => n.text)).toEqual(['keep me', 'new text', 'brand new']);

    const edited = notes.find((n) => n.id === edit.id)!;
    expect(edited.createdAt).toBe(edit.createdAt);
    expect(edited.date).toBe('2026-09-18');

    expect(notes.find((n) => n.id === keep.id)).toEqual(keep); // untouched

    const added = notes.find((n) => n.text === 'brand new')!;
    expect(added).toMatchObject({ date: '2026-09-18', type: 'DONE', project: 'MyEHE', resolved: false });
  });

  it('saves nothing if an edit is invalid', async () => {
    const before = await getNotes();
    const note = before[0];
    await expect(applyNoteChanges({ updates: [{ id: note.id, text: '   ' }], additions: [], deletedIds: [] })).rejects.toThrow();
    expect(await getNotes()).toEqual(before);
  });
});
