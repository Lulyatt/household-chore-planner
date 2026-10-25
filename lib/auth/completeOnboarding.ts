import { prisma } from "../db";

export type CompleteOnboardingResult =
  | { ok: true; memberId: string; householdId: string }
  | { ok: false; message: string };

function validateDisplayName(value: string, label: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 1) {
    return `${label} is required.`;
  }
  if (trimmed.length > 120) {
    return `${label} must be at most 120 characters.`;
  }
  return null;
}

/** Creates a household and member for a user who has not completed onboarding. */
export async function completeOnboarding(input: {
  userId: string;
  householdName: string;
  memberName: string;
}): Promise<CompleteOnboardingResult> {
  const householdError = validateDisplayName(
    input.householdName,
    "Household name",
  );
  if (householdError) {
    return { ok: false, message: householdError };
  }
  const memberError = validateDisplayName(input.memberName, "Your name");
  if (memberError) {
    return { ok: false, message: memberError };
  }

  const existing = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { memberId: true },
  });
  if (!existing) {
    return { ok: false, message: "Account not found." };
  }
  if (existing.memberId) {
    return { ok: false, message: "Onboarding is already complete." };
  }

  const householdName = input.householdName.trim();
  const memberName = input.memberName.trim();

  const { memberId, householdId } = await prisma.$transaction(async (tx) => {
    const household = await tx.household.create({
      data: { name: householdName },
    });
    const member = await tx.member.create({
      data: {
        name: memberName,
        householdId: household.id,
      },
    });
    await tx.user.update({
      where: { id: input.userId },
      data: { memberId: member.id },
    });
    return { memberId: member.id, householdId: household.id };
  });

  return { ok: true, memberId, householdId };
}
