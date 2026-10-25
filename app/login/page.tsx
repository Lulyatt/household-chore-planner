import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./login-form";

export const instant = false;

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const callbackUrl =
    params.callbackUrl && params.callbackUrl.startsWith("/")
      ? params.callbackUrl
      : "/dashboard";

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Household Chore Planner
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Sign in or create an account to open your dashboard.
        </p>
        <Link href="/" className="mt-3 inline-block text-sm text-zinc-500 underline">
          Back to home
        </Link>
      </div>
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
