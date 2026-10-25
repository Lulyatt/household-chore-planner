"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  createChoreFromSuggestedTemplateAction,
  createCustomChoreAction,
  type CreateCustomChoreFormState,
} from "../actions";

const initialState: CreateCustomChoreFormState = {};

type NewChoreFormProps = {
  defaultTitle?: string;
  defaultDescription?: string;
  suggestedTemplateKey?: string;
};

export function NewChoreForm({
  defaultTitle = "",
  defaultDescription = "",
  suggestedTemplateKey,
}: NewChoreFormProps = {}) {
  const [state, formAction, pending] = useActionState(
    suggestedTemplateKey
      ? createChoreFromSuggestedTemplateAction
      : createCustomChoreAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-4">
      {suggestedTemplateKey ? (
        <input
          type="hidden"
          name="suggestedTemplateKey"
          value={suggestedTemplateKey}
        />
      ) : null}
      {state.error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600">Title</span>
        <input
          name="title"
          type="text"
          required
          defaultValue={defaultTitle}
          placeholder="e.g. Clean the fridge"
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600">Description (optional)</span>
        <textarea
          name="description"
          rows={3}
          defaultValue={defaultDescription}
          placeholder="Any notes for your household"
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600">First due date (optional)</span>
        <input
          name="dueDate"
          type="date"
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
        <span className="text-xs text-zinc-500">
          When set, one pending occurrence is created for this date. Recurring
          schedules come later; without a date, only the chore definition is
          saved.
        </span>
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Create chore"}
        </button>
        <Link
          href="/chores"
          className="text-sm text-zinc-600 underline hover:text-zinc-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
