import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { validateEmail, validatePassword } from "@/lib/password";

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    // Credentials provider requires JWT sessions (database strategy is OAuth-only).
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const emailCheck = validateEmail(email);
        if (!emailCheck.ok) {
          return null;
        }
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.ok) {
          return null;
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            memberId: true,
            member: { select: { householdId: true } },
          },
        });
        if (!user?.passwordHash) {
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          memberId: user.memberId,
          householdId: user.member?.householdId ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.sub = user.id;
        token.memberId = user.memberId ?? null;
        token.householdId = user.householdId ?? null;
      }

      if (trigger === "update" && session?.user) {
        if (session.user.memberId !== undefined) {
          token.memberId = session.user.memberId;
        }
        if (session.user.householdId !== undefined) {
          token.householdId = session.user.householdId;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.memberId =
          typeof token.memberId === "string" ? token.memberId : null;
        session.user.householdId =
          typeof token.householdId === "string" ? token.householdId : null;
      }
      return session;
    },
  },
  trustHost: true,
});

export { SESSION_MAX_AGE_SECONDS };
