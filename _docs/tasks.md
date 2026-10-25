# Backlog — Household Chore Planner

Stack for all tasks: **Next.js (App Router)**, **TypeScript**, **Prisma**, **PostgreSQL**. Product scope is in [`plan.md`](plan.md). Each item below is intended to fit one focused session and includes enough context to pick up without reading the rest of this file.

---

## 1. Scaffold the app with a passing test

Goal: Have a runnable Next.js TypeScript project and at least one automated test that passes in CI locally.

Description: Initialize a new Next.js app in this repository (App Router, TypeScript, sensible defaults). Add a test runner (for example Vitest or Jest) and write one trivial test—such as a pure function or a smoke test for a utility—so `npm test` (or the chosen script) exits successfully. Document the install, dev, and test commands in the root README under a short “Development” section.

---

## 2. Connect PostgreSQL through Prisma

Goal: Prisma is configured against a PostgreSQL database and migrations run cleanly.

Description: Add Prisma to the project, point `DATABASE_URL` at a local or hosted Postgres instance, and commit a `.env.example` without secrets. Create an initial empty migration (or a minimal placeholder model if required) so `prisma migrate dev` works. Add a small integration test or script that asserts the client can connect and run a simple query (for example `SELECT 1`), and document how to set up the database for new contributors.

---

## 3. Model households and members in the database

Goal: Persist households and the people who belong to them, scoped for multi-tenant data.

Description: Extend the Prisma schema with `Household` and `Member` models (and any join fields needed later for auth). Members belong to exactly one household; include fields you need for display (for example name). Run a migration and add a seed script that creates one sample household with two members for manual testing. Document the seed command in the README.

---

## 4. Model chore definitions (templates and custom chores)

Goal: Store chore “blueprints” separately from day-to-day work items.

Description: Add Prisma models for chore definitions: title, description, optional link to a built-in template id, household scope, and fields that will later drive recurrence and rotation (can be nullable until those tasks land). Distinguish user-created chores from rows created from suggested templates. Migrate, update the seed if useful, and verify create/read via Prisma Studio or a one-off script.

---

## 5. Model chore occurrences and completions

Goal: Each due instance and its completion history is stored as its own row.

Description: Add models for **occurrences** (due date, status, assignee member id or null, link to chore definition and household) and **completions** (timestamp, note text, optional photo URL, who completed). Status should support pending, completed, and overdue-style reporting without deleting missed instances when new ones are generated. Migrate and document the intended lifecycle in a short comment block at the top of the schema file or in `_docs/`.

---

## 6. Sign-up, sign-in, and session handling

Goal: A user can authenticate and the app knows who they are on each request.

Description: Integrate authentication (for example Auth.js / NextAuth) with the Next.js app: sign-up, sign-in, sign-out, and protected routes. Store users in the database via Prisma adapter or equivalent. Sessions should be required for all household pages. Include a minimal login page and a redirect to the dashboard after success. Do not yet wire household membership—that is the next auth-related task.

---

## 7. Link authenticated users to household members

Goal: Every logged-in user maps to exactly one `Member` (and thus one `Household`) for the MVP.

Description: Extend the schema so `User` links to `Member`. Implement a first-run flow: after sign-up, create a household and a member record for that user (household name + member display name). Guard app routes so data access always filters by the current user’s `householdId`. Add a test or manual checklist proving two users in different households cannot read each other’s data.

---

## 8. Application shell and navigation

Goal: Authenticated users see a consistent layout and can reach main areas of the app.

Description: Build a root layout with header, household context (name), navigation links (Dashboard, Chores, Members, Sign out), and empty placeholder pages for those sections. Use server components where appropriate and ensure unauthenticated visitors are sent to login. No business logic beyond routing and layout is required in this task.

---

## 9. List and add household members

Goal: Users can view members of their household and add new ones.

Description: On the Members page, list all members for the current household and provide a form to add a member (display name only for MVP—no invite email). Enforce household scope on the server. Prevent duplicate names within a household if that simplifies the UX. Show validation errors clearly. This supports assignment and rotation later.

---

## 10. Seed suggested chore templates

Goal: The app offers a fixed library of starter chores users can configure.

Description: Define a set of suggested templates (for example “Take out bins”, “Vacuum common areas”) as constants or seeded database rows. Expose them read-only to the UI layer via a server function or API. Templates are not household-specific until a user creates a chore from one. Document where to edit the template list for product owners.

---

## 11. Create a custom chore

Goal: A user can add a new chore definition from scratch for their household.

Description: Implement a “New chore” flow: form with title, description, and optional initial due date or one-off occurrence. Persist a chore definition and at least one occurrence if the product treats one-offs as a single instance. All writes must scope to the current household. Redirect or toast on success and link to the chore detail or list.

---

## 12. Create a chore from a suggested template

Goal: A user can pick a template and save a configured chore for their household.

Description: From the template list, let the user open a form pre-filled with template title/description, allow edits, then save as a household chore definition (store template provenance if modeled). Match the same persistence pattern as custom chores. Keep the flow independent of recurrence and rotation UI—those can default to off or one-off.

---

## 13. View and filter chores for the household

Goal: Users can see chore definitions and open individual items.

Description: Add a Chores index page listing definitions for the current household (title, short description, next due occurrence if any). Add a detail page showing definition fields and a list of related occurrences with status and assignee. Use server-side queries only; no client-side household id. Empty state copy when no chores exist.

---

## 14. Manually assign an occurrence to a member

Goal: A responsible member can be set on a specific occurrence.

Description: On occurrence edit or chore detail, provide a member dropdown limited to the current household. Persist `assigneeId` on the occurrence. Reject assignment to members outside the household. Show the assignee on list and detail views. Do not implement rotation or claiming in this task—only explicit manual assignment.

---

## 15. Support explicitly unassigned occurrences

Goal: Occurrences can exist with no assignee so others may claim them later.

Description: Allow clearing the assignee (null) on an occurrence and show “Unassigned” in the UI. Ensure create flows can leave assignment empty. Server-side validation should treat null assignee as valid. This task does not implement claiming—only the unassigned state and display.

---

## 16. Claim an unassigned occurrence

Goal: A member can take responsibility for an unassigned chore only.

Description: Add a “Claim” action on unassigned pending occurrences that sets `assigneeId` to the current member. Return a clear error if the occurrence already has an assignee or is completed. Do not allow claiming chores assigned to someone else (per MVP scope). Cover the rule with at least one automated test on the server action or service function.

---

## 17. Configure recurrence on a chore definition

Goal: Users can mark a chore as recurring and set a simple schedule.

Description: Add UI and persistence for recurrence (for example weekly on a weekday, or every N days—pick one expressive but small rule set for MVP). Store the rule on the chore definition. Non-recurring chores behave as today. Document supported patterns in `_docs/` in a sentence or two. Generation of future occurrences is a separate task.

---

## 18. Generate upcoming occurrences from recurrence rules

Goal: Recurring chores materialize future due rows without erasing missed ones.

Description: Implement a domain function that, given a chore definition and a date horizon, creates occurrence rows that do not duplicate existing ones. Invoke it when loading the dashboard or chore detail (on-demand generation is fine for MVP). Add unit tests with fixed dates to prove missed occurrences remain while new ones are added. Keep rotation out of this task—assignee can be null or unchanged.

---

## 19. Automatic rotation for recurring occurrences

Goal: New or regenerated occurrences get the next member in a household rotation.

Description: Store rotation order (for example ordered member ids on the definition or household). When an occurrence is created for a rotating chore, set assignee to the next member after the previous occurrence’s assignee. Make rotation order editable in a simple UI. Add tests for wrap-around and for households with one member. Respect manual overrides if the product decision is to only rotate when assignee would otherwise be auto—document the rule chosen.

---

## 20. Surface overdue occurrences on queries

Goal: Pending occurrences past due date appear as overdue everywhere relevant.

Description: Define overdue as pending with `dueDate` before start of today in the household timezone (document timezone choice, default UTC or local). Use this rule in Prisma queries for lists and badges—do not rely on a separate cron to flip status unless you prefer stored `overdue` status; either approach is fine if consistent. Overdue items stay until completed; completing one does not remove historical missed rows.

---

## 21. Complete an occurrence with a required note

Goal: Marking done requires text proof and records who completed when.

Description: Add a completion form on pending/overdue occurrences: note field (required), submit creates a `Completion` row, sets occurrence to completed, and stores `completedByMemberId`. Block empty notes. Show completion note and timestamp on detail/history views. Photo upload is not part of this task.

---

## 22. Attach a photo to chore completion

Goal: Users can optionally or mandatorily upload an image as completion proof.

Description: Integrate object storage (for example Vercel Blob or S3-compatible) with server-side upload from the completion form. Save the returned URL on `Completion`. Validate file type and size. Configure credentials via environment variables and document them in `.env.example`. If MVP requires note **or** photo, enforce that rule in the server action.

---

## 23. Dashboard — today’s priorities and overdue

Goal: The home screen shows what needs attention now.

Description: Build the Dashboard page section for due-today and overdue occurrences for the current household, sorted sensibly (overdue first). Each row links to the occurrence/chore detail and shows assignee. Use server components and a single Prisma query or two—avoid N+1. Empty state when nothing is due.

---

## 24. Dashboard — upcoming chores

Goal: Users see near-future work in one place.

Description: Add an “Upcoming” section (for example next 7 or 14 days) listing pending occurrences with due dates in that window, excluding items already shown as today/overdue. Same household scoping and row format as task 23 for consistency.

---

## 25. Dashboard — contribution summary

Goal: Show simple counts of completed chores per member over time.

Description: Aggregate completed occurrences (or completions) grouped by `completedByMemberId` for the household—MVP scope is counts only, no points weighting. Display as a table or bar list on the dashboard. Optionally filter to “this month” with a fixed default window documented in the UI. Read-only; no export required.

---

## 26. Chore history on detail pages

Goal: Past instances remain visible and distinguish missed from completed work.

Description: On chore detail, list historical occurrences (completed and overdue/pending past due) so missed recurring instances do not disappear when new ones exist. Show status, due date, assignee, and completion note summary. Pagination or “show last N” is enough for MVP.

---

## 27. Production deployment and environment checklist

Goal: The app runs on a public URL with database and uploads configured.

Description: Deploy the Next.js app (for example Vercel), provision hosted PostgreSQL, run migrations in production safely, and configure blob storage secrets. Add a short `_docs/deployment.md` with steps and required env vars. Verify login, create chore, and complete with note in production. Link deployment doc from the root README.

---
