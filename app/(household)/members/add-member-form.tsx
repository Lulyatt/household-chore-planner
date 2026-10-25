"use client";

import { useActionState } from "react";
import { addMemberAction, type AddMemberFormState } from "./actions";

const initialState: AddMemberFormState = {};

export function AddMemberForm() {
  const [state, formAction, pending] = useActionState(
    addMemberAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-3">
      {state.error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          Member added.
        </p>
      ) : null}
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600">Display name</span>
        <input
          key={state.version ?? 0}
          name="displayName"
          type="text"
          required
          autoComplete="name"
          placeholder="e.g. Alex Kim"
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add member"}
      </button>
    </form>
  );
}
