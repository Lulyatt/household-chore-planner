import { describe, expect, it } from "vitest";
import { formatMemberName } from "./formatMemberName";

describe("formatMemberName", () => {
  it("trims edges and collapses whitespace", () => {
    expect(formatMemberName("  Alex   Kim  ")).toBe("Alex Kim");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(formatMemberName("   ")).toBe("");
  });
});
