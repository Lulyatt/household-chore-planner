import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../db";
import {
  createCustomChore,
  normalizeChoreTitle,
  parseOptionalDueDateInput,
} from "./createCustomChore";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

describe("createCustomChore helpers", () => {
  it("normalizes chore titles", () => {
    expect(normalizeChoreTitle("  Wash   dishes  ")).toBe("Wash dishes");
    expect(normalizeChoreTitle("   ")).toBe("");
  });

  it("parses optional due dates", () => {
    expect(parseOptionalDueDateInput("")).toBeNull();
    expect(parseOptionalDueDateInput("  ")).toBeNull();
    expect(parseOptionalDueDateInput(null)).toBeNull();
    expect(parseOptionalDueDateInput("not-a-date")).toBe("invalid");
    expect(parseOptionalDueDateInput("2026-10-25")).toEqual(
      new Date("2026-10-25T00:00:00.000Z"),
    );
  });
});

describe.skipIf(!hasDatabaseUrl)("createCustomChore", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates a CUSTOM definition scoped to the household", async () => {
    const household = await prisma.household.create({
      data: { name: "Custom Chore Home" },
    });

    const result = await createCustomChore({
      householdId: household.id,
      title: "  Organize pantry  ",
      description: "  Group items by category  ",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const definition = await prisma.choreDefinition.findUnique({
      where: { id: result.choreDefinitionId },
    });
    expect(definition?.title).toBe("Organize pantry");
    expect(definition?.description).toBe("Group items by category");
    expect(definition?.source).toBe("CUSTOM");
    expect(definition?.suggestedTemplateKey).toBeNull();
    expect(definition?.householdId).toBe(household.id);

    const occurrences = await prisma.choreOccurrence.findMany({
      where: { choreDefinitionId: result.choreDefinitionId },
    });
    expect(occurrences).toHaveLength(0);

    await prisma.household.delete({ where: { id: household.id } });
  });

  it("creates one PENDING occurrence when a due date is provided", async () => {
    const household = await prisma.household.create({
      data: {
        name: "One-off Chore Home",
        members: { create: { name: "Sam" } },
      },
      include: { members: true },
    });
    const member = household.members[0]!;

    const result = await createCustomChore({
      householdId: household.id,
      title: "Deep clean oven",
      dueDate: "2026-11-01",
      assigneeId: member.id,
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
    expect(occurrences[0]?.householdId).toBe(household.id);
    expect(occurrences[0]?.dueDate).toEqual(
      new Date("2026-11-01T00:00:00.000Z"),
    );
    expect(occurrences[0]?.assigneeId).toBe(member.id);

    await prisma.household.delete({ where: { id: household.id } });
  });

  it("creates an unassigned occurrence when no assignee is provided", async () => {
    const household = await prisma.household.create({
      data: { name: "Unassigned Occurrence Home" },
    });

    const result = await createCustomChore({
      householdId: household.id,
      title: "Water plants",
      dueDate: "2026-12-01",
      assigneeId: null,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const occurrences = await prisma.choreOccurrence.findMany({
      where: { choreDefinitionId: result.choreDefinitionId },
    });
    expect(occurrences[0]?.assigneeId).toBeNull();

    await prisma.household.delete({ where: { id: household.id } });
  });

  it("rejects whitespace-only titles", async () => {
    const household = await prisma.household.create({
      data: { name: "Validation Chore Home" },
    });

    const result = await createCustomChore({
      householdId: household.id,
      title: "   ",
    });
    expect(result).toEqual({ ok: false, message: "Title is required." });

    await prisma.household.delete({ where: { id: household.id } });
  });
});
