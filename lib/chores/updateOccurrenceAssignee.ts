import { prisma } from "@/lib/db";
import { assertAssigneeInHousehold } from "@/lib/choreOccurrences";

export type UpdateOccurrenceAssigneeResult =
  | { ok: true; choreDefinitionId: string }
  | { ok: false; message: string };

/** Sets or clears assignee on a pending occurrence scoped to the household. */
export async function updateOccurrenceAssignee(input: {
  householdId: string;
  occurrenceId: string;
  assigneeId: string | null;
}): Promise<UpdateOccurrenceAssigneeResult> {
  const occurrence = await prisma.choreOccurrence.findFirst({
    where: { id: input.occurrenceId, householdId: input.householdId },
    select: {
      id: true,
      status: true,
      choreDefinitionId: true,
    },
  });

  if (!occurrence) {
    return { ok: false, message: "Occurrence not found." };
  }

  if (occurrence.status !== "PENDING") {
    return {
      ok: false,
      message: "Assignee cannot be changed on completed occurrences.",
    };
  }

  try {
    await assertAssigneeInHousehold(
      prisma,
      input.householdId,
      input.assigneeId,
    );
  } catch {
    return {
      ok: false,
      message: "Assignee must be a member of your household.",
    };
  }

  await prisma.choreOccurrence.update({
    where: { id: occurrence.id },
    data: { assigneeId: input.assigneeId },
  });

  return { ok: true, choreDefinitionId: occurrence.choreDefinitionId };
}
