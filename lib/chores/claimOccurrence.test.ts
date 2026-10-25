import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../db";
import { claimOccurrence } from "./claimOccurrence";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!hasDatabaseUrl)("claimOccurrence", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function seedUnassignedOccurrence() {
    const household = await prisma.household.create({
      data: {
        name: "Claim Occurrence Home",
        members: {
          create: [{ name: "Alex" }, { name: "Blake" }],
        },
        choreDefinitions: {
          create: { title: "Dishes", source: "CUSTOM" },
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
        dueDate: new Date("2026-10-22T00:00:00.000Z"),
        status: "PENDING",
      },
    });

    return { household, alex, blake, occurrence };
  }

  it("claims an unassigned pending occurrence for the current member", async () => {
    const { household, blake, occurrence } = await seedUnassignedOccurrence();

    const result = await claimOccurrence({
      householdId: household.id,
      memberId: blake.id,
      occurrenceId: occurrence.id,
    });
    expect(result.ok).toBe(true);

    const updated = await prisma.choreOccurrence.findUniqueOrThrow({
      where: { id: occurrence.id },
    });
    expect(updated.assigneeId).toBe(blake.id);

    await prisma.household.delete({ where: { id: household.id } });
  });

  it("rejects claim when already assigned", async () => {
    const { household, alex, blake, occurrence } =
      await seedUnassignedOccurrence();

    await prisma.choreOccurrence.update({
      where: { id: occurrence.id },
      data: { assigneeId: alex.id },
    });

    const result = await claimOccurrence({
      householdId: household.id,
      memberId: blake.id,
      occurrenceId: occurrence.id,
    });
    expect(result).toEqual({
      ok: false,
      message: "This occurrence is already assigned.",
    });

    await prisma.household.delete({ where: { id: household.id } });
  });

  it("rejects claim on completed occurrences", async () => {
    const { household, blake, occurrence } = await seedUnassignedOccurrence();

    await prisma.choreOccurrence.update({
      where: { id: occurrence.id },
      data: { status: "COMPLETED" },
    });

    const result = await claimOccurrence({
      householdId: household.id,
      memberId: blake.id,
      occurrenceId: occurrence.id,
    });
    expect(result).toEqual({
      ok: false,
      message: "Only pending occurrences can be claimed.",
    });

    await prisma.household.delete({ where: { id: household.id } });
  });
});
