# Recurrence patterns (MVP)

Chore definitions store an optional `recurrenceRule` JSON column. When it is `null`, the chore behaves as a one-off: an optional first due date creates a single occurrence at save time.

## Supported patterns

| Pattern | JSON shape | Notes |
|---------|------------|--------|
| Weekly on a weekday | `{ "kind": "weekly", "weekday": 0–6 }` | Weekdays use JavaScript UTC numbering: `0` = Sunday through `6` = Saturday. The first due date on create must fall on that weekday. |
| Every N days | `{ "kind": "every_n_days", "intervalDays": N, "anchorDate": "YYYY-MM-DD" }` | Due dates are anchor, anchor+N, anchor+2N, … (UTC calendar dates). The first due date on create becomes the anchor. |

`intervalDays` must be between 1 and 366.

## UI

The **New chore** (and template) form exposes a “Repeat on a schedule” section: enable recurrence, pick weekly or every-N-days, and set the first due date.

## Generating occurrences (#18)

`materializeRecurringOccurrencesForHousehold` runs when the signed-in household loads **`/chores`** or **`/chores/[id]`** (see `lib/chores/queries.ts`). It inserts PENDING rows for due dates from today (UTC) through **90 days** ahead that match the rule and are not already present.

- Existing rows are never deleted or updated; missed PENDING instances stay in the list when new ones are added.
- When rotation is enabled on the definition, new generated rows receive the next rotating assignee; otherwise they are unassigned. See [`overdue-and-rotation.md`](./overdue-and-rotation.md).
- Date math lives in `lib/chores/recurrenceDates.ts` for unit tests without a database.

When the dashboard is implemented, it should call the same materialization helper before loading due/overdue widgets.
