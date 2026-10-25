import { prisma } from "@/lib/db";
import { requireHouseholdSessionContext } from "@/lib/auth/sessionHousehold";

/** Lists chore definitions for the signed-in user's household. */
export async function listChoreDefinitionsForCurrentHousehold() {
  const { householdId } = await requireHouseholdSessionContext();

  return prisma.choreDefinition.findMany({
    where: { householdId },
    orderBy: { title: "asc" },
    include: {
      occurrences: {
        orderBy: { dueDate: "asc" },
        take: 1,
      },
    },
  });
}

/** Loads one chore definition when it belongs to the current household. */
export async function getChoreDefinitionForCurrentHousehold(id: string) {
  const { householdId } = await requireHouseholdSessionContext();

  return prisma.choreDefinition.findFirst({
    where: { id, householdId },
    include: {
      occurrences: {
        orderBy: { dueDate: "asc" },
      },
    },
  });
}
