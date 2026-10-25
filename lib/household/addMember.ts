import { prisma } from "@/lib/db";
import { formatMemberName } from "@/lib/formatMemberName";

export type AddMemberResult =
  | { ok: true; memberId: string }
  | { ok: false; message: string };

function validateMemberDisplayName(raw: string): string | null {
  const name = formatMemberName(raw);
  if (name.length < 1) {
    return "Display name is required.";
  }
  if (name.length > 120) {
    return "Display name must be at most 120 characters.";
  }
  return null;
}

/** Adds a household member (display name only; no User account). Scoped by householdId. */
export async function addMember(input: {
  householdId: string;
  displayName: string;
}): Promise<AddMemberResult> {
  const validationError = validateMemberDisplayName(input.displayName);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const name = formatMemberName(input.displayName);

  const duplicate = await prisma.member.findFirst({
    where: {
      householdId: input.householdId,
      name: { equals: name, mode: "insensitive" },
    },
    select: { id: true },
  });
  if (duplicate) {
    return {
      ok: false,
      message: "A member with this name already exists in your household.",
    };
  }

  const member = await prisma.member.create({
    data: {
      name,
      householdId: input.householdId,
    },
  });

  return { ok: true, memberId: member.id };
}
