# Production deployment checklist

Deploy **Household Chore Planner** to a public URL with hosted PostgreSQL, Prisma migrations applied safely, and optional Vercel Blob for completion photos.

**Never commit production secrets.** Set all values in your host’s environment (e.g. Vercel **Project → Settings → Environment Variables**). Use [`.env.example`](../.env.example) as a local template only.

## Prerequisites

- GitHub repository connected to your deployment host.
- A hosted **PostgreSQL** database (Vercel Postgres, Neon, Supabase, Railway, etc.).
- Node.js build matches the repo (see `package.json`; Vercel detects Next.js automatically).

## 1. Provision PostgreSQL

1. Create a production Postgres instance in your provider’s dashboard.
2. Copy the **connection string** (pooler URL if the provider recommends it for serverless).
3. Ensure the database is empty or you accept that migrations will create/update schema in the `public` schema.

## 2. Deploy on Vercel

1. [Import the GitHub repo](https://vercel.com/new) into Vercel (or link an existing project).
2. **Framework preset:** Next.js (default).
3. **Build command:** `npm run build` (default).
4. **Install command:** `npm install` (default; `postinstall` runs `prisma generate`).
5. Deploy once with env vars set (step 3 below) so the build can connect if needed.

Optional: add a **Preview** environment with a separate `DATABASE_URL` if you want staging; custom domains are optional and not required for MVP.

## 3. Environment variables

Configure these for **Production** (and Preview if you use it):

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string for Prisma and Auth.js user storage. |
| `AUTH_SECRET` | Yes | Signs Auth.js JWT session cookies. Generate with `openssl rand -base64 32`. Use a **unique** value per environment. |
| `BLOB_READ_WRITE_TOKEN` | Recommended | Vercel Blob read-write token for completion **photo** uploads. If unset, users can still complete chores with a **note only**. |
| `AUTH_URL` | Recommended in prod | Public origin of the app, e.g. `https://your-app.vercel.app`. Helps Auth.js callbacks and links; Vercel often sets related vars automatically—set explicitly if sign-in redirects misbehave. |

### Vercel Blob (completion photos)

1. In the Vercel project: **Storage → Create Database / Store → Blob**.
2. Connect the store to the project; Vercel may inject `BLOB_READ_WRITE_TOKEN` (or copy the read-write token from the store settings).
3. Redeploy after adding storage env vars.

See also the README section on [completion photos](../README.md#completion-photos-vercel-blob).

## 4. Run migrations in production

Use **`migrate deploy`**, not `migrate dev`, against production. `migrate dev` is for local development and can prompt or reset data.

From your machine (with production `DATABASE_URL` exported **only for this command**, or via your provider’s shell):

```bash
# Example: one-off migrate using production URL (do not commit this URL)
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

**Safer patterns:**

- **CI / release job:** Run `npx prisma migrate deploy` in a GitHub Action (or Vercel deploy hook script) with `DATABASE_URL` from secrets, **before** or **after** the first deploy that needs the new schema—document your team’s order and stick to it.
- **First deploy:** Apply all migrations in `prisma/migrations/` once the production database exists and before users rely on the app.

`migrate deploy` applies pending migrations only; it does not generate new migration files.

**Do not** run `prisma migrate dev`, `prisma db push` (except experiments), or seed scripts against production unless you explicitly intend to load demo data.

## 5. Post-deploy smoke test

On the **production URL**, verify:

1. **Sign up / sign in** — create an account or log in; confirm redirect to `/dashboard` (or protected route) works.
2. **Create a chore** — add a custom chore (or from a template) for the household.
3. **Complete with a note** — mark an occurrence done with a text note; confirm it appears in history / dashboard.
4. **Optional — photo** — if `BLOB_READ_WRITE_TOKEN` is set, complete with a small JPEG/PNG; confirm upload succeeds.

If auth fails, check `AUTH_SECRET`, `AUTH_URL`, and that migrations created Auth.js tables (`User`, `Account`, etc.).

## 6. Ongoing releases

1. Merge changes that include new files under `prisma/migrations/`.
2. Run `npx prisma migrate deploy` against production (automated or manual).
3. Trigger a Vercel production deployment (usually automatic on push to the production branch).

## Quick reference

```bash
# Local dev (not production)
npx prisma migrate dev
npm run dev

# Production schema apply
npx prisma migrate deploy

# Verify build locally
npm test
npm run build
```

## Related docs

- Local setup and auth behaviour: [README](../README.md)
- Agent commands: [AGENTS.md](../AGENTS.md)
