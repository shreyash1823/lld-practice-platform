import Link from "next/link";

type Feedback = {
  criteria: {
    name: string;
    score: number;
    evidence: string;
    concern: string;
    suggestion: string;
    confidence: string;
  }[];
  overallSummary: string;
  strengths: string[];
  improvements: string[];
};

export function FeedbackPanel({
  score,
  feedback,
  problemSlug,
}: {
  score: number | null;
  feedback: Feedback;
  problemSlug: string;
}) {
  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-accent-600">
            Rubric v1
          </p>
          <h2 className="font-display text-3xl">Feedback</h2>
        </div>
        <p className="font-display text-4xl">{score ?? "—"}<span className="text-lg"> / 5</span></p>
      </div>
      <p className="mt-3 text-ink-700">{feedback.overallSummary}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <List title="Strengths" items={feedback.strengths} />
        <List title="Next improvements" items={feedback.improvements} />
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink-200 text-xs uppercase tracking-wider text-ink-700">
              <th className="py-2 pr-3">Criterion</th>
              <th className="py-2 pr-3">Score</th>
              <th className="py-2 pr-3">Evidence</th>
              <th className="py-2">Suggestion</th>
            </tr>
          </thead>
          <tbody>
            {feedback.criteria.map((row) => (
              <tr key={row.name} className="border-b border-ink-100 align-top">
                <td className="py-3 pr-3 font-medium">{row.name}</td>
                <td className="py-3 pr-3">{row.score}</td>
                <td className="py-3 pr-3 text-ink-700">{row.evidence}</td>
                <td className="py-3">
                  {row.suggestion}
                  <p className="mt-1 text-xs text-ink-700">
                    Concern: {row.concern} · {row.confidence} confidence
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link
        href={`/problems/${problemSlug}`}
        className="mt-6 inline-block bg-accent-500 px-4 py-2 text-sm text-white"
      >
        Try again
      </Link>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border border-ink-200 bg-white/70 p-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-2 list-disc pl-5 text-sm text-ink-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
