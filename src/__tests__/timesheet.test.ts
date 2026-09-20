import { generateTimesheetText } from '@/services/timesheet';

import { makeNote } from './helpers';

const DAY = '2026-09-18';

describe('generateTimesheetText', () => {
  it('lists DONE notes and active blockers for the date only', () => {
    const notes = [
      makeNote({ type: 'DONE', date: DAY, text: 'fixed appointment api bug', project: 'MyEHE' }),
      makeNote({ type: 'DONE', date: DAY, text: 'Completed QA testing' }),
      makeNote({ type: 'PLAN', date: DAY, text: 'Review PR' }),
      makeNote({ type: 'BLOCKER', date: DAY, text: 'Waiting for backend' }),
      makeNote({ type: 'BLOCKER', date: DAY, text: 'Old resolved one', resolved: true }),
      makeNote({ type: 'DONE', date: '2026-09-19', text: 'Other day' }),
      makeNote({ type: 'BLOCKER', date: '2026-09-17', text: 'Other day blocker' }),
    ];
    expect(generateTimesheetText(notes, DAY)).toBe(
      ['Worked on:', '- fixed appointment api bug', '- Completed QA testing', '', 'Blockers:', '- Waiting for backend'].join('\n'),
    );
  });

  it('says None when there are no active blockers', () => {
    const text = generateTimesheetText([makeNote({ type: 'DONE', date: DAY, text: 'Did a thing' })], DAY);
    expect(text).toBe('Worked on:\n- Did a thing\n\nBlockers:\n- None');
  });

  it('says so when nothing was completed', () => {
    const text = generateTimesheetText([makeNote({ type: 'BLOCKER', date: DAY, text: 'Stuck' })], DAY);
    expect(text).toBe('Worked on:\n- No completed updates recorded\n\nBlockers:\n- Stuck');
  });

  it('handles an empty day', () => {
    expect(generateTimesheetText([], DAY)).toBe('Worked on:\n- No completed updates recorded\n\nBlockers:\n- None');
  });

  it('never includes plans, projects or metadata', () => {
    const note = makeNote({ type: 'DONE', date: DAY, text: 'Only text', project: 'Secret' });
    const text = generateTimesheetText([note, makeNote({ type: 'PLAN', date: DAY, text: 'A plan' })], DAY);
    expect(text).not.toMatch(/Secret|A plan|n\d+|2026-/);
  });
});

describe('generateTimesheetText without blockers', () => {
  it('leaves the Blockers section out when turned off', () => {
    const notes = [makeNote({ type: 'DONE', date: DAY, text: 'Did it' }), makeNote({ type: 'BLOCKER', date: DAY, text: 'Stuck' })];
    expect(generateTimesheetText(notes, DAY, { includeBlockers: false })).toBe('Worked on:\n- Did it');
  });
});
