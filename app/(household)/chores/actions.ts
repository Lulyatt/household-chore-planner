"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { parseOptionalAssigneeId } from "@/lib/choreOccurrences";
import { requireHouseholdSessionContext } from "@/lib/auth/sessionHousehold";
import { claimOccurrence } from "@/lib/chores/claimOccurrence";
import { createCustomChore } from "@/lib/chores/createCustomChore";
import { createChoreFromSuggestedTemplate } from "@/lib/chores/createChoreFromSuggestedTemplate";
import { parseRecurrenceFromForm } from "@/lib/chores/recurrenceRule";
import { completeOccurrence } from "@/lib/chores/completeOccurrence";
import {
  uploadCompletionPhoto,
  validateCompletionPhoto,
} from "@/lib/storage/completionPhoto";
import { updateChoreRotation } from "@/lib/chores/updateChoreRotation";
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
  const recurrence = parseRecurrenceFromForm({
    enabled: formData.get("recurrenceEnabled") === "on",
    kind: formData.get("recurrenceKind")?.toString(),
    weekdayRaw: formData.get("recurrenceWeekday")?.toString(),
    intervalDaysRaw: formData.get("recurrenceIntervalDays")?.toString(),
    firstDueDate: dueDate,
  });
  if (!recurrence.ok) {
    return { error: recurrence.message };
  }

  const result = await createCustomChore({
    householdId,
    title,
    description,
    dueDate,
    assigneeId,
    recurrenceRule: recurrence.rule,
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
  const recurrence = parseRecurrenceFromForm({
    enabled: formData.get("recurrenceEnabled") === "on",
    kind: formData.get("recurrenceKind")?.toString(),
    weekdayRaw: formData.get("recurrenceWeekday")?.toString(),
    intervalDaysRaw: formData.get("recurrenceIntervalDays")?.toString(),
    firstDueDate: dueDate,
  });
  if (!recurrence.ok) {
    return { error: recurrence.message };
  }

  const result = await createChoreFromSuggestedTemplate({
    householdId,
    suggestedTemplateKey,
    title,
    description,
    dueDate,
    assigneeId,
    recurrenceRule: recurrence.rule,
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

export async function completeOccurrenceAction(
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
  const note = String(formData.get("note") ?? "");
  const photoField = formData.get("photo");

  if (!occurrenceId || !choreDefinitionId) {
    return { error: "Missing occurrence." };
  }

  let photoUrl: string | null = null;
  if (photoField instanceof File && photoField.size > 0) {
    const validated = validateCompletionPhoto({
      contentType: photoField.type,
      sizeBytes: photoField.size,
    });
    if (!validated.ok) {
      return { error: validated.message };
    }
    const buffer = Buffer.from(await photoField.arrayBuffer());
    const uploaded = await uploadCompletionPhoto({
      householdId,
      occurrenceId,
      body: buffer,
      contentType: validated.contentType,
    });
    if (!uploaded.ok) {
      return { error: uploaded.message };
    }
    photoUrl = uploaded.url;
  }

  const result = await completeOccurrence({
    householdId,
    memberId,
    occurrenceId,
    note,
    photoUrl,
  });

  if (!result.ok) {
    return { error: result.message };
  }

  revalidatePath("/chores");
  revalidatePath(`/chores/${choreDefinitionId}`);
  return {};
}

export async function updateChoreRotationAction(
  _prevState: OccurrenceActionState,
  formData: FormData,
): Promise<OccurrenceActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/chores");
  }

  const { householdId } = await requireHouseholdSessionContext();
  const choreDefinitionId = String(formData.get("choreDefinitionId") ?? "");
  const enabled = formData.get("rotationEnabled") === "on";
  const memberIds = formData
    .getAll("rotationMemberIds")
    .map((value) => String(value));

  if (!choreDefinitionId) {
    return { error: "Missing chore." };
  }

  const result = await updateChoreRotation({
    householdId,
    choreDefinitionId,
    enabled,
    memberIds,
  });

  if (!result.ok) {
    return { error: result.message };
  }

  revalidatePath("/chores");
  revalidatePath(`/chores/${choreDefinitionId}`);
  return {};
}
