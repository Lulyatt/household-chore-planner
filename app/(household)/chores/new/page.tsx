import { listMembersForCurrentHousehold } from "@/lib/household/queries";
import { NewChoreForm } from "./new-chore-form";

export const instant = false;

export default async function NewChorePage() {
  const members = await listMembersForCurrentHousehold();

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-zinc-900">New chore</h1>
        <p className="text-sm text-zinc-600">
          Add a custom chore for your household. You can schedule a first due
          date now or add occurrences later.
        </p>
      </header>
      <NewChoreForm members={members} />
    </section>
  );
}
