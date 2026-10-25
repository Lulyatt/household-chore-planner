import { describe, expect, it } from "vitest";
import { nextRotationMemberId } from "./rotationConfig";

describe("nextRotationMemberId", () => {
  const order = ["m1", "m2", "m3"];

  it("wraps from last member to first", () => {
    expect(nextRotationMemberId(order, "m3")).toBe("m1");
  });

  it("advances to the next member in order", () => {
    expect(nextRotationMemberId(order, "m1")).toBe("m2");
    expect(nextRotationMemberId(order, "m2")).toBe("m3");
  });

  it("starts at the first member when there is no previous assignee", () => {
    expect(nextRotationMemberId(order, null)).toBe("m1");
  });

  it("starts at the first member when the previous assignee is outside the rotation list", () => {
    expect(nextRotationMemberId(order, "outsider")).toBe("m1");
  });

  it("always returns the sole member in a single-member household", () => {
    expect(nextRotationMemberId(["only"], null)).toBe("only");
    expect(nextRotationMemberId(["only"], "only")).toBe("only");
  });

  it("returns null when rotation has no members", () => {
    expect(nextRotationMemberId([], null)).toBeNull();
  });
});
