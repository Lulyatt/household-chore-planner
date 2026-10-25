# Overdue and rotation (MVP)

## Overdue (#20)

Overdue is **not** stored on `ChoreOccurrence.status`. Rows stay `PENDING` until completed.

**Rule (UTC):** an occurrence is overdue when `status === PENDING` and `dueDate` is strictly before the start of today in UTC (`lib/chores/occurrenceStatus.ts` → `isOccurrenceOverdue` / `getOccurrenceDisplayStatus`).

- Due **today** (UTC calendar date) → pending, not overdue.
- Due **yesterday** or earlier → overdue until completed.
- Completing an occurrence sets `COMPLETED` and does not remove sibling rows.

Lists and badges (`/chores`, chore detail) use the shared helpers—do not duplicate date math in components. Dashboard widgets (#23–#26) should import the same module.

## Automatic rotation (#19)

Recurring definitions may store `rotationConfig` JSON:

```json
{ "enabled": true, "memberIds": ["memberId1", "memberId2"] }
```

- `memberIds` is the rotation order (top-to-bottom in the chore detail editor).
- When `materializeRecurringOccurrencesForDefinition` inserts **new** rows, each gets the next member after the chronologically previous occurrence’s assignee (`nextRotationMemberId`).
- **Manual overrides:** changing assignee on an existing row (dropdown or claim) is kept. Materialization never updates existing occurrences—only new auto-generated rows receive rotation assignees.
- If the previous assignee is missing or not in `memberIds`, rotation starts at the first listed member.
- Single-member lists always assign that member.

See also [`recurrence-patterns.md`](./recurrence-patterns.md).
