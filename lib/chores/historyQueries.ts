import { prisma } from "@/lib/db";
import { startOfUtcDay } from "./recurrenceDates";

/** Maximum past occurrences shown on chore detail (newest due dates first). */
export const CHORE_HISTORY_LIMIT = 50;

const occurrenceDetailInclude = {
  assignee: {
    select: { id: true, name: true },
  },
  completion: {
    select: {
      note: true,
      photoUrl: true,
      completedAt: true,
      completedBy: {
        select: { id: true, name: true },
      },
    },
  },
} as const;

/** Pending occurrences due today or later for one chore definition. */
export function listActiveOccurrencesForChoreDefinition(
  choreDefinitionId: string,
  householdId: string,
  asOfDate: Date = new Date(),
) {
  const today = startOfUtcDay(asOfDate);
  return prisma.choreOccurrence.findMany({
    where: {
      choreDefinitionId,
      householdId,
      status: "PENDING",
      dueDate: { gte: today },
    },
    orderBy: { dueDate: "asc" },
    include: occurrenceDetailInclude,
  });
}

/**
 * Completed and missed (overdue pending) occurrences, newest due dates first.
 */
export function listHistoryOccurrencesForChoreDefinition(
  choreDefinitionId: string,
  householdId: string,
  asOfDate: Date = new Date(),
  limit: number = CHORE_HISTORY_LIMIT,
) {
  const today = startOfUtcDay(asOfDate);
  return prisma.choreOccurrence.findMany({
    where: {
      choreDefinitionId,
      householdId,
      OR: [
        { status: "COMPLETED" },
        { status: "PENDING", dueDate: { lt: today } },
      ],
    },
    orderBy: { dueDate: "desc" },
    take: limit,
    include: occurrenceDetailInclude,
  });
}
