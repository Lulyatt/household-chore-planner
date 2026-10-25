# Suggested chore templates

The app ships a **global, read-only catalog** of starter chores. Templates are **not** tied to a household until someone creates a chore from one (see backlog task 12 in [`tasks.md`](tasks.md)).

## Where the list lives

| What | Location |
|------|----------|
| Template definitions (keys, titles, descriptions) | [`lib/suggestedChoreTemplates/catalog.ts`](../lib/suggestedChoreTemplates/catalog.ts) |
| Server entry point for the UI | [`getSuggestedChoreTemplateCatalog()`](../lib/suggestedChoreTemplates/getCatalog.ts) |

There is no database table for this catalog in the MVP. Household-owned chores are stored as `ChoreDefinition` rows; only copies created from a template set `source = FROM_SUGGESTED_TEMPLATE` and `suggestedTemplateKey` to the template’s `key`.

## Editing templates (product owners)

1. Open `lib/suggestedChoreTemplates/catalog.ts`.
2. Add, remove, or change entries in `SUGGESTED_CHORE_TEMPLATES`.
3. For each template, set:
   - **`key`** — stable slug (kebab-case). **Do not rename** keys that already exist in production data; they are stored on `ChoreDefinition.suggestedTemplateKey`.
   - **`title`** — short label shown when picking or pre-filling a chore.
   - **`description`** — one or two sentences of guidance for the household.
4. Run `npm test` and `npm run build` before merging.
5. New templates appear automatically via `getSuggestedChoreTemplateCatalog()`; no migration is required.

## Constraints

- Keep at least five templates for a useful starter library.
- Template `key` values must be unique within the array.
- Do not add `householdId` or other tenant fields to the catalog — scoping applies only after a chore is created for a household.
