import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OnboardingForm } from "./onboarding-form";

export const instant = false;

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/onboarding");
  }
  if (session.user.householdId) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Set up your household
        </h1>
        <p className="text-sm text-zinc-600">
          Create a household and add yourself as the first member. You can add
          more people later.
        </p>
      </header>
      <OnboardingForm defaultMemberName={session.user.name} />
    </div>
  );
}
