import { groupByDate, searchNotes, summarizeByDate, uniqueProjects } from '@/utils/notes';

import { makeNote } from './helpers';

describe('summarizeByDate', () => {
  it('counts per type and only counts unresolved blockers as active', () => {
    const notes = [
      makeNote({ type: 'DONE', date: '2026-09-16' }),
      makeNote({ type: 'DONE', date: '2026-09-16' }),
      makeNote({ type: 'PLAN', date: '2026-09-16' }),
      makeNote({ type: 'BLOCKER', date: '2026-09-16' }),
      makeNote({ type: 'BLOCKER', date: '2026-09-16', resolved: true }),
      makeNote({ type: 'DONE', date: '2026-09-17' }),
    ];
    const summary = summarizeByDate(notes);
    expect(summary['2026-09-16']).toEqual({ total: 5, done: 2, plan: 1, activeBlockers: 1 });
    expect(summary['2026-09-17'].total).toBe(1);
    expect(summary['2026-09-18']).toBeUndefined();
  });
});

describe('searchNotes and groupByDate', () => {
  const notes = [
    makeNote({ type: 'DONE', date: '2026-09-20', text: 'Fixed account deactivation API' }),
    makeNote({ type: 'DONE', date: '2026-09-18', text: 'Added validation', project: 'Deactivation' }),
    makeNote({ type: 'PLAN', date: '2026-09-15', text: 'Test deactivation flow', project: 'Mobile' }),
    makeNote({ type: 'PLAN', date: '2026-09-15', text: 'Unrelated' }),
  ];

  it('matches text and project case-insensitively, newest first', () => {
    const results = searchNotes(notes, 'DEACTIVATION');
    expect(results.map((n) => n.date)).toEqual(['2026-09-20', '2026-09-18', '2026-09-15']);
  });

  it('filters by project', () => {
    expect(searchNotes(notes, '', 'mobile')).toHaveLength(1);
  });

  it('groups consecutive results by date', () => {
    const groups = groupByDate(searchNotes(notes, ''));
    expect(groups.map((g) => [g.date, g.notes.length])).toEqual([
      ['2026-09-20', 1],
      ['2026-09-18', 1],
      ['2026-09-15', 2],
    ]);
  });

  it('lists unique projects', () => {
    expect(uniqueProjects([...notes, makeNote({ type: 'DONE', date: '2026-09-01', project: 'mobile' })])).toEqual([
      'Deactivation',
      'Mobile',
    ]);
  });
});
