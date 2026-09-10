"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FeedbackPanel } from "@/components/FeedbackPanel";

type Detail = {
  attempt: { id: string; status: string; startedAt: string };
  problem: { title: string; slug: string };
  submission: { content: string } | null;
  evaluation: {
    id: string;
    status: string;
    errorMessage: string | null;
    overallScore: number | null;
    feedback: {
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
    } | null;
  } | null;
};

export function AttemptView({ attemptId }: { attemptId: string }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    async function load() {
      const response = await fetch(`/api/attempts/${attemptId}`);
      const json = await response.json();
      if (!response.ok) {
        if (!cancelled) setError(json.error ?? "Could not load attempt");
        return;
      }
      if (!cancelled) setDetail(json);
      const status = json.evaluation?.status;
      if (status === "COMPLETED" || status === "FAILED") {
        if (timer) clearInterval(timer);
      }
    }

    load();
    timer = setInterval(load, 2000);
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [attemptId]);

  if (error) {
    return <p className="text-red-800">{error}</p>;
  }
  if (!detail) {
    return <p className="text-ink-700">Loading attempt…</p>;
  }

  const status = detail.evaluation?.status ?? "PENDING";

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section>
        <p className="text-xs uppercase tracking-wider text-accent-600">
          {status.replaceAll("_", " ")}
        </p>
        <h1 className="font-display text-4xl">{detail.problem.title}</h1>
        <p className="mt-2 text-sm text-ink-700">
          Attempt {detail.attempt.id.slice(0, 8)} · started{" "}
          {new Date(detail.attempt.startedAt).toLocaleString()}
        </p>
        <pre className="mt-6 max-h-[36rem] overflow-auto whitespace-pre-wrap border border-ink-200 bg-white/70 p-4 text-sm">
          {detail.submission?.content}
        </pre>
      </section>
      <section>
        {status === "FAILED" ? (
          <FailedCard
            evaluationId={detail.evaluation?.id}
            message={detail.evaluation?.errorMessage}
            problemSlug={detail.problem.slug}
          />
        ) : status === "COMPLETED" && detail.evaluation?.feedback ? (
          <FeedbackPanel
            score={detail.evaluation.overallScore}
            feedback={detail.evaluation.feedback}
            problemSlug={detail.problem.slug}
          />
        ) : (
          <div className="border border-dashed border-ink-200 p-6">
            <h2 className="font-display text-2xl">Evaluating</h2>
            <p className="mt-2 text-ink-700">
              Your submission is stored. The rubric evaluator is running in the
              background. This page polls every two seconds.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function FailedCard({
  evaluationId,
  message,
  problemSlug,
}: {
  evaluationId?: string;
  message: string | null | undefined;
  problemSlug: string;
}) {
  const [busy, setBusy] = useState(false);

  async function retry() {
    if (!evaluationId) return;
    setBusy(true);
    await fetch(`/api/evaluations/${evaluationId}/retry`, { method: "POST" });
    window.location.reload();
  }

  return (
    <div className="border border-ink-200 bg-white p-6">
      <h2 className="font-display text-2xl">Evaluation failed</h2>
      <p className="mt-2 text-sm text-ink-700">
        {message ?? "The evaluator did not finish. Your submission is still saved."}
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={retry}
          disabled={busy}
          className="bg-accent-500 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          Retry evaluation
        </button>
        <Link href={`/problems/${problemSlug}`} className="px-4 py-2 text-sm underline">
          New attempt
        </Link>
      </div>
    </div>
  );
}
