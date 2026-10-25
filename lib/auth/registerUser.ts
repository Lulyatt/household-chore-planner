import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { validateEmail, validatePassword } from "@/lib/password";

export type RegisterUserResult =
  | { ok: true }
  | { ok: false; message: string };

export async function registerUser(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<RegisterUserResult> {
  const emailCheck = validateEmail(input.email);
  if (!emailCheck.ok) {
    return emailCheck;
  }
  const passwordCheck = validatePassword(input.password);
  if (!passwordCheck.ok) {
    return passwordCheck;
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return { ok: false, message: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const displayName = input.name?.trim() || null;

  await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: displayName,
      passwordHash,
    },
  });

  return { ok: true };
}
