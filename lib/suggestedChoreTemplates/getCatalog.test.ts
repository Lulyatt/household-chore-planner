import { describe, expect, it } from "vitest";
import { SUGGESTED_CHORE_TEMPLATES } from "./catalog";
import { getSuggestedChoreTemplateCatalog } from "./getCatalog";

describe("getSuggestedChoreTemplateCatalog", () => {
  it("returns at least five templates with stable keys, titles, and descriptions", async () => {
    const catalog = await getSuggestedChoreTemplateCatalog();

    expect(catalog.length).toBeGreaterThanOrEqual(5);
    for (const template of catalog) {
      expect(template.key.trim()).not.toBe("");
      expect(template.title.trim()).not.toBe("");
      expect(template.description.trim()).not.toBe("");
    }

    const keys = catalog.map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("returns a copy so callers cannot mutate the built-in catalog", async () => {
    const catalog = await getSuggestedChoreTemplateCatalog();
    const first = catalog[0];
    (first as { title: string }).title = "Mutated title";

    expect(SUGGESTED_CHORE_TEMPLATES[0]?.title).not.toBe("Mutated title");
  });

  it("includes the trash template key used by chore definition provenance", async () => {
    const catalog = await getSuggestedChoreTemplateCatalog();
    expect(catalog.some((t) => t.key === "trash")).toBe(true);
  });
});
