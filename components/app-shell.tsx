import Link from "next/link";
import { signOut } from "@/auth";
import { APP_NAV_LINKS } from "@/lib/navigation/appNav";

type AppShellProps = {
  householdName: string;
  children: React.ReactNode;
};

export function AppShell({ householdName, children }: AppShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-zinc-600">{householdName}</p>
          <nav
            aria-label="Main"
            className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium"
          >
            {APP_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-zinc-900 underline-offset-4 hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
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
      {children}
    </div>
  );
}
