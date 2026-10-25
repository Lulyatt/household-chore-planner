export const ONBOARDING_PATH = "/onboarding";

export function isOnboardingRoute(pathname: string): boolean {
  return (
    pathname === ONBOARDING_PATH ||
    pathname.startsWith(`${ONBOARDING_PATH}/`)
  );
}

export function userHasHouseholdContext(user: {
  memberId?: string | null;
  householdId?: string | null;
}): boolean {
  return Boolean(user.memberId?.trim() && user.householdId?.trim());
}
