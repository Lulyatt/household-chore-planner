"use client";

import { useActionState } from "react";
import {
  completeOnboardingAction,
  type OnboardingFormState,
} from "./actions";

const initialState: OnboardingFormState = {};

type OnboardingFormProps = {
  defaultMemberName?: string | null;
};

export function OnboardingForm({ defaultMemberName }: OnboardingFormProps) {
  const [state, formAction, pending] = useActionState(
    completeOnboardingAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-4">
      {state.error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600">Household name</span>
        <input
          name="householdName"
          type="text"
          required
          autoComplete="organization"
          placeholder="e.g. Kim–Lee apartment"
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600">Your name</span>
        <input
          name="memberName"
          type="text"
          required
          autoComplete="name"
          defaultValue={defaultMemberName ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Creating household…" : "Continue to dashboard"}
      </button>
    </form>
  );
}
