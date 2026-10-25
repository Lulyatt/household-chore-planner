import { describe, expect, it } from "vitest";
import { isProtectedRoute } from "./protectedRoutes";

describe("isProtectedRoute", () => {
  it("protects household app sections", () => {
    expect(isProtectedRoute("/dashboard")).toBe(true);
    expect(isProtectedRoute("/dashboard/settings")).toBe(true);
    expect(isProtectedRoute("/chores")).toBe(true);
    expect(isProtectedRoute("/members/add")).toBe(true);
  });

  it("allows public routes", () => {
    expect(isProtectedRoute("/")).toBe(false);
    expect(isProtectedRoute("/login")).toBe(false);
    expect(isProtectedRoute("/api/auth/session")).toBe(false);
  });
});
