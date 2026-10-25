"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { parseOptionalAssigneeId } from "@/lib/choreOccurrences";
import { requireHouseholdSessionContext } from "@/lib/auth/sessionHousehold";
import { claimOccurrence } from "@/lib/chores/claimOccurrence";
import { createCustomChore } from "@/lib/chores/createCustomChore";
import { createChoreFromSuggestedTemplate } from "@/lib/chores/createChoreFromSuggestedTemplate";
import { updateOccurrenceAssignee } from "@/lib/chores/updateOccurrenceAssignee";

export type CreateCustomChoreFormState = {
  error?: string;
};

export type OccurrenceActionState = {
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
  const assigneeId = parseOptionalAssigneeId(formData.get("assigneeId"));

  const result = await createCustomChore({
    householdId,
    title,
    description,
    dueDate,
    assigneeId,
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
  const assigneeId = parseOptionalAssigneeId(formData.get("assigneeId"));

  const result = await createChoreFromSuggestedTemplate({
    householdId,
    suggestedTemplateKey,
    title,
    description,
    dueDate,
    assigneeId,
  });

  if (!result.ok) {
    return { error: result.message };
  }

  revalidatePath("/chores");
  revalidatePath(`/chores/${result.choreDefinitionId}`);
  redirect(`/chores/${result.choreDefinitionId}?created=1`);
}

export async function updateOccurrenceAssigneeAction(
  _prevState: OccurrenceActionState,
  formData: FormData,
): Promise<OccurrenceActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/chores");
  }

  const { householdId } = await requireHouseholdSessionContext();
  const occurrenceId = String(formData.get("occurrenceId") ?? "");
  const choreDefinitionId = String(formData.get("choreDefinitionId") ?? "");
  const assigneeId = parseOptionalAssigneeId(formData.get("assigneeId"));

  if (!occurrenceId || !choreDefinitionId) {
    return { error: "Missing occurrence." };
  }

  const result = await updateOccurrenceAssignee({
    householdId,
    occurrenceId,
    assigneeId,
  });

  if (!result.ok) {
    return { error: result.message };
  }

  revalidatePath("/chores");
  revalidatePath(`/chores/${choreDefinitionId}`);
  return {};
}

export async function claimOccurrenceAction(
  _prevState: OccurrenceActionState,
  formData: FormData,
): Promise<OccurrenceActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/chores");
  }

  const { householdId, memberId } = await requireHouseholdSessionContext();
  const occurrenceId = String(formData.get("occurrenceId") ?? "");
  const choreDefinitionId = String(formData.get("choreDefinitionId") ?? "");

  if (!occurrenceId || !choreDefinitionId) {
    return { error: "Missing occurrence." };
  }

  const result = await claimOccurrence({
    householdId,
    memberId,
    occurrenceId,
  });

  if (!result.ok) {
    return { error: result.message };
  }

  revalidatePath("/chores");
  revalidatePath(`/chores/${choreDefinitionId}`);
  return {};
}
