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