import { prisma } from "@/lib/db";

const nextDueOccurrenceInclude = {
  orderBy: { dueDate: "asc" as const },
  where: { status: "PENDING" as const },
  take: 1,
  include: {
    assignee: {
      select: { id: true, name: true },
    },
  },
};

/** Lists chore definitions for a household (server-side scope only). */
export function listChoreDefinitionsForHousehold(householdId: string) {
  return prisma.choreDefinition.findMany({
    where: { householdId },
    orderBy: { title: "asc" },
    include: {
      occurrences: nextDueOccurrenceInclude,
    },
  });
}

/** Loads one chore definition when it belongs to the given household. */
export function getChoreDefinitionForHousehold(id: string, householdId: string) {
  return prisma.choreDefinition.findFirst({
    where: { id, householdId },
  });
}
