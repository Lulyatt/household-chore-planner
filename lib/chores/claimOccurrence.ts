import { prisma } from "@/lib/db";

export type ClaimOccurrenceResult =
  | { ok: true; choreDefinitionId: string }
  | { ok: false; message: string };

/** Assigns an unassigned pending occurrence to the claiming member. */
export async function claimOccurrence(input: {
  householdId: string;
  memberId: string;
  occurrenceId: string;
}): Promise<ClaimOccurrenceResult> {
  const occurrence = await prisma.choreOccurrence.findFirst({
    where: { id: input.occurrenceId, householdId: input.householdId },
    select: {
      id: true,
      status: true,
      assigneeId: true,
      choreDefinitionId: true,
    },
  });

  if (!occurrence) {
    return { ok: false, message: "Occurrence not found." };
  }

  if (occurrence.status !== "PENDING") {
    return {
      ok: false,
      message: "Only pending occurrences can be claimed.",
    };
  }

  if (occurrence.assigneeId != null) {
    return {
      ok: false,
      message: "This occurrence is already assigned.",
    };
  }

  const updated = await prisma.choreOccurrence.updateMany({
    where: {
      id: occurrence.id,
      householdId: input.householdId,
      status: "PENDING",
      assigneeId: null,
    },
    data: { assigneeId: input.memberId },
  });

  if (updated.count === 0) {
    return {
      ok: false,
      message: "This occurrence is already assigned.",
    };
  }

  return { ok: true, choreDefinitionId: occurrence.choreDefinitionId };
}
