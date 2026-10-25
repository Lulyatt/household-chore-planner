import { describe, expect, it } from "vitest";
import {
  contributionWindowStart,
  sortTodayOverdueRows,
  DASHBOARD_UPCOMING_WINDOW_DAYS,
} from "./dashboardQueries";
import { addUtcDays, startOfUtcDay } from "./recurrenceDates";

describe("sortTodayOverdueRows", () => {
  const asOf = new Date("2026-10-25T15:00:00.000Z");

  it("orders overdue before due today and sorts overdue by due date", () => {
    const rows = [
      {
        dueDate: startOfUtcDay(new Date("2026-10-25")),
        status: "PENDING" as const,
        id: "today",
      },
      {
        dueDate: startOfUtcDay(new Date("2026-10-20")),
        status: "PENDING" as const,
        id: "old-overdue",
      },
      {
        dueDate: startOfUtcDay(new Date("2026-10-24")),
        status: "PENDING" as const,
        id: "recent-overdue",
      },
    ];

    const sorted = sortTodayOverdueRows(rows, asOf);
    expect(sorted.map((r) => r.id)).toEqual([
      "old-overdue",
      "recent-overdue",
      "today",
    ]);
  });
});

describe("contributionWindowStart", () => {
  it("returns the first UTC day of the month", () => {
    const start = contributionWindowStart(new Date("2026-10-25T12:00:00.000Z"));
    expect(start.toISOString()).toBe("2026-10-01T00:00:00.000Z");
  });
});

describe("DASHBOARD_UPCOMING_WINDOW_DAYS", () => {
  it("documents a 14-day upcoming horizon", () => {
    expect(DASHBOARD_UPCOMING_WINDOW_DAYS).toBe(14);
    const today = startOfUtcDay(new Date("2026-10-25"));
    const end = addUtcDays(today, DASHBOARD_UPCOMING_WINDOW_DAYS);
    expect(end.toISOString()).toBe("2026-11-08T00:00:00.000Z");
  });
});
