import { describe, expect, it } from "vitest";
import { APP_NAV_LINKS } from "./appNav";

describe("APP_NAV_LINKS", () => {
  it("lists the main household sections", () => {
    expect(APP_NAV_LINKS.map((link) => link.href)).toEqual([
      "/dashboard",
      "/chores",
      "/members",
    ]);
  });
});
