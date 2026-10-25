Commands

npm run dev — start the development server.

npm run build — build the application for production.

npm run test — run the Vitest unit test suite.

npm run lint — run the linter, if configured.

npx prisma generate — generate the Prisma Client.

npx prisma migrate dev — create and apply database migrations during development.

Check package.json before running commands. Use the project's existing package manager and scripts. Only use commands that are configured or supported by the project.

Rules

Read the relevant documentation in _docs/ before starting a task.

Do not add dependencies without asking first.

Do not modify database schemas without considering the migration required.

Never hardcode secrets or expose environment variables containing secrets.

Do not change unrelated parts of the codebase.

Test changes before considering a task complete.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
