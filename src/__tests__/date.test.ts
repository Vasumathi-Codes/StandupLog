import { addDays, addMonths, getMonthGrid, isValidDateString, startOfWeek, toDateString } from '@/utils/date';

describe('date helpers', () => {
  it('validates real calendar dates only', () => {
    expect(isValidDateString('2026-09-18')).toBe(true);
    expect(isValidDateString('2026-02-30')).toBe(false);
    expect(isValidDateString('2026-9-1')).toBe(false);
  });

  it('formats local dates without timezone shifts', () => {
    expect(toDateString(new Date(2026, 8, 18, 23, 59))).toBe('2026-09-18');
    expect(toDateString(new Date(2026, 8, 18, 0, 1))).toBe('2026-09-18');
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('finds Monday as start of week', () => {
    expect(startOfWeek('2026-09-20')).toBe('2026-09-14'); // Sunday
    expect(startOfWeek('2026-09-14')).toBe('2026-09-14'); // Monday
  });

  it('wraps months across years', () => {
    expect(addMonths({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(addMonths({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
  });

  it('builds a Monday-first grid for September 2026', () => {
    const grid = getMonthGrid({ year: 2026, month: 8 });
    expect(grid[0].slice(0, 2)).toEqual([null, '2026-09-01']); // Sep 1 2026 is a Tuesday
    expect(grid.every((week) => week.length === 7)).toBe(true);
    expect(grid.flat().filter(Boolean)).toHaveLength(30);
  });
});
