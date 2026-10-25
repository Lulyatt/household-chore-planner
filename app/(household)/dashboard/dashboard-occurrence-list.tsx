import Link from "next/link";
import {
  getRowDisplayStatus,
  type DashboardOccurrenceRow,
} from "@/lib/chores/dashboardQueries";
import { OccurrenceStatusBadge } from "../chores/occurrence-status-badge";

type DashboardOccurrenceListProps = {
  rows: DashboardOccurrenceRow[];
  asOfDate: Date;
  emptyMessage: string;
};

function formatDueDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function DashboardOccurrenceList({
  rows,
  asOfDate,
  emptyMessage,
}: DashboardOccurrenceListProps) {
  if (rows.length === 0) {
    return <p className="text-sm text-zinc-600">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
      {rows.map((row) => {
        const displayStatus = getRowDisplayStatus(row, asOfDate);
        const assigneeLabel = row.assignee?.name ?? "Unassigned";
        return (
          <li key={row.id}>
            <Link
              href={`/chores/${row.choreDefinition.id}`}
              className="flex flex-col gap-1 px-4 py-3 hover:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-zinc-900">
                  {row.choreDefinition.title}
                </span>
                <OccurrenceStatusBadge displayStatus={displayStatus} />
              </span>
              <span className="text-xs text-zinc-500">
                Due {formatDueDate(row.dueDate)} · {assigneeLabel}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
