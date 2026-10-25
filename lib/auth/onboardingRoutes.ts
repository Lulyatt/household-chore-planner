export const ONBOARDING_PATH = "/onboarding";

export function isOnboardingRoute(pathname: string): boolean {
  return (
    pathname === ONBOARDING_PATH ||
    pathname.startsWith(`${ONBOARDING_PATH}/`)
  );
}

export function userHasHouseholdContext(user: {
  householdId?: string | null;
}): boolean {
  return Boolean(user.householdId?.trim());
}
