import { buildWeeklyReport, formatWeekRange, generateWeeklyText } from '@/services/weeklyReport';

import { makeNote } from './helpers';

describe('buildWeeklyReport', () => {
  // 2026-09-20 is a Sunday, so its week is Mon Sep 14 - Sun Sep 20.
  const notes = [
    makeNote({ type: 'DONE', date: '2026-09-14', text: 'Monday' }),
    makeNote({ type: 'DONE', date: '2026-09-20', text: 'Sunday' }),
    makeNote({ type: 'DONE', date: '2026-09-13', text: 'Previous Sunday' }),
    makeNote({ type: 'DONE', date: '2026-09-21', text: 'Next Monday' }),
    makeNote({ type: 'PLAN', date: '2026-09-16' }),
    makeNote({ type: 'BLOCKER', date: '2026-09-17', text: 'Stuck', resolved: true }),
  ];

  it('covers Monday to Sunday inclusive', () => {
    const report = buildWeeklyReport(notes, '2026-09-20');
    expect([report.start, report.end]).toEqual(['2026-09-14', '2026-09-20']);
    expect(report.done.map((n) => n.text)).toEqual(['Monday', 'Sunday']);
    expect(report.plans).toHaveLength(1);
    expect(report.blockers).toHaveLength(1);
  });

  it('supports other weeks via offset', () => {
    const report = buildWeeklyReport(notes, '2026-09-20', -1);
    expect(report.done.map((n) => n.text)).toEqual(['Previous Sunday']);
  });

  it('formats range and text, marking resolved blockers', () => {
    const report = buildWeeklyReport(notes, '2026-09-20');
    expect(formatWeekRange(report)).toBe('Sep 14 – Sep 20');
    const text = generateWeeklyText(report);
    expect(text).toContain('Completed (2)');
    expect(text).toContain('• Stuck (resolved)');
  });
});
