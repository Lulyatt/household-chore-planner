"use client";

import { useActionState } from "react";
import {
  signInAction,
  signUpAction,
  type AuthFormState,
} from "./actions";

const initialState: AuthFormState = {};

type LoginFormProps = {
  callbackUrl: string;
};

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [signInState, signInFormAction, signInPending] = useActionState(
    signInAction,
    initialState,
  );
  const [signUpState, signUpFormAction, signUpPending] = useActionState(
    signUpAction,
    initialState,
  );

  const error = signInState.error ?? signUpState.error;

  return (
    <div className="flex w-full max-w-md flex-col gap-10">
      {error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-zinc-900">Sign in</h2>
        <form action={signInFormAction} className="flex flex-col gap-3">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-600">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-600">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              className="rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={signInPending}
            className="mt-2 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
          >
            {signInPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-4 border-t border-zinc-200 pt-8">
        <h2 className="text-lg font-medium text-zinc-900">Create account</h2>
        <p className="text-sm text-zinc-600">
          Passwords must be at least 8 characters. OAuth and email verification
          are deferred for MVP.
        </p>
        <form action={signUpFormAction} className="flex flex-col gap-3">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-600">Name (optional)</span>
            <input
              name="name"
              type="text"
              autoComplete="name"
              className="rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-600">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-600">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={signUpPending}
            className="mt-2 rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-60"
          >
            {signUpPending ? "Creating account…" : "Sign up"}
          </button>
        </form>
      </section>
    </div>
  );
}
