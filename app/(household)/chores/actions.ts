"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { requireHouseholdSessionContext } from "@/lib/auth/sessionHousehold";
import { createCustomChore } from "@/lib/chores/createCustomChore";
import { createChoreFromSuggestedTemplate } from "@/lib/chores/createChoreFromSuggestedTemplate";

export type CreateCustomChoreFormState = {
  error?: string;
};

export async function createCustomChoreAction(
  _prevState: CreateCustomChoreFormState,
  formData: FormData,
): Promise<CreateCustomChoreFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/chores/new");
  }

  const { householdId } = await requireHouseholdSessionContext();
  const title = String(formData.get("title") ?? "");
  const descriptionRaw = formData.get("description");
  const description =
    descriptionRaw == null ? null : String(descriptionRaw);
  const dueDateRaw = formData.get("dueDate");
  const dueDate = dueDateRaw == null ? null : String(dueDateRaw);

  const result = await createCustomChore({
    householdId,
    title,
    description,
    dueDate,
  });

  if (!result.ok) {
    return { error: result.message };
  }

  revalidatePath("/chores");
  revalidatePath(`/chores/${result.choreDefinitionId}`);
  redirect(`/chores/${result.choreDefinitionId}?created=1`);
}

export async function createChoreFromSuggestedTemplateAction(
  _prevState: CreateCustomChoreFormState,
  formData: FormData,
): Promise<CreateCustomChoreFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/chores/templates");
  }

  const suggestedTemplateKey = String(
    formData.get("suggestedTemplateKey") ?? "",
  );

  const { householdId } = await requireHouseholdSessionContext();
  const title = String(formData.get("title") ?? "");
  const descriptionRaw = formData.get("description");
  const description =
    descriptionRaw == null ? null : String(descriptionRaw);
  const dueDateRaw = formData.get("dueDate");
  const dueDate = dueDateRaw == null ? null : String(dueDateRaw);

  const result = await createChoreFromSuggestedTemplate({
    householdId,
    suggestedTemplateKey,
    title,
    description,
    dueDate,
  });

  if (!result.ok) {
    return { error: result.message };
  }

  revalidatePath("/chores");
  revalidatePath(`/chores/${result.choreDefinitionId}`);
  redirect(`/chores/${result.choreDefinitionId}?created=1`);
}
