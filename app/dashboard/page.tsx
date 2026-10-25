import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { requireHouseholdSessionContext } from "@/lib/auth/sessionHousehold";
import { listMembersForCurrentHousehold } from "@/lib/household/queries";
import { prisma } from "@/lib/db";

export const instant = false;

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const { householdId, memberId } = await requireHouseholdSessionContext();
  const household = await prisma.household.findUnique({
    where: { id: householdId },
    select: { name: true },
  });
  const members = await listMembersForCurrentHousehold();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-600">
            {household?.name ?? "Household"} · signed in as{" "}
            {session.user.email ?? session.user.name ?? "user"}
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Sign out
          </button>
        </form>
      </header>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium text-zinc-900">Members</h2>
        <ul className="list-inside list-disc text-zinc-700">
          {members.map((member) => (
            <li key={member.id}>
              {member.name}
              {member.id === memberId ? " (you)" : ""}
            </li>
          ))}
        </ul>
      </section>
      <p className="text-sm text-zinc-500">
        Placeholder dashboard (#8 will add navigation and chore views).
      </p>
      <Link href="/" className="text-sm text-zinc-500 underline">
        Home
      </Link>
    </div>
  );
}
