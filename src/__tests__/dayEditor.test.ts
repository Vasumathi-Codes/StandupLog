import { commonProject, notesToEditorText, parseEditorText, planGroupSave } from '@/services/dayEditor';

import { makeNote } from './helpers';

const DATE = '2026-09-18';
const opts = { type: 'DONE' as const, date: DATE, project: '', projectDirty: false, nowMs: Date.parse('2026-09-20T12:00:00.000Z') };

function threeNotes() {
  return [
    makeNote({ type: 'DONE', date: DATE, text: 'A', createdAt: '2026-09-18T09:00:00.000Z' }),
    makeNote({ type: 'DONE', date: DATE, text: 'B', createdAt: '2026-09-18T10:00:00.000Z' }),
    makeNote({ type: 'DONE', date: DATE, text: 'C', createdAt: '2026-09-18T11:00:00.000Z' }),
  ];
}

describe('editor text helpers', () => {
  it('turns notes into one line each, in the order added', () => {
    const [a, b, c] = threeNotes();
    expect(notesToEditorText([c, a, b])).toBe('A\nB\nC');
  });

  it('parses lines, dropping blanks, bullets and extra spaces', () => {
    expect(parseEditorText('• one\n\n  - two  \n* three\r\nfour')).toEqual(['one', 'two', 'three', 'four']);
    expect(parseEditorText('  \n\n')).toEqual([]);
  });

  it('finds a shared project, or null when mixed', () => {
    expect(commonProject([makeNote({ type: 'DONE', date: DATE, project: 'X' }), makeNote({ type: 'DONE', date: DATE, project: 'X' })])).toBe('X');
    expect(commonProject([makeNote({ type: 'DONE', date: DATE }), makeNote({ type: 'DONE', date: DATE, project: 'X' })])).toBeNull();
    expect(commonProject([])).toBe('');
  });
});

describe('planGroupSave', () => {
  it('changes nothing when the text is unchanged', () => {
    const plan = planGroupSave(threeNotes(), ['A', 'B', 'C'], opts);
    expect(plan).toEqual({ updates: [], additions: [], deletedIds: [] });
  });

  it('edits a line in place, keeping id and createdAt', () => {
    const notes = threeNotes();
    const plan = planGroupSave(notes, ['A', 'B fixed', 'C'], opts);
    expect(plan.updates).toEqual([{ id: notes[1].id, text: 'B fixed' }]);
    expect(plan.additions).toEqual([]);
    expect(plan.deletedIds).toEqual([]);
  });

  it('deletes lines that were removed', () => {
    const notes = threeNotes();
    const plan = planGroupSave(notes, ['A', 'C'], opts);
    expect(plan.deletedIds).toEqual([notes[1].id]);
    expect(plan.additions).toEqual([]);
    expect(plan.updates).toEqual([]);
  });

  it('adds new lines dated to the edited day, not today', () => {
    const plan = planGroupSave(threeNotes(), ['A', 'B', 'C', 'D'], { ...opts, project: 'MyEHE' });
    expect(plan.additions).toHaveLength(1);
    expect(plan.additions[0]).toMatchObject({ text: 'D', type: 'DONE', date: DATE, project: 'MyEHE' });
    expect(plan.deletedIds).toEqual([]);
  });

  it('treats a replaced line as an edit of the same note', () => {
    const notes = threeNotes();
    const plan = planGroupSave(notes, ['A', 'C', 'D'], opts);
    expect(plan.deletedIds).toEqual([]);
    expect(plan.updates.find((u) => u.id === notes[1].id)?.text).toBe('D');
  });

  it('inserts a new line in the middle without disturbing the others', () => {
    const notes = threeNotes();
    const plan = planGroupSave(notes, ['A', 'NEW', 'B', 'C'], opts);
    const times = [
      notes[0].createdAt,
      plan.additions[0].createdAt!,
      plan.updates.find((u) => u.id === notes[1].id)?.createdAt ?? notes[1].createdAt,
      plan.updates.find((u) => u.id === notes[2].id)?.createdAt ?? notes[2].createdAt,
    ];
    expect([...times].sort()).toEqual(times); // display order matches the line order
    expect(plan.deletedIds).toEqual([]);
  });

  it('keeps every note when reordering, only rewriting times', () => {
    const notes = threeNotes();
    const plan = planGroupSave(notes, ['C', 'A', 'B'], opts);
    expect(plan.additions).toEqual([]);
    expect(plan.deletedIds).toEqual([]);
    expect(plan.updates.every((u) => u.text === undefined)).toBe(true);
    const created = new Map(notes.map((n) => [n.id, n.createdAt]));
    plan.updates.forEach((u) => created.set(u.id, u.createdAt ?? created.get(u.id)!));
    const order = notes.slice().sort((x, y) => created.get(x.id)!.localeCompare(created.get(y.id)!)).map((n) => n.text);
    expect(order).toEqual(['C', 'A', 'B']);
  });

  it('adds everything when the day was empty, and deletes everything when cleared', () => {
    const fresh = planGroupSave([], ['One', 'Two'], opts);
    expect(fresh.additions.map((a) => a.text)).toEqual(['One', 'Two']);
    expect(fresh.additions[0].createdAt! < fresh.additions[1].createdAt!).toBe(true);

    const notes = threeNotes();
    expect(planGroupSave(notes, [], opts).deletedIds).toHaveLength(3);
  });

  it('only changes projects of existing notes when the project was edited', () => {
    const notes = threeNotes().map((n) => ({ ...n, project: 'Old' }));
    expect(planGroupSave(notes, ['A', 'B', 'C'], { ...opts, project: 'Other' }).updates).toEqual([]);
    const dirty = planGroupSave(notes, ['A', 'B', 'C'], { ...opts, project: 'New', projectDirty: true });
    expect(dirty.updates).toHaveLength(3);
    expect(dirty.updates.every((u) => u.project === 'New')).toBe(true);
  });
});
