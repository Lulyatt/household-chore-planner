"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { addMember } from "@/lib/household/addMember";
import { requireHouseholdSessionContext } from "@/lib/auth/sessionHousehold";

export type AddMemberFormState = {
  error?: string;
  success?: boolean;
  version?: number;
};

export async function addMemberAction(
  prevState: AddMemberFormState,
  formData: FormData,
): Promise<AddMemberFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/members");
  }

  const { householdId } = await requireHouseholdSessionContext();
  const displayName = String(formData.get("displayName") ?? "");

  const result = await addMember({ householdId, displayName });
  if (!result.ok) {
    return { error: result.message, success: false };
  }

  revalidatePath("/members");
  return { success: true, version: (prevState.version ?? 0) + 1 };
}
