# Household Chore Planner

A shared tool for households (housemates, couples, or families) to organise chores, manage recurring tasks, and see how work is distributed over time.

## Overview

Everyone uses one shared household account. Members are managed inside that account. The main dashboard shows **today’s priorities** (due and overdue chores), **upcoming chores**, and a **contribution summary** so the household can track who completes what over time.

## Core features (MVP)

| Area | What it includes |
|------|------------------|
| **Household** | Shared account; add and manage members |
| **Chores** | Create custom chores or start from suggested templates |
| **Assignment** | Manual assign, automatic rotation on recurring chores, or leave unassigned for others to **claim** |
| **Schedules** | Recurring chores; overdue items stay visible until completed |
| **Completion** | Mark done with a **note or photo** as proof |
| **Tracking** | History of completed chores and simple per-member counts (no weighted scoring in MVP) |

### Assignment rules

- **Manual:** pick who is responsible.
- **Rotation:** recurring chores rotate between members; rotation rules are customisable.
- **Claiming:** members can claim **unassigned** chores only—not chores already assigned to someone else.

Recurring occurrences stay distinguishable in history when one is missed; the next occurrence does not silently replace the overdue one.

## Typical user flow

1. Open the shared household account.
2. Review today’s priorities, upcoming chores, and the contribution summary.
3. Create a chore from a template or from scratch.
4. Assign manually, set up rotation for a recurring chore, or leave it unassigned to claim.
5. Complete the chore with a note or photo.
6. The chore is recorded in history and reflected in contributions; overdue chores remain until finished.

## MVP checklist

- [ ] Shared household account
- [ ] Add and manage household members
- [ ] Dashboard (today, upcoming, contributions)
- [ ] Create custom chores
- [ ] Suggested chore templates
- [ ] Manual assignment
- [ ] Automatic rotation for recurring chores
- [ ] Customisable rotation rules
- [ ] Claim unassigned chores
- [ ] Recurring schedules
- [ ] Overdue chores visible until completed
- [ ] Note or photo required on completion
- [ ] Track completions and contributions over time

## Out of scope (for now)

- Notifications and reminders
- Points or gamification
- Weighted contribution scoring
- Approval from another member before completion counts
- Taking over chores assigned to someone else
- Advanced analytics

## Documentation

Full product scope and principles: [`_docs/plan.md`](_docs/plan.md). Additional notes live under [`_docs/`](_docs/).

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # Vitest unit tests
npm run build
npm run lint
```

See [`AGENTS.md`](AGENTS.md) for commands agents should use.

### Database (PostgreSQL + Prisma)

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to your Postgres instance.
2. Optional local database with Docker:

   ```bash
   docker compose up -d
   ```

   The default `.env.example` URL matches this service (`postgres` / `postgres`, database `household_chore_planner`, port `5432`).

3. Apply migrations and generate the client:

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

   `npx prisma generate` also runs automatically after `npm install` when the Prisma schema is present.

4. Optional sample data (one household, two members):

   ```bash
   npm run db:seed
   ```

5. Run tests. When `DATABASE_URL` is set, integration tests exercise the database (`lib/db.test.ts`, `lib/householdMembers.test.ts`). If `DATABASE_URL` is missing, those tests are **skipped** so `npm test` still passes; set `DATABASE_URL` in `.env` to run them locally.

### Household & member data rules

- **Duplicate names:** The database allows the same display name twice within one household. The Members UI may enforce uniqueness later; until then, avoid duplicates in seed and manual data if you want readable lists.
- **Deleting a household:** Removing a `Household` **cascades** and deletes its `Member` rows (`onDelete: Cascade` on the foreign key).

## Status

Next.js (App Router) scaffold with PostgreSQL/Prisma connectivity—see GitHub issues #1 and #2.
