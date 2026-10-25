"use client";

import { useState } from "react";

const WEEKDAY_OPTIONS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

export function RecurrenceFields() {
  const [enabled, setEnabled] = useState(false);
  const [kind, setKind] = useState<"weekly" | "every_n_days">("weekly");

  return (
    <fieldset className="flex flex-col gap-3 rounded-lg border border-zinc-200 px-4 py-3">
      <legend className="px-1 text-sm font-medium text-zinc-900">
        Recurrence
      </legend>
      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          name="recurrenceEnabled"
          value="on"
          checked={enabled}
          onChange={(event) => setEnabled(event.target.checked)}
        />
        Repeat on a schedule
      </label>
      {enabled ? (
        <>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-600">Pattern</span>
            <select
              name="recurrenceKind"
              value={kind}
              onChange={(event) =>
                setKind(event.target.value as "weekly" | "every_n_days")
              }
              className="rounded-lg border border-zinc-300 px-3 py-2"
            >
              <option value="weekly">Weekly on a weekday</option>
              <option value="every_n_days">Every N days</option>
            </select>
          </label>
          {kind === "weekly" ? (
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-zinc-600">Weekday</span>
              <select
                name="recurrenceWeekday"
                defaultValue="1"
                className="rounded-lg border border-zinc-300 px-3 py-2"
              >
                {WEEKDAY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-zinc-600">Repeat every (days)</span>
              <input
                name="recurrenceIntervalDays"
                type="number"
                min={1}
                max={366}
                defaultValue={7}
                className="rounded-lg border border-zinc-300 px-3 py-2"
              />
            </label>
          )}
          <p className="text-xs text-zinc-500">
            Set the first due date above to the first occurrence (and anchor for
            every-N-days). Upcoming instances are created when you open the
            chores list or chore detail.
          </p>
        </>
      ) : null}
    </fieldset>
  );
}
