"use client";

import { useActionState } from "react";
import {
  updateChoreRotationAction,
  type OccurrenceActionState,
} from "../actions";

type HouseholdMemberOption = {
  id: string;
  name: string;
};

type RotationEditorProps = {
  choreDefinitionId: string;
  members: HouseholdMemberOption[];
  enabled: boolean;
  selectedMemberIds: string[];
};

const initialState: OccurrenceActionState = {};

export function RotationEditor({
  choreDefinitionId,
  members,
  enabled,
  selectedMemberIds,
}: RotationEditorProps) {
  const [state, formAction, pending] = useActionState(
    updateChoreRotationAction,
    initialState,
  );
  const selectedSet = new Set(selectedMemberIds);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4">
      <input type="hidden" name="choreDefinitionId" value={choreDefinitionId} />
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium text-zinc-900">Member rotation</h2>
        <p className="text-xs text-zinc-500">
          New auto-generated occurrences assign the next member in the order
          below. Manual assignee changes on existing rows are kept; only new
          rows use rotation.
        </p>
      </div>
      {state.error ? (
        <p className="text-xs text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <label className="flex items-center gap-2 text-sm text-zinc-800">
        <input
          type="checkbox"
          name="rotationEnabled"
          defaultChecked={enabled}
          disabled={pending}
          className="rounded border-zinc-300"
        />
        Enable automatic rotation
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Rotation order (top to bottom)
        </legend>
        {members.map((member) => (
          <label
            key={member.id}
            className="flex items-center gap-2 text-sm text-zinc-800"
          >
            <input
              type="checkbox"
              name="rotationMemberIds"
              value={member.id}
              defaultChecked={selectedSet.has(member.id)}
              disabled={pending}
              className="rounded border-zinc-300"
            />
            {member.name}
          </label>
        ))}
      </fieldset>
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save rotation"}
      </button>
    </form>
  );
}
