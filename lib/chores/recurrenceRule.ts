/**
 * Recurrence rules stored on {@link ChoreDefinition.recurrenceRule} (JSON).
 * Weekdays follow JavaScript UTC convention: 0 = Sunday … 6 = Saturday.
 */

export type WeeklyRecurrenceRule = {
  kind: "weekly";
  weekday: number;
};

export type EveryNDaysRecurrenceRule = {
  kind: "every_n_days";
  intervalDays: number;
  anchorDate: string;
};

export type RecurrenceRule = WeeklyRecurrenceRule | EveryNDaysRecurrenceRule;

export function isRecurrenceRule(value: unknown): value is RecurrenceRule {
  if (value == null || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  if (record.kind === "weekly") {
    return (
      typeof record.weekday === "number" &&
      Number.isInteger(record.weekday) &&
      record.weekday >= 0 &&
      record.weekday <= 6
    );
  }
  if (record.kind === "every_n_days") {
    return (
      typeof record.intervalDays === "number" &&
      Number.isInteger(record.intervalDays) &&
      record.intervalDays >= 1 &&
      record.intervalDays <= 366 &&
      typeof record.anchorDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(record.anchorDate)
    );
  }
  return false;
}

export type ParseRecurrenceFormResult =
  | { ok: true; rule: RecurrenceRule | null }
  | { ok: false; message: string };

/**
 * Reads recurrence fields from the new-chore form. When recurrence is off, returns null.
 */
export function parseRecurrenceFromForm(input: {
  enabled: boolean;
  kind: string | null | undefined;
  weekdayRaw: string | null | undefined;
  intervalDaysRaw: string | null | undefined;
  firstDueDate: string | null | undefined;
}): ParseRecurrenceFormResult {
  if (!input.enabled) {
    return { ok: true, rule: null };
  }

  const firstDue = input.firstDueDate?.trim() ?? "";
  if (firstDue.length === 0) {
    return {
      ok: false,
      message: "First due date is required for recurring chores.",
    };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(firstDue)) {
    return {
      ok: false,
      message: "Due date must be a valid calendar date.",
    };
  }

  const kind = input.kind?.trim() ?? "";
  if (kind === "weekly") {
    const weekdayRaw = input.weekdayRaw?.trim() ?? "";
    const weekday = Number.parseInt(weekdayRaw, 10);
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
      return { ok: false, message: "Pick a weekday for weekly recurrence." };
    }
    const dueWeekday = new Date(`${firstDue}T00:00:00.000Z`).getUTCDay();
    if (dueWeekday !== weekday) {
      return {
        ok: false,
        message: "First due date must fall on the selected weekday.",
      };
    }
    return { ok: true, rule: { kind: "weekly", weekday } };
  }

  if (kind === "every_n_days") {
    const intervalRaw = input.intervalDaysRaw?.trim() ?? "";
    const intervalDays = Number.parseInt(intervalRaw, 10);
    if (!Number.isInteger(intervalDays) || intervalDays < 1 || intervalDays > 366) {
      return {
        ok: false,
        message: "Repeat every N days must be between 1 and 366.",
      };
    }
    return {
      ok: true,
      rule: {
        kind: "every_n_days",
        intervalDays,
        anchorDate: firstDue,
      },
    };
  }

  return { ok: false, message: "Pick a recurrence pattern." };
}

export function formatRecurrenceRuleSummary(rule: RecurrenceRule): string {
  const weekdayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  if (rule.kind === "weekly") {
    return `Weekly on ${weekdayNames[rule.weekday] ?? "?"}`;
  }
  return `Every ${rule.intervalDays} day${rule.intervalDays === 1 ? "" : "s"} from ${rule.anchorDate}`;
}
