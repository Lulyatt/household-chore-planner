import { prisma } from "@/lib/db";
import {
  addUtcDays,
  startOfUtcDay,
  utcDateFromParts,
} from "./recurrenceDates";
import {
  getOccurrenceDisplayStatus,
  type OccurrenceDisplayStatus,
} from "./occurrenceStatus";

/** Pending occurrences due after today through this many UTC days ahead (dashboard upcoming). */
export const DASHBOARD_UPCOMING_WINDOW_DAYS = 14;

/** Completions counted from the first UTC day of the current month through now. */
export function contributionWindowStart(asOfDate: Date = new Date()): Date {
  return utcDateFromParts(
    asOfDate.getUTCFullYear(),
    asOfDate.getUTCMonth() + 1,
    1,
  );
}

const dashboardOccurrenceInclude = {
  assignee: {
    select: { id: true, name: true },
  },
  choreDefinition: {
    select: { id: true, title: true },
  },
} as const;

export type DashboardOccurrenceRow = Awaited<
  ReturnType<typeof listTodayAndOverdueOccurrencesForHousehold>
>[number];

/** PENDING occurrences due today or earlier (overdue + due today). */
export function listTodayAndOverdueOccurrencesForHousehold(
  householdId: string,
  asOfDate: Date = new Date(),
) {
  const today = startOfUtcDay(asOfDate);
  return prisma.choreOccurrence.findMany({
    where: {
      householdId,
      status: "PENDING",
      dueDate: { lte: today },
    },
    include: dashboardOccurrenceInclude,
  }).then((rows) => sortTodayOverdueRows(rows, asOfDate));
}

/** PENDING occurrences due strictly after today within the upcoming window. */
export function listUpcomingOccurrencesForHousehold(
  householdId: string,
  asOfDate: Date = new Date(),
  windowDays: number = DASHBOARD_UPCOMING_WINDOW_DAYS,
) {
  const today = startOfUtcDay(asOfDate);
  const windowEnd = addUtcDays(today, windowDays);
  return prisma.choreOccurrence.findMany({
    where: {
      householdId,
      status: "PENDING",
      dueDate: { gt: today, lte: windowEnd },
    },
    orderBy: [{ dueDate: "asc" }, { choreDefinition: { title: "asc" } }],
    include: dashboardOccurrenceInclude,
  });
}

export type ContributionSummaryRow = {
  memberId: string;
  memberName: string;
  completedCount: number;
};

/** Completed chores per member for the household in the current UTC month. */
export async function listContributionSummaryForHousehold(
  householdId: string,
  asOfDate: Date = new Date(),
): Promise<ContributionSummaryRow[]> {
  const windowStart = contributionWindowStart(asOfDate);

  const [members, grouped] = await Promise.all([
    prisma.member.findMany({
      where: { householdId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.completion.groupBy({
      by: ["completedByMemberId"],
      where: {
        completedAt: { gte: windowStart },
        choreOccurrence: { householdId },
      },
      _count: { _all: true },
    }),
  ]);

  const countByMember = new Map(
    grouped.map((row) => [row.completedByMemberId, row._count._all]),
  );

  return members.map((member) => ({
    memberId: member.id,
    memberName: member.name,
    completedCount: countByMember.get(member.id) ?? 0,
  }));
}

type SortableOccurrence = {
  dueDate: Date;
  status: "PENDING" | "COMPLETED";
};

/** Overdue rows first (oldest due first), then due today (by due date). */
export function sortTodayOverdueRows<T extends SortableOccurrence>(
  rows: T[],
  asOfDate: Date = new Date(),
): T[] {
  const rank = (row: T): number => {
    const display = getOccurrenceDisplayStatus(
      row.status,
      row.dueDate,
      asOfDate,
    );
    return display === "OVERDUE" ? 0 : 1;
  };

  return [...rows].sort((a, b) => {
    const rankDiff = rank(a) - rank(b);
    if (rankDiff !== 0) {
      return rankDiff;
    }
    const dueDiff = a.dueDate.getTime() - b.dueDate.getTime();
    if (dueDiff !== 0) {
      return dueDiff;
    }
    return 0;
  });
}

export function formatContributionWindowLabel(asOfDate: Date = new Date()): string {
  const start = contributionWindowStart(asOfDate);
  const month = start.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return month;
}

export function upcomingWindowDescription(
  windowDays: number = DASHBOARD_UPCOMING_WINDOW_DAYS,
): string {
  return `Next ${windowDays} days (UTC), excluding today and overdue`;
}

export function getRowDisplayStatus(
  row: SortableOccurrence,
  asOfDate: Date,
): OccurrenceDisplayStatus {
  return getOccurrenceDisplayStatus(row.status, row.dueDate, asOfDate);
}
