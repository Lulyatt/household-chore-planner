import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  addUtcDays,
  formatUtcDateKey,
  listRecurrenceDueDatesInRange,
  startOfUtcDay,
} from "./recurrenceDates";
import { isRecurrenceRule } from "./recurrenceRule";
import {
  isActiveRotationConfig,
  nextRotationMemberId,
} from "./rotationConfig";

/** How far ahead recurring chores get concrete occurrence rows. */
export const DEFAULT_OCCURRENCE_HORIZON_DAYS = 90;

export type MaterializeOptions = {
  asOfDate: Date;
  horizonDays?: number;
};

function horizonEnd(asOfDate: Date, horizonDays: number): Date {
  return addUtcDays(startOfUtcDay(asOfDate), horizonDays);
}

/**
 * Idempotently inserts PENDING occurrences for one recurring definition.
 * Existing rows (including missed PENDING) are never updated or deleted.
 */
export async function materializeRecurringOccurrencesForDefinition(
  choreDefinitionId: string,
  householdId: string,
  recurrenceRule: unknown,
  options: MaterializeOptions,
  rotationConfig: unknown = null,
): Promise<number> {
  if (!isRecurrenceRule(recurrenceRule)) {
    return 0;
  }

  const fromDate = startOfUtcDay(options.asOfDate);
  const toDate = horizonEnd(
    options.asOfDate,
    options.horizonDays ?? DEFAULT_OCCURRENCE_HORIZON_DAYS,
  );

  const dueDates = listRecurrenceDueDatesInRange(
    recurrenceRule,
    fromDate,
    toDate,
  );
  if (dueDates.length === 0) {
    return 0;
  }

  const existing = await prisma.choreOccurrence.findMany({
    where: { choreDefinitionId },
    select: { dueDate: true, assigneeId: true },
    orderBy: { dueDate: "asc" },
  });
  const existingKeys = new Set(
    existing.map((row) => formatUtcDateKey(row.dueDate)),
  );

  const toCreate = dueDates.filter(
    (dueDate) => !existingKeys.has(formatUtcDateKey(dueDate)),
  );
  if (toCreate.length === 0) {
    return 0;
  }

  const rotationActive = isActiveRotationConfig(rotationConfig);
  const rotationMemberIds = rotationActive ? rotationConfig.memberIds : [];

  let previousAssigneeId: string | null = null;
  const firstNewKey = formatUtcDateKey(toCreate[0]!);
  for (const row of existing) {
    if (formatUtcDateKey(row.dueDate) < firstNewKey) {
      previousAssigneeId = row.assigneeId;
    }
  }

  const rows = toCreate.map((dueDate) => {
    const assigneeId = rotationActive
      ? nextRotationMemberId(rotationMemberIds, previousAssigneeId)
      : null;
    if (assigneeId != null) {
      previousAssigneeId = assigneeId;
    }
    return {
      choreDefinitionId,
      householdId,
      dueDate,
      status: "PENDING" as const,
      assigneeId,
    };
  });

  await prisma.choreOccurrence.createMany({ data: rows });

  return toCreate.length;
}

/** Materializes upcoming occurrences for all recurring definitions in a household. */
export async function materializeRecurringOccurrencesForHousehold(
  householdId: string,
  options: MaterializeOptions,
): Promise<number> {
  const definitions = await prisma.choreDefinition.findMany({
    where: { householdId, recurrenceRule: { not: Prisma.DbNull } },
    select: {
      id: true,
      householdId: true,
      recurrenceRule: true,
      rotationConfig: true,
    },
  });

  let created = 0;
  for (const definition of definitions) {
    created += await materializeRecurringOccurrencesForDefinition(
      definition.id,
      definition.householdId,
      definition.recurrenceRule,
      options,
      definition.rotationConfig,
    );
  }
  return created;
}
