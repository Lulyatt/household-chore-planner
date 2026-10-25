import { connection } from "next/server";
import {
  DASHBOARD_UPCOMING_WINDOW_DAYS,
  upcomingWindowDescription,
} from "@/lib/chores/dashboardQueries";
import { getDashboardDataForCurrentHousehold } from "@/lib/chores/queries";
import { ContributionSummary } from "./contribution-summary";
import { DashboardOccurrenceList } from "./dashboard-occurrence-list";

export const instant = false;

export default async function DashboardPage() {
  await connection();
  const { todayAndOverdue, upcoming, contributions, asOfDate } =
    await getDashboardDataForCurrentHousehold();

  return (
    <section className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-600">
          Today&apos;s priorities, upcoming chores, and who completed work this
          month.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium text-zinc-900">
            Today &amp; overdue
          </h2>
          <p className="text-xs text-zinc-500">
            Pending chores due today or earlier (UTC). Overdue listed first.
          </p>
        </div>
        <DashboardOccurrenceList
          rows={todayAndOverdue}
          asOfDate={asOfDate}
          emptyMessage="Nothing due today or overdue. Nice work."
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium text-zinc-900">Upcoming</h2>
          <p className="text-xs text-zinc-500">
            {upcomingWindowDescription(DASHBOARD_UPCOMING_WINDOW_DAYS)}.
          </p>
        </div>
        <DashboardOccurrenceList
          rows={upcoming}
          asOfDate={asOfDate}
          emptyMessage="No upcoming chores in the next two weeks."
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-zinc-900">
          Contribution summary
        </h2>
        <ContributionSummary rows={contributions} asOfDate={asOfDate} />
      </div>
    </section>
  );
}
