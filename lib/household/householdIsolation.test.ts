import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../db";
import { listChoreOccurrencesForHousehold } from "./scopedQueries";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!hasDatabaseUrl)("household data isolation", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("scoped queries never return another household's members or chores", async () => {
    const householdA = await prisma.household.create({
      data: {
        name: "Isolation Household A",
        members: { create: [{ name: "Member A" }] },
        choreDefinitions: {
          create: [{ title: "Chore A", source: "CUSTOM" }],
        },
      },
      include: { members: true, choreDefinitions: true },
    });
    const householdB = await prisma.household.create({
      data: {
        name: "Isolation Household B",
        members: { create: [{ name: "Member B" }] },
        choreDefinitions: {
          create: [{ title: "Chore B", source: "CUSTOM" }],
        },
      },
      include: { members: true, choreDefinitions: true },
    });

    const memberA = householdA.members[0]!;
    const memberB = householdB.members[0]!;
    const definitionA = householdA.choreDefinitions[0]!;
    const definitionB = householdB.choreDefinitions[0]!;

    await prisma.choreOccurrence.createMany({
      data: [
        {
          choreDefinitionId: definitionA.id,
          householdId: householdA.id,
          dueDate: new Date("2026-10-25"),
          assigneeId: memberA.id,
        },
        {
          choreDefinitionId: definitionB.id,
          householdId: householdB.id,
          dueDate: new Date("2026-10-25"),
          assigneeId: memberB.id,
        },
      ],
    });

    const membersForA = await prisma.member.findMany({
      where: { householdId: householdA.id },
    });
    const membersForB = await prisma.member.findMany({
      where: { householdId: householdB.id },
    });
    const choresForA = await listChoreOccurrencesForHousehold(householdA.id);
    const choresForB = await listChoreOccurrencesForHousehold(householdB.id);

    expect(membersForA.map((m) => m.id)).toEqual([memberA.id]);
    expect(membersForB.map((m) => m.id)).toEqual([memberB.id]);
    expect(membersForA.some((m) => m.id === memberB.id)).toBe(false);
    expect(membersForB.some((m) => m.id === memberA.id)).toBe(false);

    expect(choresForA).toHaveLength(1);
    expect(choresForB).toHaveLength(1);
    expect(choresForA[0]!.householdId).toBe(householdA.id);
    expect(choresForB[0]!.householdId).toBe(householdB.id);
    expect(choresForA.some((c) => c.householdId === householdB.id)).toBe(
      false,
    );
    expect(choresForB.some((c) => c.householdId === householdA.id)).toBe(
      false,
    );

    await prisma.household.delete({ where: { id: householdA.id } });
    await prisma.household.delete({ where: { id: householdB.id } });
  });
});
