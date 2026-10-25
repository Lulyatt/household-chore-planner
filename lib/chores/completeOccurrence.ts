import { prisma } from "@/lib/db";

export type CompleteOccurrenceResult =
  | { ok: true; choreDefinitionId: string }
  | { ok: false; message: string };

function normalizeCompletionNote(raw: string): string | null {
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Marks a pending occurrence complete; MVP requires a note and/or photo. */
export async function completeOccurrence(input: {
  householdId: string;
  memberId: string;
  occurrenceId: string;
  note: string;
  photoUrl?: string | null;
}): Promise<CompleteOccurrenceResult> {
  const note = normalizeCompletionNote(input.note);
  const photoUrl = input.photoUrl?.trim() ? input.photoUrl.trim() : null;

  if (note == null && photoUrl == null) {
    return {
      ok: false,
      message: "Add a completion note or photo.",
    };
  }
  if (note != null && note.length > 2000) {
    return {
      ok: false,
      message: "Completion note must be at most 2000 characters.",
    };
  }

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
      message: "Only pending occurrences can be completed.",
    };
  }

  const member = await prisma.member.findFirst({
    where: { id: input.memberId, householdId: input.householdId },
    select: { id: true },
  });
  if (!member) {
    return { ok: false, message: "Member not found in this household." };
  }

  const completed = await prisma.$transaction(async (tx) => {
    const updated = await tx.choreOccurrence.updateMany({
      where: {
        id: occurrence.id,
        householdId: input.householdId,
        status: "PENDING",
      },
      data: { status: "COMPLETED" },
    });
    if (updated.count === 0) {
      return false;
    }
    await tx.completion.create({
      data: {
        choreOccurrenceId: occurrence.id,
        note: note ?? "",
        photoUrl,
        completedByMemberId: input.memberId,
      },
    });
    return true;
  });

  if (!completed) {
    return {
      ok: false,
      message: "Only pending occurrences can be completed.",
    };
  }

  return { ok: true, choreDefinitionId: occurrence.choreDefinitionId };
}
