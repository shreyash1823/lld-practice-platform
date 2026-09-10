import { z } from "zod";
import { RUBRIC_CRITERIA } from "../constants";
import { Feedback } from "../entities/Feedback";
import type { Problem } from "../entities/Problem";
import type { Submission } from "../entities/Submission";
import type { Evaluator } from "./Evaluator";

export const criterionNameSchema = z.enum(
  RUBRIC_CRITERIA.map((c) => c.name) as [
    (typeof RUBRIC_CRITERIA)[number]["name"],
    ...(typeof RUBRIC_CRITERIA)[number]["name"][],
  ],
);

export const llmFeedbackSchema = z.object({
  criteria: z
    .array(
      z.object({
        name: criterionNameSchema,
        score: z.number().int().min(1).max(5),
        evidence: z.string().min(8),
        concern: z.string().min(4),
        suggestion: z.string().min(8),
        confidence: z.enum(["low", "medium", "high"]),
      }),
    )
    .length(RUBRIC_CRITERIA.length),
  overallSummary: z.string().min(20),
  strengths: z.array(z.string().min(4)).min(1).max(6),
  improvements: z.array(z.string().min(4)).min(1).max(6),
});

export type LlmFeedbackPayload = z.infer<typeof llmFeedbackSchema>;

export interface LlmClient {
  completeJson(prompt: string): Promise<string>;
}

export class RubricAIEvaluator implements Evaluator {
  constructor(private readonly llm: LlmClient) {}

  async evaluate(submission: Submission, problem: Problem): Promise<Feedback> {
    const raw = await this.llm.completeJson(
      buildRubricPrompt(problem, submission.content),
    );
    const parsed = parseFeedbackJson(raw);
    return new Feedback(parsed);
  }
}

export function parseFeedbackJson(raw: string): LlmFeedbackPayload {
  const json = extractJsonObject(raw);
  const parsed = llmFeedbackSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Malformed evaluator JSON: ${parsed.error.message}`);
  }
  const names = parsed.data.criteria.map((c) => c.name);
  const expected = RUBRIC_CRITERIA.map((c) => c.name);
  const missing = expected.filter((n) => !names.includes(n));
  if (missing.length > 0) {
    throw new Error(`Evaluator omitted criteria: ${missing.join(", ")}`);
  }
  return parsed.data;
}

export function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("Evaluator did not return JSON.");
  }
}

export function buildRubricPrompt(problem: Problem, submission: string): string {
  const criteriaBlock = RUBRIC_CRITERIA.map(
    (c) => `- ${c.name}: ${c.description} Score 1 (weak) to 5 (excellent).`,
  ).join("\n");

  return `You are an LLD interview coach. Multiple valid designs exist. Do not require matching a hidden reference solution. Score only from evidence in the learner's submission.

Problem title: ${problem.title}
Prompt: ${problem.prompt}
Requirements:
${problem.requirements.map((r) => `- ${r}`).join("\n")}
Constraints:
${problem.constraints.map((r) => `- ${r}`).join("\n")}

Rubric:
${criteriaBlock}

Rules:
- For every criterion, quote or closely paraphrase evidence from the submission.
- If the design is thin, score low and say why. Do not invent classes the learner did not mention.
- Reward explicit trade-offs and named extension points.
- Penalize pattern name-dropping without showing where the pattern lives.
- Return ONLY JSON matching this shape:
{
  "criteria": [{ "name": string, "score": 1-5, "evidence": string, "concern": string, "suggestion": string, "confidence": "low"|"medium"|"high" }],
  "overallSummary": string,
  "strengths": string[],
  "improvements": string[]
}
Include exactly these criterion names: ${RUBRIC_CRITERIA.map((c) => c.name).join(", ")}.

Learner submission:
"""
${submission}
"""`;
}
