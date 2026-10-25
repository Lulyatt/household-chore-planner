import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../db";
import { completeOccurrence } from "./completeOccurrence";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!hasDatabaseUrl)("completeOccurrence", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function seedPendingOccurrence() {
    const household = await prisma.household.create({
      data: {
        name: "Complete Occurrence Home",
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

    const occurrence = await prisma.choreOccurrence.create({
      data: {
        choreDefinitionId: definition.id,
        householdId: household.id,
        dueDate: new Date("2026-10-22T00:00:00.000Z"),
        status: "PENDING",
      },
    });

    return { household, alex, occurrence, definition };
  }

  it("creates a completion and marks the occurrence completed", async () => {
    const { household, alex, occurrence, definition } =
      await seedPendingOccurrence();

    const result = await completeOccurrence({
      householdId: household.id,
      memberId: alex.id,
      occurrenceId: occurrence.id,
      note: "  All clean  ",
    });
    expect(result.ok).toBe(true);

    const loaded = await prisma.choreOccurrence.findUnique({
      where: { id: occurrence.id },
      include: { completion: { include: { completedBy: true } } },
    });
    expect(loaded?.status).toBe("COMPLETED");
    expect(loaded?.completion?.note).toBe("All clean");
    expect(loaded?.completion?.completedByMemberId).toBe(alex.id);
    expect(loaded?.completion?.completedBy.name).toBe("Alex");

    await prisma.household.delete({ where: { id: household.id } });
    void definition;
  });

  it("rejects when both note and photo are missing", async () => {
    const { household, alex, occurrence } = await seedPendingOccurrence();

    const result = await completeOccurrence({
      householdId: household.id,
      memberId: alex.id,
      occurrenceId: occurrence.id,
      note: "   ",
    });
    expect(result).toEqual({
      ok: false,
      message: "Add a completion note or photo.",
    });

    await prisma.household.delete({ where: { id: household.id } });
  });

  it("accepts photo-only completion when photoUrl is provided", async () => {
    const { household, alex, occurrence, definition } =
      await seedPendingOccurrence();

    const result = await completeOccurrence({
      householdId: household.id,
      memberId: alex.id,
      occurrenceId: occurrence.id,
      note: "",
      photoUrl: "https://example.blob.vercel-storage.com/proof.jpg",
    });
    expect(result.ok).toBe(true);

    const loaded = await prisma.choreOccurrence.findUnique({
      where: { id: occurrence.id },
      include: { completion: true },
    });
    expect(loaded?.completion?.note).toBe("");
    expect(loaded?.completion?.photoUrl).toBe(
      "https://example.blob.vercel-storage.com/proof.jpg",
    );

    await prisma.household.delete({ where: { id: household.id } });
    void definition;
  });

  it("rejects completing an already completed occurrence", async () => {
    const { household, alex, occurrence } = await seedPendingOccurrence();

    await completeOccurrence({
      householdId: household.id,
      memberId: alex.id,
      occurrenceId: occurrence.id,
      note: "Done once",
    });

    const second = await completeOccurrence({
      householdId: household.id,
      memberId: alex.id,
      occurrenceId: occurrence.id,
      note: "Done twice",
    });
    expect(second.ok).toBe(false);

    await prisma.household.delete({ where: { id: household.id } });
  });
});
