import Link from "next/link";
import { notFound } from "next/navigation";
import { getSuggestedChoreTemplateByKey } from "@/lib/suggestedChoreTemplates/getCatalog";
import { NewChoreForm } from "../../../new/new-chore-form";

export const instant = false;

type NewChoreFromTemplatePageProps = {
  params: Promise<{ templateKey: string }>;
};

export default async function NewChoreFromTemplatePage({
  params,
}: NewChoreFromTemplatePageProps) {
  const { templateKey } = await params;
  const template = await getSuggestedChoreTemplateByKey(
    decodeURIComponent(templateKey),
  );

  if (!template) {
    notFound();
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/chores/templates"
          className="text-sm text-zinc-600 underline hover:text-zinc-900"
        >
          ← Back to templates
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-900">
          New chore from template
        </h1>
        <p className="text-sm text-zinc-600">
          Starting from &ldquo;{template.title}&rdquo;. Edit the fields below
          before saving for your household.
        </p>
      </header>
      <NewChoreForm
        suggestedTemplateKey={template.key}
        defaultTitle={template.title}
        defaultDescription={template.description}
      />
    </section>
  );
}
