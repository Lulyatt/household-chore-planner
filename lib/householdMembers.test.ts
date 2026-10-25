import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "./db";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!hasDatabaseUrl)("household members", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates members and lists them filtered by householdId", async () => {
    const householdA = await prisma.household.create({
      data: { name: "Test Household A" },
    });
    const householdB = await prisma.household.create({
      data: { name: "Test Household B" },
    });

    await prisma.member.createMany({
      data: [
        { name: "Member One", householdId: householdA.id },
        { name: "Member Two", householdId: householdA.id },
        { name: "Other Household Member", householdId: householdB.id },
      ],
    });

    const membersInA = await prisma.member.findMany({
      where: { householdId: householdA.id },
      orderBy: { name: "asc" },
    });

    expect(membersInA).toHaveLength(2);
    expect(membersInA.map((m) => m.name)).toEqual(["Member One", "Member Two"]);
    expect(membersInA.every((m) => m.householdId === householdA.id)).toBe(true);

    await prisma.household.delete({ where: { id: householdA.id } });
    await prisma.household.delete({ where: { id: householdB.id } });

    const remaining = await prisma.member.findMany({
      where: {
        householdId: { in: [householdA.id, householdB.id] },
      },
    });
    expect(remaining).toHaveLength(0);
  });
});
