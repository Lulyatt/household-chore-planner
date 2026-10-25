import type { RecurrenceRule } from "./recurrenceRule";

/** UTC calendar date at midnight (matches `@db.Date` storage). */
export function utcDateFromParts(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

export function parseUtcDateKey(key: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) {
    throw new Error(`Invalid date key: ${key}`);
  }
  return utcDateFromParts(
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
  );
}

export function formatUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function startOfUtcDay(date: Date): Date {
  return utcDateFromParts(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
  );
}

export function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return startOfUtcDay(next);
}

/**
 * Lists due dates for a rule between `fromDate` and `toDate` (inclusive), UTC.
 * Pure function for unit tests and occurrence generation (#18).
 */
export function listRecurrenceDueDatesInRange(
  rule: RecurrenceRule,
  fromDate: Date,
  toDate: Date,
): Date[] {
  const from = startOfUtcDay(fromDate);
  const to = startOfUtcDay(toDate);
  if (from.getTime() > to.getTime()) {
    return [];
  }

  if (rule.kind === "weekly") {
    const dates: Date[] = [];
    for (let cursor = from; cursor.getTime() <= to.getTime(); cursor = addUtcDays(cursor, 1)) {
      if (cursor.getUTCDay() === rule.weekday) {
        dates.push(cursor);
      }
    }
    return dates;
  }

  const anchor = parseUtcDateKey(rule.anchorDate);
  const dates: Date[] = [];
  if (anchor.getTime() > to.getTime()) {
    return dates;
  }

  let k = 0;
  let cursor = anchor;
  while (cursor.getTime() < from.getTime()) {
    k += 1;
    cursor = addUtcDays(anchor, k * rule.intervalDays);
  }

  while (cursor.getTime() <= to.getTime()) {
    dates.push(cursor);
    k += 1;
    cursor = addUtcDays(anchor, k * rule.intervalDays);
  }

  return dates;
}
