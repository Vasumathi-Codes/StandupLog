jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { getCarryOverCandidates } from '@/services/carryOver';

import { makeNote } from './helpers';

const TODAY = '2026-09-20';

describe('getCarryOverCandidates', () => {
  it('suggests earlier plans that are unfinished', () => {
    const plan = makeNote({ type: 'PLAN', date: '2026-09-19', text: 'Write docs' });
    expect(getCarryOverCandidates([plan], [], TODAY)).toEqual([plan]);
  });

  it("ignores today's plans, old plans, and non-plans", () => {
    const notes = [
      makeNote({ type: 'PLAN', date: TODAY }),
      makeNote({ type: 'PLAN', date: '2026-09-01' }),
      makeNote({ type: 'DONE', date: '2026-09-19' }),
    ];
    expect(getCarryOverCandidates(notes, [], TODAY)).toEqual([]);
  });

  it('skips plans completed by a matching DONE note, already carried, or dismissed', () => {
    const completed = makeNote({ type: 'PLAN', date: '2026-09-18', text: 'Ship it' });
    const done = makeNote({ type: 'DONE', date: '2026-09-19', text: ' ship IT ' });
    const carried = makeNote({ type: 'PLAN', date: '2026-09-18', text: 'Carried' });
    const copy = makeNote({ type: 'PLAN', date: '2026-09-19', text: 'Carried', carriedFrom: carried.id });
    const dismissed = makeNote({ type: 'PLAN', date: '2026-09-18', text: 'Dismissed' });
    const result = getCarryOverCandidates([completed, done, carried, copy, dismissed], [dismissed.id], TODAY);
    // Only the copy (dated yesterday) remains a candidate for today.
    expect(result).toEqual([copy]);
  });
});
