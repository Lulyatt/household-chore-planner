"use client";

import { useActionState } from "react";
import {
  completeOccurrenceAction,
  type OccurrenceActionState,
} from "../actions";

type OccurrenceCompleteFormProps = {
  occurrenceId: string;
  choreDefinitionId: string;
};

const initialState: OccurrenceActionState = {};

export function OccurrenceCompleteForm({
  occurrenceId,
  choreDefinitionId,
}: OccurrenceCompleteFormProps) {
  const [state, formAction, pending] = useActionState(
    completeOccurrenceAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="flex flex-col gap-2"
    >
      <input type="hidden" name="occurrenceId" value={occurrenceId} />
      <input
        type="hidden"
        name="choreDefinitionId"
        value={choreDefinitionId}
      />
      {state.error ? (
        <p className="text-xs text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-zinc-600">
          Completion note (optional if you add a photo)
        </span>
        <textarea
          name="note"
          rows={2}
          disabled={pending}
          placeholder="What did you do?"
          className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-zinc-600">
          Photo proof (optional if you add a note; max 5 MB, JPEG/PNG/WebP/GIF)
        </span>
        <input
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={pending}
          className="text-sm text-zinc-700 file:mr-2 file:rounded-full file:border-0 file:bg-zinc-100 file:px-3 file:py-1 file:text-xs file:font-medium file:text-zinc-800"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Mark complete"}
      </button>
    </form>
  );
}
