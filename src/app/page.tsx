import Link from "next/link";
import { services } from "@/application/container";
import { getOrCreateLearnerId } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [problems, history] = await Promise.all([
    services.problems.findAll(),
    (async () => {
      const learnerId = getOrCreateLearnerId();
      return services.history.execute(learnerId);
    })(),
  ]);

  const curatedProblems = problems.slice(0, 3);
  const problemStats = new Map<
    string,
    { attempts: number; bestScore: number | null }
  >();

  for (const item of history) {
    if (!item.problemSlug) continue;

    const current = problemStats.get(item.problemSlug) ?? {
      attempts: 0,
      bestScore: null,
    };

    current.attempts += 1;

    if (item.overallScore !== null) {
      current.bestScore =
        current.bestScore === null || item.overallScore > current.bestScore
          ? item.overallScore
          : current.bestScore;
    }

    problemStats.set(item.problemSlug, current);
  }

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600">
          Practice loop
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 md:text-4xl">
          Pick a problem and start practicing.
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink-700">
          Write a structured design, submit it, and use rubric feedback to
          tighten your thinking with each attempt.
        </p>
      </div>

      <div className="flex items-center justify-between border-b border-ink-200 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600">
            Curated set
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-ink-900">
            Low-level design problems
          </h2>
        </div>

        <Link
          href="/history"
          className="text-sm font-medium text-ink-700 hover:text-ink-900"
        >
          View attempts
        </Link>
      </div>

      <ul className="grid gap-4 md:grid-cols-3">
        {curatedProblems.map((problem, index) => {
          const stats = problemStats.get(problem.slug) ?? {
            attempts: 0,
            bestScore: null,
          };

          return (
            <li
              key={problem.id}
              className="group flex h-full flex-col rounded-2xl border border-ink-200 bg-white/80 p-5 shadow-[0_1px_0_rgba(15,23,42,0.02)] transition-colors hover:border-accent-300 hover:bg-white"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-accent-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-700">
                  {problem.difficulty}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-500">
                  Problem {index + 1}
                </span>
              </div>

              <h3 className="mt-4 text-xl font-semibold text-ink-900">
                {problem.title}
              </h3>

              <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink-700">
                {problem.prompt}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-ink-200 pt-4">
                <div className="rounded-xl bg-ink-50 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-500">
                    Attempts
                  </p>
                  <p className="mt-1 text-lg font-semibold text-ink-900">
                    {stats.attempts}
                  </p>
                </div>

                <div className="rounded-xl bg-ink-50 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-500">
                    Best
                  </p>
                  <p className="mt-1 text-lg font-semibold text-ink-900">
                    {stats.bestScore === null ? "—" : `${stats.bestScore}/100`}
                  </p>
                </div>
              </div>

              <Link
                href={`/problems/${problem.slug}`}
                className="mt-6 inline-flex items-center justify-between rounded-xl border border-accent-200 bg-accent-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-700"
              >
                <span>Start Practice</span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
