import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "./db";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!hasDatabaseUrl)("chore definitions", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates definitions and lists them filtered by householdId", async () => {
    const householdA = await prisma.household.create({
      data: { name: "Chore Test Household A" },
    });
    const householdB = await prisma.household.create({
      data: { name: "Chore Test Household B" },
    });

    await prisma.choreDefinition.createMany({
      data: [
        {
          title: "Vacuum living room",
          description: "Weekly pass",
          householdId: householdA.id,
          source: "CUSTOM",
          suggestedTemplateKey: null,
        },
        {
          title: "Take out trash",
          householdId: householdA.id,
          source: "FROM_SUGGESTED_TEMPLATE",
          suggestedTemplateKey: "trash",
        },
        {
          title: "Other household chore",
          householdId: householdB.id,
          source: "CUSTOM",
        },
      ],
    });

    const definitionsInA = await prisma.choreDefinition.findMany({
      where: { householdId: householdA.id },
      orderBy: { title: "asc" },
    });

    expect(definitionsInA).toHaveLength(2);
    expect(definitionsInA.map((d) => d.title)).toEqual([
      "Take out trash",
      "Vacuum living room",
    ]);
    expect(definitionsInA.every((d) => d.householdId === householdA.id)).toBe(
      true,
    );

    const custom = definitionsInA.find((d) => d.title === "Vacuum living room");
    expect(custom?.source).toBe("CUSTOM");
    expect(custom?.suggestedTemplateKey).toBeNull();
    expect(custom?.recurrenceRule).toBeNull();
    expect(custom?.rotationConfig).toBeNull();

    const fromTemplate = definitionsInA.find(
      (d) => d.title === "Take out trash",
    );
    expect(fromTemplate?.source).toBe("FROM_SUGGESTED_TEMPLATE");
    expect(fromTemplate?.suggestedTemplateKey).toBe("trash");

    await prisma.household.delete({ where: { id: householdA.id } });
    await prisma.household.delete({ where: { id: householdB.id } });

    const remaining = await prisma.choreDefinition.findMany({
      where: {
        householdId: { in: [householdA.id, householdB.id] },
      },
    });
    expect(remaining).toHaveLength(0);
  });
});
