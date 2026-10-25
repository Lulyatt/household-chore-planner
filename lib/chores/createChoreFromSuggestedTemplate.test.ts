import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../db";
import { createChoreFromSuggestedTemplate } from "./createChoreFromSuggestedTemplate";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!hasDatabaseUrl)("createChoreFromSuggestedTemplate", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates a FROM_SUGGESTED_TEMPLATE definition with provenance key", async () => {
    const household = await prisma.household.create({
      data: { name: "Template Chore Home" },
    });

    const result = await createChoreFromSuggestedTemplate({
      householdId: household.id,
      suggestedTemplateKey: "trash",
      title: "  Take out kitchen trash  ",
      description: "  Use the alley bin  ",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const definition = await prisma.choreDefinition.findUnique({
      where: { id: result.choreDefinitionId },
    });
    expect(definition?.title).toBe("Take out kitchen trash");
    expect(definition?.description).toBe("Use the alley bin");
    expect(definition?.source).toBe("FROM_SUGGESTED_TEMPLATE");
    expect(definition?.suggestedTemplateKey).toBe("trash");
    expect(definition?.householdId).toBe(household.id);

    await prisma.household.delete({ where: { id: household.id } });
  });

  it("creates one PENDING occurrence when a due date is provided", async () => {
    const household = await prisma.household.create({
      data: { name: "Template Due Date Home" },
    });

    const result = await createChoreFromSuggestedTemplate({
      householdId: household.id,
      suggestedTemplateKey: "vacuum-common-areas",
      title: "Vacuum upstairs",
      dueDate: "2026-12-01",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const occurrences = await prisma.choreOccurrence.findMany({
      where: { choreDefinitionId: result.choreDefinitionId },
    });
    expect(occurrences).toHaveLength(1);
    expect(occurrences[0]?.status).toBe("PENDING");
    expect(occurrences[0]?.dueDate).toEqual(
      new Date("2026-12-01T00:00:00.000Z"),
    );

    await prisma.household.delete({ where: { id: household.id } });
  });

  it("rejects unknown template keys", async () => {
    const household = await prisma.household.create({
      data: { name: "Unknown Template Home" },
    });

    const result = await createChoreFromSuggestedTemplate({
      householdId: household.id,
      suggestedTemplateKey: "not-a-real-template",
      title: "Something",
    });
    expect(result).toEqual({
      ok: false,
      message: "Suggested template not found.",
    });

    await prisma.household.delete({ where: { id: household.id } });
  });
});
