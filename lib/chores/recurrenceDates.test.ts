import { describe, expect, it } from "vitest";
import {
  formatUtcDateKey,
  listRecurrenceDueDatesInRange,
  parseUtcDateKey,
} from "./recurrenceDates";

describe("listRecurrenceDueDatesInRange", () => {
  it("lists weekly dates on the chosen weekday within the range", () => {
    const from = parseUtcDateKey("2026-10-01");
    const to = parseUtcDateKey("2026-10-31");
    const dates = listRecurrenceDueDatesInRange(
      { kind: "weekly", weekday: 1 },
      from,
      to,
    );
    expect(dates.map(formatUtcDateKey)).toEqual([
      "2026-10-05",
      "2026-10-12",
      "2026-10-19",
      "2026-10-26",
    ]);
  });

  it("lists every-N-days dates from the anchor within the range", () => {
    const from = parseUtcDateKey("2026-10-10");
    const to = parseUtcDateKey("2026-10-25");
    const dates = listRecurrenceDueDatesInRange(
      {
        kind: "every_n_days",
        intervalDays: 3,
        anchorDate: "2026-10-01",
      },
      from,
      to,
    );
    expect(dates.map(formatUtcDateKey)).toEqual([
      "2026-10-10",
      "2026-10-13",
      "2026-10-16",
      "2026-10-19",
      "2026-10-22",
      "2026-10-25",
    ]);
  });

  it("returns an empty list when the range ends before the anchor", () => {
    const dates = listRecurrenceDueDatesInRange(
      {
        kind: "every_n_days",
        intervalDays: 7,
        anchorDate: "2026-12-01",
      },
      parseUtcDateKey("2026-10-01"),
      parseUtcDateKey("2026-10-31"),
    );
    expect(dates).toEqual([]);
  });
});
