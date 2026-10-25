import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../db";
import { formatUtcDateKey } from "./recurrenceDates";
import {
  materializeRecurringOccurrencesForDefinition,
  materializeRecurringOccurrencesForHousehold,
} from "./materializeRecurringOccurrences";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!hasDatabaseUrl)("materializeRecurringOccurrences", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("keeps a missed pending row when adding new upcoming occurrences", async () => {
    const household = await prisma.household.create({
      data: { name: "Materialize Missed Home" },
    });

    const definition = await prisma.choreDefinition.create({
      data: {
        householdId: household.id,
        title: "Weekly trash",
        source: "CUSTOM",
        recurrenceRule: { kind: "weekly", weekday: 1 },
      },
    });

    await prisma.choreOccurrence.create({
      data: {
        choreDefinitionId: definition.id,
        householdId: household.id,
        dueDate: new Date("2026-09-28T00:00:00.000Z"),
        status: "PENDING",
      },
    });

    const asOfDate = new Date("2026-10-05T00:00:00.000Z");
    const created = await materializeRecurringOccurrencesForDefinition(
      definition.id,
      household.id,
      definition.recurrenceRule,
      { asOfDate, horizonDays: 7 },
    );
    expect(created).toBeGreaterThan(0);

    const occurrences = await prisma.choreOccurrence.findMany({
      where: { choreDefinitionId: definition.id },
      orderBy: { dueDate: "asc" },
    });
    expect(occurrences.map((row) => formatUtcDateKey(row.dueDate))).toEqual([
      "2026-09-28",
      "2026-10-05",
      "2026-10-12",
    ]);
    expect(occurrences.every((row) => row.status === "PENDING")).toBe(true);

    await prisma.household.delete({ where: { id: household.id } });
  });

  it("is idempotent when run twice for the same horizon", async () => {
    const household = await prisma.household.create({
      data: { name: "Materialize Idempotent Home" },
    });

    await prisma.choreDefinition.create({
      data: {
        householdId: household.id,
        title: "Every three days",
        source: "CUSTOM",
        recurrenceRule: {
          kind: "every_n_days",
          intervalDays: 3,
          anchorDate: "2026-10-01",
        },
        occurrences: {
          create: {
            householdId: household.id,
            dueDate: new Date("2026-10-01T00:00:00.000Z"),
            status: "PENDING",
          },
        },
      },
    });

    const asOfDate = new Date("2026-10-01T00:00:00.000Z");
    const options = { asOfDate, horizonDays: 9 };
    const first = await materializeRecurringOccurrencesForHousehold(
      household.id,
      options,
    );
    const second = await materializeRecurringOccurrencesForHousehold(
      household.id,
      options,
    );
    expect(first).toBeGreaterThan(0);
    expect(second).toBe(0);

    const count = await prisma.choreOccurrence.count({
      where: { householdId: household.id },
    });
    expect(count).toBe(4);

    await prisma.household.delete({ where: { id: household.id } });
  });

  it("assigns rotating members to new occurrences with wrap-around", async () => {
    const household = await prisma.household.create({
      data: {
        name: "Rotation Wrap Home",
        members: {
          create: [{ name: "Alex" }, { name: "Blake" }, { name: "Casey" }],
        },
      },
      include: { members: true },
    });
    const [alex, blake, casey] = household.members.sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    const definition = await prisma.choreDefinition.create({
      data: {
        householdId: household.id,
        title: "Rotate weekly",
        source: "CUSTOM",
        recurrenceRule: { kind: "weekly", weekday: 1 },
        rotationConfig: {
          enabled: true,
          memberIds: [alex!.id, blake!.id, casey!.id],
        },
      },
    });

    await prisma.choreOccurrence.create({
      data: {
        choreDefinitionId: definition.id,
        householdId: household.id,
        dueDate: new Date("2026-10-05T00:00:00.000Z"),
        status: "PENDING",
        assigneeId: casey!.id,
      },
    });

    await materializeRecurringOccurrencesForDefinition(
      definition.id,
      household.id,
      definition.recurrenceRule,
      { asOfDate: new Date("2026-10-05T00:00:00.000Z"), horizonDays: 21 },
      definition.rotationConfig,
    );

    const occurrences = await prisma.choreOccurrence.findMany({
      where: { choreDefinitionId: definition.id },
      orderBy: { dueDate: "asc" },
    });

    expect(occurrences.map((row) => row.assigneeId)).toEqual([
      casey!.id,
      alex!.id,
      blake!.id,
      casey!.id,
    ]);

    await prisma.household.delete({ where: { id: household.id } });
  });

  it("assigns the sole member when rotation has one participant", async () => {
    const household = await prisma.household.create({
      data: {
        name: "Rotation Single Home",
        members: { create: [{ name: "Solo" }] },
      },
      include: { members: true },
    });
    const solo = household.members[0]!;

    const definition = await prisma.choreDefinition.create({
      data: {
        householdId: household.id,
        title: "Solo rotate",
        source: "CUSTOM",
        recurrenceRule: {
          kind: "every_n_days",
          intervalDays: 2,
          anchorDate: "2026-10-01",
        },
        rotationConfig: { enabled: true, memberIds: [solo.id] },
      },
    });

    await materializeRecurringOccurrencesForDefinition(
      definition.id,
      household.id,
      definition.recurrenceRule,
      { asOfDate: new Date("2026-10-01T00:00:00.000Z"), horizonDays: 6 },
      definition.rotationConfig,
    );

    const occurrences = await prisma.choreOccurrence.findMany({
      where: { choreDefinitionId: definition.id },
      orderBy: { dueDate: "asc" },
    });

    expect(occurrences.length).toBeGreaterThan(1);
    expect(occurrences.every((row) => row.assigneeId === solo.id)).toBe(true);

    await prisma.household.delete({ where: { id: household.id } });
  });
});
