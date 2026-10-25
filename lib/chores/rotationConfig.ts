/**
 * Rotation settings on {@link ChoreDefinition.rotationConfig} (JSON).
 * Auto-generated occurrences (#19) assign the next member in `memberIds`
 * after the chronologically previous occurrence's assignee.
 *
 * Manual assignee changes on existing rows are never overwritten by materialization.
 */

export type RotationConfig = {
  enabled: boolean;
  memberIds: string[];
};

export function isRotationConfig(value: unknown): value is RotationConfig {
  if (value == null || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.enabled !== "boolean") {
    return false;
  }
  if (!Array.isArray(record.memberIds)) {
    return false;
  }
  return record.memberIds.every((id) => typeof id === "string" && id.length > 0);
}

export function isActiveRotationConfig(
  value: unknown,
): value is RotationConfig & { enabled: true; memberIds: [string, ...string[]] } {
  return (
    isRotationConfig(value) && value.enabled === true && value.memberIds.length > 0
  );
}

/** Next member after `previousAssigneeId` in the rotation list (wrap-around). */
export function nextRotationMemberId(
  rotationMemberIds: readonly string[],
  previousAssigneeId: string | null,
): string | null {
  if (rotationMemberIds.length === 0) {
    return null;
  }
  if (rotationMemberIds.length === 1) {
    return rotationMemberIds[0]!;
  }
  if (previousAssigneeId == null) {
    return rotationMemberIds[0]!;
  }
  const index = rotationMemberIds.indexOf(previousAssigneeId);
  if (index === -1) {
    return rotationMemberIds[0]!;
  }
  return rotationMemberIds[(index + 1) % rotationMemberIds.length]!;
}
