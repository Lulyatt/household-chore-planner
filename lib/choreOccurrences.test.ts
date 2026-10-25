import { afterAll, describe, expect, it } from "vitest";
import {
  assertAssigneeInHousehold,
  parseOptionalAssigneeId,
} from "./choreOccurrences";
import { prisma } from "./db";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

describe("parseOptionalAssigneeId", () => {
  it("treats empty form values as unassigned", () => {
    expect(parseOptionalAssigneeId(null)).toBeNull();
    expect(parseOptionalAssigneeId("")).toBeNull();
    expect(parseOptionalAssigneeId("   ")).toBeNull();
    expect(parseOptionalAssigneeId("member-123")).toBe("member-123");
  });
});

describe.skipIf(!hasDatabaseUrl)("chore occurrences and completions", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("allows two occurrences for the same definition (missed + new)", async () => {
    const household = await prisma.household.create({
      data: {
        name: "Occurrence Coexist Household",
        members: { create: [{ name: "Pat" }] },
        choreDefinitions: {
          create: { title: "Weekly vacuum", source: "CUSTOM" },
        },
      },
      include: { members: true, choreDefinitions: true },
    });
    const definition = household.choreDefinitions[0]!;
    const assignee = household.members[0]!;

    const missedDue = new Date("2026-10-01T12:00:00.000Z");
    const nextDue = new Date("2026-10-08T12:00:00.000Z");

    await prisma.choreOccurrence.createMany({
      data: [
        {
          choreDefinitionId: definition.id,
          householdId: household.id,
          dueDate: missedDue,
          status: "PENDING",
          assigneeId: assignee.id,
        },
        {
          choreDefinitionId: definition.id,
          householdId: household.id,
          dueDate: nextDue,
          status: "PENDING",
        },
      ],
    });

    const occurrences = await prisma.choreOccurrence.findMany({
      where: { choreDefinitionId: definition.id },
      orderBy: { dueDate: "asc" },
    });

    expect(occurrences).toHaveLength(2);
    expect(occurrences[0]?.status).toBe("PENDING");
    expect(occurrences[1]?.status).toBe("PENDING");

    await prisma.household.delete({ where: { id: household.id } });
  });

  it("completing one occurrence does not remove sibling occurrences", async () => {
    const household = await prisma.household.create({
      data: {
        name: "Completion Sibling Household",
        members: { create: [{ name: "Sam" }] },
        choreDefinitions: {
          create: { title: "Take out recycling", source: "CUSTOM" },
        },
      },
      include: { members: true, choreDefinitions: true },
    });
    const definition = household.choreDefinitions[0]!;
    const member = household.members[0]!;

    const older = await prisma.choreOccurrence.create({
      data: {
        choreDefinitionId: definition.id,
        householdId: household.id,
        dueDate: new Date("2026-09-24T12:00:00.000Z"),
        status: "PENDING",
      },
    });
    const newer = await prisma.choreOccurrence.create({
      data: {
        choreDefinitionId: definition.id,
        householdId: household.id,
        dueDate: new Date("2026-10-01T12:00:00.000Z"),
        status: "PENDING",
      },
    });

    await prisma.choreOccurrence.update({
      where: { id: older.id },
      data: {
        status: "COMPLETED",
        completion: {
          create: {
            note: "Bins were full",
            completedByMemberId: member.id,
          },
        },
      },
    });

    const remaining = await prisma.choreOccurrence.findMany({
      where: { choreDefinitionId: definition.id },
      orderBy: { dueDate: "asc" },
      include: { completion: true },
    });

    expect(remaining).toHaveLength(2);
    expect(remaining[0]?.id).toBe(older.id);
    expect(remaining[0]?.status).toBe("COMPLETED");
    expect(remaining[0]?.completion?.note).toBe("Bins were full");
    expect(remaining[1]?.id).toBe(newer.id);
    expect(remaining[1]?.status).toBe("PENDING");
    expect(remaining[1]?.completion).toBeNull();

    await prisma.household.delete({ where: { id: household.id } });
  });

  it("assertAssigneeInHousehold rejects members from another household", async () => {
    const householdA = await prisma.household.create({
      data: { name: "Assignee A", members: { create: { name: "In A" } } },
      include: { members: true },
    });
    const householdB = await prisma.household.create({
      data: { name: "Assignee B" },
    });
    const memberA = householdA.members[0]!;

    await expect(
      assertAssigneeInHousehold(prisma, householdB.id, memberA.id),
    ).rejects.toThrow(/same household/);

    await expect(
      assertAssigneeInHousehold(prisma, householdA.id, memberA.id),
    ).resolves.toBeUndefined();

    await prisma.household.delete({ where: { id: householdA.id } });
    await prisma.household.delete({ where: { id: householdB.id } });
  });
});
