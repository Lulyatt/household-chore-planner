import { AppShell } from "@/components/app-shell";
import { requireHouseholdSessionContext } from "@/lib/auth/sessionHousehold";
import { prisma } from "@/lib/db";

export default async function HouseholdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { householdId } = await requireHouseholdSessionContext();
  const household = await prisma.household.findUnique({
    where: { id: householdId },
    select: { name: true },
  });

  return (
    <AppShell householdName={household?.name ?? "Household"}>
      {children}
    </AppShell>
  );
}
