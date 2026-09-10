import { notFound } from "next/navigation";
import { services } from "@/application/container";
import { PracticeWorkspace } from "@/components/PracticeWorkspace";
import { SUBMISSION_TEMPLATE } from "@/lib/template";

export const dynamic = "force-dynamic";

export default async function ProblemPage({
  params,
}: {
  params: { slug: string };
}) {
  const problem = await services.problems.findBySlug(params.slug);
  if (!problem) notFound();
  const json = problem.toJSON();

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <aside className="prose-problem">
        <p className="text-xs uppercase tracking-wider text-accent-600">
          {json.difficulty}
        </p>
        <h1 className="font-display text-4xl text-ink-900">{json.title}</h1>
        <p className="mt-3 text-ink-700">{json.prompt}</p>
        <h2>Requirements</h2>
        <ul>
          {json.requirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h2>Constraints</h2>
        <ul>
          {json.constraints.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h2>Guiding questions</h2>
        <ul>
          {json.guidingQuestions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </aside>
      <PracticeWorkspace
        problemSlug={json.slug}
        template={SUBMISSION_TEMPLATE}
      />
    </div>
  );
}
