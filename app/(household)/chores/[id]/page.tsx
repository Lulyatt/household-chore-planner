import Link from "next/link";
import { notFound } from "next/navigation";
import { getChoreDefinitionForCurrentHousehold } from "@/lib/chores/queries";

export const instant = false;

type ChoreDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
};

function formatDueDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatOccurrenceStatus(status: string): string {
  if (status === "COMPLETED") {
    return "Completed";
  }
  if (status === "PENDING") {
    return "Pending";
  }
  return status;
}

export default async function ChoreDetailPage({
  params,
  searchParams,
}: ChoreDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const chore = await getChoreDefinitionForCurrentHousehold(id);

  if (!chore) {
    notFound();
  }

  const showCreatedBanner = query.created === "1";

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/chores"
          className="text-sm text-zinc-600 underline hover:text-zinc-900"
        >
          ← Back to chores
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-900">{chore.title}</h1>
        {chore.description ? (
          <p className="text-sm text-zinc-600 whitespace-pre-wrap">
            {chore.description}
          </p>
        ) : (
          <p className="text-sm text-zinc-500">No description.</p>
        )}
      </header>

      {showCreatedBanner ? (
        <p
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          Chore created.
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-zinc-900">Occurrences</h2>
        {chore.occurrences.length === 0 ? (
          <p className="text-sm text-zinc-600">
            No due dates yet. Add recurrence or assignments in a later update.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Due date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assignee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {chore.occurrences.map((occurrence) => (
                  <tr key={occurrence.id}>
                    <td className="px-4 py-3 text-zinc-900">
                      {formatDueDate(occurrence.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {formatOccurrenceStatus(occurrence.status)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {occurrence.assignee?.name ?? "Unassigned"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
