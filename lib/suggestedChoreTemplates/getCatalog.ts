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
