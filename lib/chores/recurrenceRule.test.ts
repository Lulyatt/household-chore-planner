import { describe, expect, it } from "vitest";
import { parseRecurrenceFromForm } from "./recurrenceRule";

describe("parseRecurrenceFromForm", () => {
  it("returns null when recurrence is disabled", () => {
    expect(
      parseRecurrenceFromForm({
        enabled: false,
        kind: "weekly",
        weekdayRaw: "1",
        intervalDaysRaw: "7",
        firstDueDate: "2026-10-05",
      }),
    ).toEqual({ ok: true, rule: null });
  });

  it("parses weekly recurrence when the first due date matches", () => {
    expect(
      parseRecurrenceFromForm({
        enabled: true,
        kind: "weekly",
        weekdayRaw: "1",
        intervalDaysRaw: null,
        firstDueDate: "2026-10-05",
      }),
    ).toEqual({ ok: true, rule: { kind: "weekly", weekday: 1 } });
  });

  it("rejects weekly recurrence when the first due date is on another weekday", () => {
    const result = parseRecurrenceFromForm({
      enabled: true,
      kind: "weekly",
      weekdayRaw: "1",
      intervalDaysRaw: null,
      firstDueDate: "2026-10-06",
    });
    expect(result.ok).toBe(false);
  });

  it("parses every-N-days recurrence using the first due date as anchor", () => {
    expect(
      parseRecurrenceFromForm({
        enabled: true,
        kind: "every_n_days",
        weekdayRaw: null,
        intervalDaysRaw: "3",
        firstDueDate: "2026-10-01",
      }),
    ).toEqual({
      ok: true,
      rule: {
        kind: "every_n_days",
        intervalDays: 3,
        anchorDate: "2026-10-01",
      },
    });
  });
});
