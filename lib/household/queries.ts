import { prisma } from "@/lib/db";
import { requireHouseholdSessionContext } from "@/lib/auth/sessionHousehold";

/** Lists members for a household (server-side scope only). */
export function listMembersForHousehold(householdId: string) {
  return prisma.member.findMany({
    where: { householdId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

/** Lists members for the signed-in user's household; householdId comes from session only. */
export async function listMembersForCurrentHousehold() {
  const { householdId } = await requireHouseholdSessionContext();
  return listMembersForHousehold(householdId);
}
