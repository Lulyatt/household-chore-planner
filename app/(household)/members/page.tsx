import { listMembersForCurrentHousehold } from "@/lib/household/queries";
import { AddMemberForm } from "./add-member-form";

export const instant = false;

export default async function MembersPage() {
  const members = await listMembersForCurrentHousehold();

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-zinc-900">Members</h1>
        <p className="text-sm text-zinc-600">
          People in your household. Added members do not get their own login in
          this version—they are names you can assign chores to later.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-zinc-900">
          Household members ({members.length})
        </h2>
        {members.length === 0 ? (
          <p className="text-sm text-zinc-600">No members yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
            {members.map((member) => (
              <li
                key={member.id}
                className="px-4 py-3 text-sm text-zinc-900"
              >
                {member.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-zinc-900">Add a member</h2>
        <AddMemberForm />
      </div>
    </section>
  );
}
