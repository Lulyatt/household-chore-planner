import { describe, expect, it } from "vitest";
import {
  PASSWORD_MIN_LENGTH,
  validateEmail,
  validatePassword,
} from "./password";

describe("validatePassword", () => {
  it(`requires at least ${PASSWORD_MIN_LENGTH} characters`, () => {
    expect(validatePassword("a".repeat(PASSWORD_MIN_LENGTH - 1)).ok).toBe(
      false,
    );
    expect(validatePassword("a".repeat(PASSWORD_MIN_LENGTH)).ok).toBe(true);
  });
});

describe("validateEmail", () => {
  it("rejects empty and invalid addresses", () => {
    expect(validateEmail("").ok).toBe(false);
    expect(validateEmail("not-an-email").ok).toBe(false);
  });

  it("accepts a simple valid address", () => {
    expect(validateEmail("user@example.com").ok).toBe(true);
  });
});
