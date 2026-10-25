import { describe, expect, it } from "vitest";
import { prisma } from "./db";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!hasDatabaseUrl)("database connectivity", () => {
  it("runs SELECT 1 via $queryRaw", async () => {
    const rows = await prisma.$queryRaw<{ one: number }[]>`SELECT 1 AS one`;
    expect(rows[0]?.one).toBe(1);
  });
});
