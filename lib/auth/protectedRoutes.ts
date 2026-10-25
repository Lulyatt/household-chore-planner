/** Route prefixes that require an authenticated session (#6). Extended in #8. */
export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/chores",
  "/members",
] as const;

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) =>
      pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
