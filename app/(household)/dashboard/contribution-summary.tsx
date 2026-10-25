import {
  formatContributionWindowLabel,
  type ContributionSummaryRow,
} from "@/lib/chores/dashboardQueries";

type ContributionSummaryProps = {
  rows: ContributionSummaryRow[];
  asOfDate: Date;
};

export function ContributionSummary({
  rows,
  asOfDate,
}: ContributionSummaryProps) {
  const windowLabel = formatContributionWindowLabel(asOfDate);
  const maxCount = Math.max(1, ...rows.map((r) => r.completedCount));

  if (rows.length === 0) {
    return (
      <p className="text-sm text-zinc-600">
        No household members yet. Add members to track contributions.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-zinc-500">
        Completions in {windowLabel} (UTC calendar month). Counts only; no
        points weighting.
      </p>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Completed</th>
              <th className="hidden px-4 py-3 sm:table-cell">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {rows.map((row) => (
              <tr key={row.memberId}>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {row.memberName}
                </td>
                <td className="px-4 py-3 text-zinc-700">{row.completedCount}</td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="h-2 min-w-[8rem] flex-1 rounded-full bg-zinc-100">
                      <div
                        className="h-2 rounded-full bg-zinc-800"
                        style={{
                          width: `${(row.completedCount / maxCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
