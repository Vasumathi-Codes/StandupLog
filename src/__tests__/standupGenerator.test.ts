import { generateStandup } from '@/services/standupGenerator';

import { makeNote } from './helpers';

const TODAY = '2026-09-20';

describe('generateStandup', () => {
  it("puts yesterday's DONE, today's PLAN and active blockers in the right sections", () => {
    const notes = [
      makeNote({ type: 'DONE', date: '2026-09-19', text: 'Fixed API' }),
      makeNote({ type: 'DONE', date: '2026-09-18', text: 'Too old' }),
      makeNote({ type: 'DONE', date: TODAY, text: 'Done today, not yesterday' }),
      makeNote({ type: 'PLAN', date: TODAY, text: 'Start QA' }),
      makeNote({ type: 'PLAN', date: '2026-09-19', text: 'Old plan' }),
      makeNote({ type: 'BLOCKER', date: '2026-09-19', text: 'Waiting for QA env' }),
    ];
    expect(generateStandup(notes, TODAY)).toBe(
      ['Yesterday', '', '• Fixed API', '', 'Today', '', '• Start QA', '', 'Blockers', '', '• Waiting for QA env'].join('\n'),
    );
  });

  it('excludes resolved blockers', () => {
    const notes = [
      makeNote({ type: 'BLOCKER', date: TODAY, text: 'Active' }),
      makeNote({ type: 'BLOCKER', date: TODAY, text: 'Resolved', resolved: true }),
    ];
    const text = generateStandup(notes, TODAY);
    expect(text).toContain('• Active');
    expect(text).not.toContain('Resolved');
  });

  it('includes older unresolved blockers but not future ones', () => {
    const notes = [
      makeNote({ type: 'BLOCKER', date: '2026-09-10', text: 'Old but open' }),
      makeNote({ type: 'BLOCKER', date: '2026-09-25', text: 'Future' }),
    ];
    const text = generateStandup(notes, TODAY);
    expect(text).toContain('Old but open');
    expect(text).not.toContain('Future');
  });

  it('prefixes the project and handles empty sections', () => {
    const text = generateStandup([makeNote({ type: 'PLAN', date: TODAY, text: 'Ship', project: 'MyEHE' })], TODAY);
    expect(text).toContain('• [MyEHE] Ship');
    expect(text).toContain('Yesterday\n\n• Nothing to report');
  });

  it('handles month boundaries when finding yesterday', () => {
    const text = generateStandup([makeNote({ type: 'DONE', date: '2026-08-31', text: 'End of month' })], '2026-09-01');
    expect(text).toContain('• End of month');
  });
});
