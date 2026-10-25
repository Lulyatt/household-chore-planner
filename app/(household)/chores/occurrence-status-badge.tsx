import type { OccurrenceDisplayStatus } from "@/lib/chores/occurrenceStatus";
import { formatOccurrenceDisplayStatus } from "@/lib/chores/occurrenceStatus";

type OccurrenceStatusBadgeProps = {
  displayStatus: OccurrenceDisplayStatus;
};

const badgeClass: Record<OccurrenceDisplayStatus, string> = {
  PENDING:
    "border-zinc-200 bg-zinc-50 text-zinc-700",
  OVERDUE:
    "border-amber-200 bg-amber-50 text-amber-900",
  COMPLETED:
    "border-green-200 bg-green-50 text-green-800",
};

export function OccurrenceStatusBadge({
  displayStatus,
}: OccurrenceStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${badgeClass[displayStatus]}`}
    >
      {formatOccurrenceDisplayStatus(displayStatus)}
    </span>
  );
}
