import { redirect } from "next/navigation";
import { auth } from "@/auth";

export type HouseholdSessionContext = {
  userId: string;
  memberId: string;
  householdId: string;
};

/** Returns member and household ids from the current session, or null if not onboarded. */
export async function getHouseholdSessionContext(): Promise<HouseholdSessionContext | null> {
  const session = await auth();
  const userId = session?.user?.id;
  const memberId = session?.user?.memberId;
  const householdId = session?.user?.householdId;

  if (!userId || !memberId || !householdId) {
    return null;
  }

  return { userId, memberId, householdId };
}

/** Same as getHouseholdSessionContext but redirects to onboarding when household is missing. */
export async function requireHouseholdSessionContext(): Promise<HouseholdSessionContext> {
  const context = await getHouseholdSessionContext();
  if (!context) {
    redirect("/onboarding");
  }
  return context;
}
