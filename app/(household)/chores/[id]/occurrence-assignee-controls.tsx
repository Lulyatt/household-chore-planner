"use client";

import { useActionState } from "react";
import {
  claimOccurrenceAction,
  updateOccurrenceAssigneeAction,
  type OccurrenceActionState,
} from "../actions";

type HouseholdMemberOption = {
  id: string;
  name: string;
};

type OccurrenceAssigneeControlsProps = {
  occurrenceId: string;
  choreDefinitionId: string;
  status: string;
  assigneeId: string | null;
  assigneeName: string | null;
  members: HouseholdMemberOption[];
};

const initialState: OccurrenceActionState = {};

function formatAssigneeLabel(name: string | null): string {
  return name ?? "Unassigned";
}

export function OccurrenceAssigneeControls({
  occurrenceId,
  choreDefinitionId,
  status,
  assigneeId,
  assigneeName,
  members,
}: OccurrenceAssigneeControlsProps) {
  const [assignState, assignAction, assignPending] = useActionState(
    updateOccurrenceAssigneeAction,
    initialState,
  );
  const [claimState, claimAction, claimPending] = useActionState(
    claimOccurrenceAction,
    initialState,
  );

  const actionError = assignState.error ?? claimState.error;

  if (status !== "PENDING") {
    return (
      <span className="text-zinc-600">{formatAssigneeLabel(assigneeName)}</span>
    );
  }

  const showClaim = assigneeId == null;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {actionError ? (
        <p className="text-xs text-red-700" role="alert">
          {actionError}
        </p>
      ) : null}
      <form action={assignAction} className="flex items-center gap-2">
        <input type="hidden" name="occurrenceId" value={occurrenceId} />
        <input
          type="hidden"
          name="choreDefinitionId"
          value={choreDefinitionId}
        />
        <label className="sr-only" htmlFor={`assignee-${occurrenceId}`}>
          Assignee
        </label>
        <select
          id={`assignee-${occurrenceId}`}
          name="assigneeId"
          defaultValue={assigneeId ?? ""}
          disabled={assignPending || claimPending}
          onChange={(event) => {
            event.currentTarget.form?.requestSubmit();
          }}
          className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900"
        >
          <option value="">Unassigned</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </form>
      {showClaim ? (
        <form action={claimAction}>
          <input type="hidden" name="occurrenceId" value={occurrenceId} />
          <input
            type="hidden"
            name="choreDefinitionId"
            value={choreDefinitionId}
          />
          <button
            type="submit"
            disabled={assignPending || claimPending}
            className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-60"
          >
            {claimPending ? "Claiming…" : "Claim"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
