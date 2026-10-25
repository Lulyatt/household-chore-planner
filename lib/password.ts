/** Minimum password length enforced on sign-up and sign-in validation. */
export const PASSWORD_MIN_LENGTH = 8;

export type PasswordValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function validatePassword(password: string): PasswordValidationResult {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      ok: false,
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
    };
  }
  return { ok: true };
}

export function validateEmail(email: string): PasswordValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { ok: false, message: "Email is required." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, message: "Enter a valid email address." };
  }
  return { ok: true };
}
