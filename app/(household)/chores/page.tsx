import Link from "next/link";
import { listChoreDefinitionsForCurrentHousehold } from "@/lib/chores/queries";

export const instant = false;

function formatDueDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function ChoresPage() {
  const chores = await listChoreDefinitionsForCurrentHousehold();

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-zinc-900">Chores</h1>
          <p className="text-sm text-zinc-600">
            Custom and template-based chore definitions for your household.
          </p>
        </div>
        <Link
          href="/chores/new"
          className="inline-flex self-start rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
        >
          New chore
        </Link>
      </header>

      {chores.length === 0 ? (
        <p className="text-sm text-zinc-600">
          No chores yet.{" "}
          <Link href="/chores/new" className="underline hover:text-zinc-900">
            Create your first chore
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
          {chores.map((chore) => {
            const nextDue = chore.occurrences[0]?.dueDate;
            return (
              <li key={chore.id}>
                <Link
                  href={`/chores/${chore.id}`}
                  className="flex flex-col gap-1 px-4 py-3 hover:bg-zinc-50"
                >
                  <span className="text-sm font-medium text-zinc-900">
                    {chore.title}
                  </span>
                  {chore.description ? (
                    <span className="line-clamp-2 text-sm text-zinc-600">
                      {chore.description}
                    </span>
                  ) : null}
                  <span className="text-xs text-zinc-500">
                    {nextDue
                      ? `Next due ${formatDueDate(nextDue)}`
                      : "No due date scheduled"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
