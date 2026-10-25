import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../db";
import { addMember } from "./addMember";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!hasDatabaseUrl)("addMember", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates a member scoped to the household", async () => {
    const household = await prisma.household.create({
      data: { name: "Add Member Test Home" },
    });

    const result = await addMember({
      householdId: household.id,
      displayName: "  Jordan   Lee  ",
    });
    expect(result.ok).toBe(true);

    const members = await prisma.member.findMany({
      where: { householdId: household.id },
    });
    expect(members).toHaveLength(1);
    expect(members[0]!.name).toBe("Jordan Lee");

    await prisma.household.delete({ where: { id: household.id } });
  });

  it("rejects empty or whitespace-only names", async () => {
    const household = await prisma.household.create({
      data: { name: "Validation Test Home" },
    });

    const result = await addMember({
      householdId: household.id,
      displayName: "   ",
    });
    expect(result).toEqual({
      ok: false,
      message: "Display name is required.",
    });

    await prisma.household.delete({ where: { id: household.id } });
  });

  it("blocks duplicate names in the same household (case-insensitive)", async () => {
    const household = await prisma.household.create({
      data: {
        name: "Duplicate Test Home",
        members: { create: [{ name: "Sam Rivera" }] },
      },
    });

    const duplicate = await addMember({
      householdId: household.id,
      displayName: "sam rivera",
    });
    expect(duplicate.ok).toBe(false);
    if (duplicate.ok) {
      return;
    }
    expect(duplicate.message).toContain("already exists");

    const otherHousehold = await prisma.household.create({
      data: { name: "Other Home" },
    });
    const allowed = await addMember({
      householdId: otherHousehold.id,
      displayName: "Sam Rivera",
    });
    expect(allowed.ok).toBe(true);

    await prisma.household.delete({ where: { id: household.id } });
    await prisma.household.delete({ where: { id: otherHousehold.id } });
  });
});
