import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../db";
import { updateOccurrenceAssignee } from "./updateOccurrenceAssignee";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!hasDatabaseUrl)("updateOccurrenceAssignee", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function seedOccurrence() {
    const household = await prisma.household.create({
      data: {
        name: "Assign Occurrence Home",
        members: {
          create: [{ name: "Alex" }, { name: "Blake" }],
        },
        choreDefinitions: {
          create: { title: "Vacuum", source: "CUSTOM" },
        },
      },
      include: { members: true, choreDefinitions: true },
    });
    const definition = household.choreDefinitions[0]!;
    const alex = household.members.find((m) => m.name === "Alex")!;
    const blake = household.members.find((m) => m.name === "Blake")!;

    const occurrence = await prisma.choreOccurrence.create({
      data: {
        choreDefinitionId: definition.id,
        householdId: household.id,
        dueDate: new Date("2026-10-20T00:00:00.000Z"),
        status: "PENDING",
      },
    });

    return { household, alex, blake, occurrence, definition };
  }

  it("assigns a household member to a pending occurrence", async () => {
    const { household, alex, occurrence, definition } = await seedOccurrence();

    const result = await updateOccurrenceAssignee({
      householdId: household.id,
      occurrenceId: occurrence.id,
      assigneeId: alex.id,
    });
    expect(result.ok).toBe(true);

    const updated = await prisma.choreOccurrence.findUniqueOrThrow({
      where: { id: occurrence.id },
    });
    expect(updated.assigneeId).toBe(alex.id);

    await prisma.household.delete({ where: { id: household.id } });
    void definition;
  });

  it("clears assignee on a pending occurrence", async () => {
    const { household, alex, blake, occurrence } = await seedOccurrence();

    await prisma.choreOccurrence.update({
      where: { id: occurrence.id },
      data: { assigneeId: alex.id },
    });

    const result = await updateOccurrenceAssignee({
      householdId: household.id,
      occurrenceId: occurrence.id,
      assigneeId: null,
    });
    expect(result.ok).toBe(true);

    const updated = await prisma.choreOccurrence.findUniqueOrThrow({
      where: { id: occurrence.id },
    });
    expect(updated.assigneeId).toBeNull();

    await prisma.household.delete({ where: { id: household.id } });
    void blake;
  });

  it("rejects members from another household", async () => {
    const { household, occurrence } = await seedOccurrence();
    const otherHousehold = await prisma.household.create({
      data: { name: "Other", members: { create: { name: "Outsider" } } },
      include: { members: true },
    });
    const outsider = otherHousehold.members[0]!;

    const result = await updateOccurrenceAssignee({
      householdId: household.id,
      occurrenceId: occurrence.id,
      assigneeId: outsider.id,
    });
    expect(result).toEqual({
      ok: false,
      message: "Assignee must be a member of your household.",
    });

    await prisma.household.delete({ where: { id: household.id } });
    await prisma.household.delete({ where: { id: otherHousehold.id } });
  });

  it("rejects assignment on completed occurrences", async () => {
    const { household, alex, occurrence } = await seedOccurrence();

    await prisma.choreOccurrence.update({
      where: { id: occurrence.id },
      data: { status: "COMPLETED" },
    });

    const result = await updateOccurrenceAssignee({
      householdId: household.id,
      occurrenceId: occurrence.id,
      assigneeId: alex.id,
    });
    expect(result).toEqual({
      ok: false,
      message: "Assignee cannot be changed on completed occurrences.",
    });

    await prisma.household.delete({ where: { id: household.id } });
  });
});
