import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CHORE_HISTORY_LIMIT } from "@/lib/chores/historyQueries";
import {
  getChoreDefinitionForCurrentHousehold,
  getChoreOccurrenceSectionsForCurrentHousehold,
} from "@/lib/chores/queries";
import {
  formatRecurrenceRuleSummary,
  isRecurrenceRule,
} from "@/lib/chores/recurrenceRule";
import { isRotationConfig } from "@/lib/chores/rotationConfig";
import { listMembersForCurrentHousehold } from "@/lib/household/queries";
import { OccurrenceTable } from "./occurrence-table";
import { RotationEditor } from "./rotation-editor";

export const instant = false;

type ChoreDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
};

export default async function ChoreDetailPage({
  params,
  searchParams,
}: ChoreDetailPageProps) {
  await connection();
  const { id } = await params;
  const query = await searchParams;
  const asOfDate = new Date();
  const [chore, members, occurrenceSections] = await Promise.all([
    getChoreDefinitionForCurrentHousehold(id),
    listMembersForCurrentHousehold(),
    getChoreOccurrenceSectionsForCurrentHousehold(id, asOfDate),
  ]);

  if (!chore) {
    notFound();
  }

  const { active, history } = occurrenceSections;
  const showCreatedBanner = query.created === "1";
  const recurrenceSummary =
    chore.recurrenceRule != null && isRecurrenceRule(chore.recurrenceRule)
      ? formatRecurrenceRuleSummary(chore.recurrenceRule)
      : null;
  const rotationConfig =
    chore.rotationConfig != null && isRotationConfig(chore.rotationConfig)
      ? chore.rotationConfig
      : null;
  const rotationEnabled = rotationConfig?.enabled ?? false;
  const rotationMemberIds = rotationConfig?.memberIds ?? [];

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
        {recurrenceSummary ? (
          <p className="text-sm text-zinc-600">Schedule: {recurrenceSummary}</p>
        ) : null}
      </header>

      {showCreatedBanner ? (
        <p
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          Chore created.
        </p>
      ) : null}

      {recurrenceSummary && members.length > 0 ? (
        <RotationEditor
          choreDefinitionId={chore.id}
          members={members}
          enabled={rotationEnabled}
          selectedMemberIds={rotationMemberIds}
        />
      ) : null}

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-zinc-900">
          Due now &amp; upcoming
        </h2>
        {active.length === 0 ? (
          <p className="text-sm text-zinc-600">
            No pending occurrences due today or later.
          </p>
        ) : (
          <OccurrenceTable
            choreDefinitionId={chore.id}
            occurrences={active}
            members={members}
            asOfDate={asOfDate}
            allowActions
          />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium text-zinc-900">History</h2>
          <p className="text-xs text-zinc-500">
            Last {CHORE_HISTORY_LIMIT} completed or missed instances (newest due
            dates first, UTC).
          </p>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-zinc-600">No past occurrences yet.</p>
        ) : (
          <OccurrenceTable
            choreDefinitionId={chore.id}
            occurrences={history}
            members={members}
            asOfDate={asOfDate}
            allowActions
            notePreviewLength={120}
          />
        )}
      </div>
    </section>
  );
}
