/** Primary nav links for authenticated household pages (#8). */
export const APP_NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chores", label: "Chores" },
  { href: "/members", label: "Members" },
] as const;

export type AppNavHref = (typeof APP_NAV_LINKS)[number]["href"];
