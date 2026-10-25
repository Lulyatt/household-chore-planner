import type { HouseholdMemberOption } from "./occurrence-assignee-controls";
import { getOccurrenceDisplayStatus } from "@/lib/chores/occurrenceStatus";
import { OccurrenceStatusBadge } from "../occurrence-status-badge";
import { OccurrenceAssigneeControls } from "./occurrence-assignee-controls";
import { OccurrenceCompleteForm } from "./occurrence-complete-form";

export type OccurrenceTableRow = {
  id: string;
  dueDate: Date;
  status: "PENDING" | "COMPLETED";
  assignee: { id: string; name: string } | null;
  completion: {
    note: string;
    photoUrl: string | null;
    completedAt: Date;
    completedBy: { id: string; name: string };
  } | null;
};

type OccurrenceTableProps = {
  choreDefinitionId: string;
  occurrences: OccurrenceTableRow[];
  members: HouseholdMemberOption[];
  asOfDate: Date;
  allowActions: boolean;
  notePreviewLength?: number;
};

function formatDueDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatCompletedAt(date: Date): string {
  return date.toISOString().replace("T", " ").slice(0, 16);
}

function summarizeNote(note: string, maxLength: number): string {
  if (note.length <= maxLength) {
    return note;
  }
  return `${note.slice(0, maxLength - 1)}…`;
}

export function OccurrenceTable({
  choreDefinitionId,
  occurrences,
  members,
  asOfDate,
  allowActions,
  notePreviewLength,
}: OccurrenceTableProps) {
  if (occurrences.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3">Due date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Assignee</th>
            <th className="px-4 py-3">Completion</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {occurrences.map((occurrence) => {
            const displayStatus = getOccurrenceDisplayStatus(
              occurrence.status,
              occurrence.dueDate,
              asOfDate,
            );
            const canComplete =
              allowActions && displayStatus !== "COMPLETED";
            const noteText = occurrence.completion?.note;
            const noteDisplay =
              noteText && notePreviewLength != null
                ? summarizeNote(noteText, notePreviewLength)
                : noteText;

            return (
              <tr key={occurrence.id}>
                <td className="px-4 py-3 text-zinc-900">
                  {formatDueDate(occurrence.dueDate)}
                </td>
                <td className="px-4 py-3">
                  <OccurrenceStatusBadge displayStatus={displayStatus} />
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {allowActions ? (
                    <OccurrenceAssigneeControls
                      occurrenceId={occurrence.id}
                      choreDefinitionId={choreDefinitionId}
                      status={occurrence.status}
                      assigneeId={occurrence.assignee?.id ?? null}
                      assigneeName={occurrence.assignee?.name ?? null}
                      members={members}
                    />
                  ) : (
                    (occurrence.assignee?.name ?? "Unassigned")
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {occurrence.completion ? (
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span>
                        {occurrence.completion.completedBy.name} ·{" "}
                        {formatCompletedAt(occurrence.completion.completedAt)}
                      </span>
                      {noteDisplay ? (
                        <span
                          className="whitespace-pre-wrap text-zinc-700"
                          title={
                            notePreviewLength != null && noteText !== noteDisplay
                              ? noteText
                              : undefined
                          }
                        >
                          {noteDisplay}
                        </span>
                      ) : null}
                      {!notePreviewLength && occurrence.completion.photoUrl ? (
                        <a
                          href={occurrence.completion.photoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-zinc-900 underline"
                        >
                          View photo
                        </a>
                      ) : null}
                    </div>
                  ) : canComplete ? (
                    <OccurrenceCompleteForm
                      occurrenceId={occurrence.id}
                      choreDefinitionId={choreDefinitionId}
                    />
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
