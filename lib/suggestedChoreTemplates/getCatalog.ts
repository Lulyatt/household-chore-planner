import {
  SUGGESTED_CHORE_TEMPLATES,
  type SuggestedChoreTemplate,
} from "./catalog";

/** Read-only global catalog of suggested chore templates for server/UI layers (#10). */
export async function getSuggestedChoreTemplateCatalog(): Promise<
  readonly SuggestedChoreTemplate[]
> {
  return SUGGESTED_CHORE_TEMPLATES.map((template) => ({ ...template }));
}

/** Resolves a catalog entry by stable template key, or null if unknown. */
export async function getSuggestedChoreTemplateByKey(
  key: string,
): Promise<SuggestedChoreTemplate | null> {
  const trimmed = key.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const match = SUGGESTED_CHORE_TEMPLATES.find(
    (template) => template.key === trimmed,
  );
  return match ? { ...match } : null;
}
