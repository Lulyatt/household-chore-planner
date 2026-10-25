import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../db";
import {
  getChoreDefinitionForHousehold,
  listChoreDefinitionsForHousehold,
} from "./definitionQueries";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!hasDatabaseUrl)("chore definition queries", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("lists definitions for one household with the next pending due date", async () => {
    const householdA = await prisma.household.create({
      data: {
        name: "Chore Query Household A",
        members: { create: [{ name: "Alex" }] },
        choreDefinitions: {
          create: [
            { title: "Zebra chore", source: "CUSTOM" },
            { title: "Alpha chore", source: "CUSTOM" },
          ],
        },
      },
      include: { members: true, choreDefinitions: true },
    });
    const householdB = await prisma.household.create({
      data: {
        name: "Chore Query Household B",
        choreDefinitions: {
          create: { title: "Other household chore", source: "CUSTOM" },
        },
      },
    });

    const alpha = householdA.choreDefinitions.find(
      (d) => d.title === "Alpha chore",
    )!;
    const assignee = householdA.members[0]!;

    await prisma.choreOccurrence.createMany({
      data: [
        {
          choreDefinitionId: alpha.id,
          householdId: householdA.id,
          dueDate: new Date("2026-09-01"),
          status: "COMPLETED",
          assigneeId: assignee.id,
        },
        {
          choreDefinitionId: alpha.id,
          householdId: householdA.id,
          dueDate: new Date("2026-10-15"),
          status: "PENDING",
        },
      ],
    });

    const listed = await listChoreDefinitionsForHousehold(householdA.id);

    expect(listed).toHaveLength(2);
    expect(listed.map((d) => d.title)).toEqual(["Alpha chore", "Zebra chore"]);
    expect(listed.every((d) => d.householdId === householdA.id)).toBe(true);

    const alphaRow = listed.find((d) => d.title === "Alpha chore");
    expect(alphaRow?.occurrences).toHaveLength(1);
    expect(alphaRow?.occurrences[0]?.dueDate.toISOString()).toBe(
      "2026-10-15T00:00:00.000Z",
    );

    const zebraRow = listed.find((d) => d.title === "Zebra chore");
    expect(zebraRow?.occurrences).toHaveLength(0);

    const listedB = await listChoreDefinitionsForHousehold(householdB.id);
    expect(listedB).toHaveLength(1);
    expect(listedB[0]?.title).toBe("Other household chore");

    await prisma.household.delete({ where: { id: householdA.id } });
    await prisma.household.delete({ where: { id: householdB.id } });
  });

  it("loads chore detail without embedding occurrences", async () => {
    const household = await prisma.household.create({
      data: {
        name: "Chore Detail Household",
        members: { create: [{ name: "Jordan" }] },
        choreDefinitions: {
          create: {
            title: "Wash windows",
            description: "Inside and out",
            source: "CUSTOM",
          },
        },
      },
      include: { members: true, choreDefinitions: true },
    });
    const definition = household.choreDefinitions[0]!;
    const member = household.members[0]!;

    await prisma.choreOccurrence.createMany({
      data: [
        {
          choreDefinitionId: definition.id,
          householdId: household.id,
          dueDate: new Date("2026-10-01"),
          status: "PENDING",
          assigneeId: member.id,
        },
        {
          choreDefinitionId: definition.id,
          householdId: household.id,
          dueDate: new Date("2026-10-08"),
          status: "PENDING",
        },
      ],
    });

    const loaded = await getChoreDefinitionForHousehold(
      definition.id,
      household.id,
    );

    expect(loaded?.title).toBe("Wash windows");
    expect(loaded?.description).toBe("Inside and out");
    expect(loaded).not.toHaveProperty("occurrences");

    await prisma.household.delete({ where: { id: household.id } });
  });

  it("does not return a definition from another household", async () => {
    const householdA = await prisma.household.create({
      data: {
        name: "Detail Scope A",
        choreDefinitions: {
          create: { title: "Scoped chore", source: "CUSTOM" },
        },
      },
      include: { choreDefinitions: true },
    });
    const householdB = await prisma.household.create({
      data: { name: "Detail Scope B" },
    });
    const definition = householdA.choreDefinitions[0]!;

    const crossHousehold = await getChoreDefinitionForHousehold(
      definition.id,
      householdB.id,
    );
    expect(crossHousehold).toBeNull();

    await prisma.household.delete({ where: { id: householdA.id } });
    await prisma.household.delete({ where: { id: householdB.id } });
  });
});
