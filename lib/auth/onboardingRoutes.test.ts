import { describe, expect, it } from "vitest";
import {
  isOnboardingRoute,
  userHasHouseholdContext,
} from "./onboardingRoutes";

describe("onboardingRoutes", () => {
  it("detects onboarding paths", () => {
    expect(isOnboardingRoute("/onboarding")).toBe(true);
    expect(isOnboardingRoute("/onboarding/step-2")).toBe(true);
    expect(isOnboardingRoute("/dashboard")).toBe(false);
  });

  it("requires a household id in session context", () => {
    expect(userHasHouseholdContext({ householdId: "hh_1" })).toBe(true);
    expect(userHasHouseholdContext({ householdId: null })).toBe(false);
    expect(userHasHouseholdContext({})).toBe(false);
  });
});
