import { describe, expect, it } from "vitest";
import {
  getOccurrenceDisplayStatus,
  isOccurrenceOverdue,
} from "./occurrenceStatus";

describe("isOccurrenceOverdue", () => {
  const asOf = new Date("2026-10-25T15:30:00.000Z");

  it("treats pending rows due before today UTC as overdue", () => {
    expect(
      isOccurrenceOverdue(new Date("2026-10-24T00:00:00.000Z"), asOf),
    ).toBe(true);
  });

  it("does not treat due today UTC as overdue", () => {
    expect(
      isOccurrenceOverdue(new Date("2026-10-25T00:00:00.000Z"), asOf),
    ).toBe(false);
  });

  it("does not treat future due dates as overdue", () => {
    expect(
      isOccurrenceOverdue(new Date("2026-10-26T00:00:00.000Z"), asOf),
    ).toBe(false);
  });
});

describe("getOccurrenceDisplayStatus", () => {
  const asOf = new Date("2026-10-25T12:00:00.000Z");

  it("returns COMPLETED for completed rows regardless of due date", () => {
    expect(
      getOccurrenceDisplayStatus(
        "COMPLETED",
        new Date("2026-09-01T00:00:00.000Z"),
        asOf,
      ),
    ).toBe("COMPLETED");
  });

  it("returns OVERDUE for pending past-due rows", () => {
    expect(
      getOccurrenceDisplayStatus(
        "PENDING",
        new Date("2026-10-20T00:00:00.000Z"),
        asOf,
      ),
    ).toBe("OVERDUE");
  });

  it("returns PENDING for pending due today or later", () => {
    expect(
      getOccurrenceDisplayStatus(
        "PENDING",
        new Date("2026-10-25T00:00:00.000Z"),
        asOf,
      ),
    ).toBe("PENDING");
  });
});
