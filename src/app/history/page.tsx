"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = {
  attemptId: string;
  problemTitle: string;
  problemSlug: string;
  status: string;
  startedAt: string;
  submittedAt: string | null;
  evaluationStatus: string | null;
  overallScore: number | null;
};

export default function HistoryPage() {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((json) => setItems(json.items ?? []));
  }, []);

  return (
    <div>
      <h1 className="font-display text-4xl">Your attempts</h1>
      <p className="mt-2 text-ink-700">
        History is tied to this browser via a learner cookie. Clearing cookies
        starts a new identity.
      </p>
      {!items ? (
        <p className="mt-6">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-6">
          No attempts yet. <Link href="/" className="underline">Pick a problem</Link>.
        </p>
      ) : (
        <table className="mt-8 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink-200 text-xs uppercase tracking-wider text-ink-700">
              <th className="py-2">Problem</th>
              <th className="py-2">Started</th>
              <th className="py-2">Status</th>
              <th className="py-2">Score</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.attemptId} className="border-b border-ink-100">
                <td className="py-3">{item.problemTitle}</td>
                <td className="py-3">{new Date(item.startedAt).toLocaleString()}</td>
                <td className="py-3">
                  {item.evaluationStatus ?? item.status}
                </td>
                <td className="py-3">{item.overallScore ?? "—"}</td>
                <td className="py-3">
                  <Link href={`/attempts/${item.attemptId}`} className="underline">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
