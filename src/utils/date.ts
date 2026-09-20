// Work dates are plain "YYYY-MM-DD" strings. We never run them through `new Date("2026-09-18")`,
// because that parses as UTC midnight and can show the previous day in negative-offset timezones.
// Instead we build strings from the *local* year/month/day parts.

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidDateString(value: string): boolean {
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  // Constructing with numeric parts uses local time; check it didn't roll over (e.g. Feb 30).
  const check = new Date(year, month - 1, day);
  return check.getFullYear() === year && check.getMonth() === month - 1 && check.getDate() === day;
}

export function toDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function todayString(): string {
  return toDateString(new Date());
}

export function greeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// e.g. "Sunday, September 20"
export function formatLongDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

// Turns "2026-09-18" into a local Date at midnight, without the UTC shift of new Date("2026-09-18").
export function parseDateString(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export type YearMonth = { year: number; month: number }; // month is 0-11, like JS Date

export function currentYearMonth(): YearMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export function addMonths({ year, month }: YearMonth, delta: number): YearMonth {
  const shifted = new Date(year, month + delta, 1);
  return { year: shifted.getFullYear(), month: shifted.getMonth() };
}

// e.g. "September 2026"
export function formatMonthYear({ year, month }: YearMonth): string {
  return new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// e.g. "September 16" or "September 16, 2026"
export function formatMonthDay(date: string, withYear = false): string {
  return parseDateString(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' } : {}),
  });
}

// Weeks (Monday first) of date strings; null pads days outside the month.
export function getMonthGrid({ year, month }: YearMonth): (string | null)[][] {
  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array(leadingBlanks).fill(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(toDateString(new Date(year, month, day)));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function addDays(date: string, delta: number): string {
  const parsed = parseDateString(date);
  return toDateString(new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate() + delta));
}

// Monday of the week containing `date`.
export function startOfWeek(date: string): string {
  const offset = (parseDateString(date).getDay() + 6) % 7;
  return addDays(date, -offset);
}

// e.g. "Sep 14"
export function formatShortDate(date: string): string {
  return parseDateString(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
