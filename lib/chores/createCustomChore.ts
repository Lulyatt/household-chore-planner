import { prisma } from "@/lib/db";

export type CreateCustomChoreResult =
  | { ok: true; choreDefinitionId: string }
  | { ok: false; message: string };

/** Trim and collapse internal whitespace for chore titles. */
export function normalizeChoreTitle(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

function normalizeOptionalDescription(
  raw: string | null | undefined,
): string | null {
  if (raw == null) {
    return null;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Parses an HTML date input (`YYYY-MM-DD`). Empty input means no due date.
 * Dates are stored at UTC midnight for `@db.Date` columns.
 */
export function parseOptionalDueDateInput(
  raw: string | null | undefined,
): Date | null | "invalid" {
  if (raw == null) {
    return null;
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return "invalid";
  }
  const dueDate = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(dueDate.getTime())) {
    return "invalid";
  }
  return dueDate;
}

/**
 * Creates a household-scoped custom chore definition.
 *
 * One-off behavior (until recurrence #17): when the user supplies a first due
 * date, a single PENDING occurrence is created and no further instances are
 * generated automatically. With no due date, only the definition is stored.
 */
export async function createCustomChore(input: {
  householdId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
}): Promise<CreateCustomChoreResult> {
  const title = normalizeChoreTitle(input.title);
  if (title.length < 1) {
    return { ok: false, message: "Title is required." };
  }
  if (title.length > 200) {
    return { ok: false, message: "Title must be at most 200 characters." };
  }

  const description = normalizeOptionalDescription(input.description);
  if (description != null && description.length > 2000) {
    return {
      ok: false,
      message: "Description must be at most 2000 characters.",
    };
  }

  const parsedDueDate = parseOptionalDueDateInput(input.dueDate);
  if (parsedDueDate === "invalid") {
    return { ok: false, message: "Due date must be a valid calendar date." };
  }

  const definition = await prisma.$transaction(async (tx) => {
    const created = await tx.choreDefinition.create({
      data: {
        householdId: input.householdId,
        title,
        description,
        source: "CUSTOM",
        suggestedTemplateKey: null,
      },
    });

    if (parsedDueDate) {
      await tx.choreOccurrence.create({
        data: {
          choreDefinitionId: created.id,
          householdId: input.householdId,
          dueDate: parsedDueDate,
          status: "PENDING",
        },
      });
    }

    return created;
  });

  return { ok: true, choreDefinitionId: definition.id };
}
