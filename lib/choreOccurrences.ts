import type { PrismaClient } from "@prisma/client";

type AssigneeClient = Pick<PrismaClient, "member">;

/** Ensures assigneeId, when set, belongs to the occurrence's household. */
export async function assertAssigneeInHousehold(
  db: AssigneeClient,
  householdId: string,
  assigneeId: string | null | undefined,
): Promise<void> {
  if (assigneeId == null) {
    return;
  }

  const member = await db.member.findFirst({
    where: { id: assigneeId, householdId },
    select: { id: true },
  });

  if (!member) {
    throw new Error(
      "Assignee must be a member of the same household as the occurrence.",
    );
  }
}
