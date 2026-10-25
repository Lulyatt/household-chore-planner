import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../db";
import { completeOnboarding } from "./completeOnboarding";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!hasDatabaseUrl)("completeOnboarding", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("links user to a new household and member", async () => {
    const user = await prisma.user.create({
      data: {
        email: `onboarding-${Date.now()}@example.com`,
        passwordHash: "test",
      },
    });

    const result = await completeOnboarding({
      userId: user.id,
      householdName: "Test Home",
      memberName: "Test User",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.memberId).toBeTruthy();
    expect(result.householdId).toBeTruthy();

    const updated = await prisma.user.findUnique({
      where: { id: user.id },
      include: { member: { include: { household: true } } },
    });

    expect(updated?.member?.name).toBe("Test User");
    expect(updated?.member?.household.name).toBe("Test Home");

    await prisma.household.delete({
      where: { id: updated!.member!.householdId },
    });
    await prisma.user.delete({ where: { id: user.id } });
  });
});
