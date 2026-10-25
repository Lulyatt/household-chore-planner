"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { completeOnboarding } from "@/lib/auth/completeOnboarding";

export type OnboardingFormState = {
  error?: string;
};

export async function completeOnboardingAction(
  _prevState: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login?callbackUrl=/onboarding");
  }

  const householdName = String(formData.get("householdName") ?? "");
  const memberName = String(formData.get("memberName") ?? "");

  const result = await completeOnboarding({
    userId,
    householdName,
    memberName,
  });
  if (!result.ok) {
    return { error: result.message };
  }

  redirect("/dashboard");
}
