import { ChoreOccurrenceStatus } from "@prisma/client";
import { startOfUtcDay } from "./recurrenceDates";

/**
 * Overdue is derived at query/display time (not stored on the row).
 * Rule: PENDING and due date strictly before start of today in UTC.
 * Due today counts as pending, not overdue.
 */
export type OccurrenceDisplayStatus = "PENDING" | "OVERDUE" | "COMPLETED";

export function isOccurrenceOverdue(
  dueDate: Date,
  asOfDate: Date = new Date(),
): boolean {
  return (
    startOfUtcDay(dueDate).getTime() < startOfUtcDay(asOfDate).getTime()
  );
}

export function getOccurrenceDisplayStatus(
  status: ChoreOccurrenceStatus,
  dueDate: Date,
  asOfDate: Date = new Date(),
): OccurrenceDisplayStatus {
  if (status === "COMPLETED") {
    return "COMPLETED";
  }
  if (isOccurrenceOverdue(dueDate, asOfDate)) {
    return "OVERDUE";
  }
  return "PENDING";
}

export function formatOccurrenceDisplayStatus(
  displayStatus: OccurrenceDisplayStatus,
): string {
  switch (displayStatus) {
    case "COMPLETED":
      return "Completed";
    case "OVERDUE":
      return "Overdue";
    case "PENDING":
      return "Pending";
  }
}
