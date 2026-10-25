import { prisma } from "../db";

/** Lists chore occurrences scoped to a household id (server and integration tests). */
export async function listChoreOccurrencesForHousehold(householdId: string) {
  return prisma.choreOccurrence.findMany({
    where: { householdId },
    orderBy: { dueDate: "asc" },
  });
}
