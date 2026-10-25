import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isRotationConfig, type RotationConfig } from "./rotationConfig";

export type UpdateChoreRotationResult =
  | { ok: true }
  | { ok: false; message: string };

/** Saves rotation settings on a household chore definition. */
export async function updateChoreRotation(input: {
  householdId: string;
  choreDefinitionId: string;
  enabled: boolean;
  memberIds: string[];
}): Promise<UpdateChoreRotationResult> {
  const definition = await prisma.choreDefinition.findFirst({
    where: { id: input.choreDefinitionId, householdId: input.householdId },
    select: { id: true, recurrenceRule: true },
  });

  if (!definition) {
    return { ok: false, message: "Chore not found." };
  }

  if (definition.recurrenceRule == null) {
    return {
      ok: false,
      message: "Rotation applies only to recurring chores.",
    };
  }

  const uniqueMemberIds = [...new Set(input.memberIds)];
  if (input.enabled && uniqueMemberIds.length === 0) {
    return {
      ok: false,
      message: "Select at least one member for rotation.",
    };
  }

  if (uniqueMemberIds.length > 0) {
    const count = await prisma.member.count({
      where: {
        householdId: input.householdId,
        id: { in: uniqueMemberIds },
      },
    });
    if (count !== uniqueMemberIds.length) {
      return {
        ok: false,
        message: "Rotation members must belong to your household.",
      };
    }
  }

  const rotationConfig: RotationConfig | null = input.enabled
    ? { enabled: true, memberIds: uniqueMemberIds }
    : null;

  if (rotationConfig != null && !isRotationConfig(rotationConfig)) {
    return { ok: false, message: "Invalid rotation settings." };
  }

  await prisma.choreDefinition.update({
    where: { id: definition.id },
    data: {
      rotationConfig:
        rotationConfig == null ? Prisma.DbNull : rotationConfig,
    },
  });

  return { ok: true };
}
