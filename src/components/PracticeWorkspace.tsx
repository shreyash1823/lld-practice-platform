"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PracticeWorkspace({
  problemSlug,
  template,
}: {
  problemSlug: string;
  template: string;
}) {
  const router = useRouter();
  const [content, setContent] = useState(template);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const started = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemSlug }),
      });
      const startedJson = await started.json();
      if (!started.ok) {
        throw new Error(startedJson.error ?? "Could not start attempt");
      }

      const submitted = await fetch(`/api/attempts/${startedJson.attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const submittedJson = await submitted.json();
      if (!submitted.ok) {
        throw new Error(submittedJson.error ?? "Could not submit");
      }

      router.push(`/attempts/${startedJson.attemptId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
      setBusy(false);
    }
  }

  return (
    <section className="border border-ink-200 bg-white/80 p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl">Your design</h2>
        <p className="text-xs text-ink-700">Keep the seven headings.</p>
      </div>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        className="mt-3 h-[32rem] w-full resize-y border border-ink-200 bg-ink-50 p-3 font-mono text-sm leading-relaxed outline-none focus:border-accent-500"
        spellCheck={false}
      />
      {error ? (
        <p className="mt-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="mt-4 bg-accent-500 px-5 py-2 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-60"
      >
        {busy ? "Submitting…" : "Submit for rubric"}
      </button>
    </section>
  );
}
