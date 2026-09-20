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
