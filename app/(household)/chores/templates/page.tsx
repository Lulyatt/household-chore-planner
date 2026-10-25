import Link from "next/link";
import { getSuggestedChoreTemplateCatalog } from "@/lib/suggestedChoreTemplates/getCatalog";

export const instant = false;

export default async function SuggestedChoreTemplatesPage() {
  const templates = await getSuggestedChoreTemplateCatalog();

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/chores"
          className="text-sm text-zinc-600 underline hover:text-zinc-900"
        >
          ← Back to chores
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Suggested templates
        </h1>
        <p className="text-sm text-zinc-600">
          Pick a starter chore, adjust the details for your household, then save
          it as your own definition.
        </p>
      </header>

      <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
        {templates.map((template) => (
          <li key={template.key}>
            <Link
              href={`/chores/templates/${encodeURIComponent(template.key)}/new`}
              className="flex flex-col gap-1 px-4 py-3 hover:bg-zinc-50"
            >
              <span className="text-sm font-medium text-zinc-900">
                {template.title}
              </span>
              <span className="line-clamp-2 text-sm text-zinc-600">
                {template.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-sm text-zinc-600">
        Prefer something unique?{" "}
        <Link href="/chores/new" className="underline hover:text-zinc-900">
          Create a custom chore
        </Link>
        .
      </p>
    </section>
  );
}
