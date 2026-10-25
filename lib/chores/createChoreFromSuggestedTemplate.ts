import { assertAssigneeInHousehold } from "@/lib/choreOccurrences";
import { prisma } from "@/lib/db";
import { getSuggestedChoreTemplateByKey } from "@/lib/suggestedChoreTemplates/getCatalog";
import type { RecurrenceRule } from "./recurrenceRule";
import {
  normalizeChoreTitle,
  parseOptionalDueDateInput,
  type CreateCustomChoreResult,
} from "./createCustomChore";

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
 * Creates a household chore definition copied from a suggested template (#12).
 *
 * Occurrence behavior matches {@link createCustomChore}: optional first due date
 * creates one PENDING occurrence; otherwise only the definition is stored.
 */
export async function createChoreFromSuggestedTemplate(input: {
  householdId: string;
  suggestedTemplateKey: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  assigneeId?: string | null;
  recurrenceRule?: RecurrenceRule | null;
}): Promise<CreateCustomChoreResult> {
  const template = await getSuggestedChoreTemplateByKey(
    input.suggestedTemplateKey,
  );
  if (!template) {
    return { ok: false, message: "Suggested template not found." };
  }

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

  const recurrenceRule = input.recurrenceRule ?? null;
  if (recurrenceRule != null && parsedDueDate == null) {
    return {
      ok: false,
      message: "First due date is required for recurring chores.",
    };
  }

  const assigneeId = input.assigneeId ?? null;
  if (assigneeId != null) {
    try {
      await assertAssigneeInHousehold(prisma, input.householdId, assigneeId);
    } catch {
      return {
        ok: false,
        message: "Assignee must be a member of your household.",
      };
    }
  }

  const definition = await prisma.$transaction(async (tx) => {
    const created = await tx.choreDefinition.create({
      data: {
        householdId: input.householdId,
        title,
        description,
        source: "FROM_SUGGESTED_TEMPLATE",
        suggestedTemplateKey: template.key,
        recurrenceRule: recurrenceRule ?? undefined,
      },
    });

    if (parsedDueDate) {
      await tx.choreOccurrence.create({
        data: {
          choreDefinitionId: created.id,
          householdId: input.householdId,
          dueDate: parsedDueDate,
          status: "PENDING",
          assigneeId,
        },
      });
    }

    return created;
  });

  return { ok: true, choreDefinitionId: definition.id };
}
