import OpenAI from "openai";
import type { LlmClient } from "@/domain/evaluation/RubricAIEvaluator";
import { RUBRIC_CRITERIA } from "@/domain/constants";
import type { FeedbackData } from "@/domain/entities/Feedback";

export class OpenAiJsonClient implements LlmClient {
  constructor(
    private readonly client: OpenAI,
    private readonly model: string,
  ) {}

  async completeJson(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You return only valid JSON for an LLD rubric. Never wrap it in markdown.",
        },
        { role: "user", content: prompt },
      ],
    });
    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new Error("OpenAI returned an empty completion.");
    }
    return text;
  }
}

/**
 * Used when OPENAI_API_KEY is missing so the prototype still completes locally.
 * Scores are heuristic, not interview-grade.
 */
export class HeuristicLlmClient implements LlmClient {
  async completeJson(prompt: string): Promise<string> {
    const submissionMatch = prompt.split('Learner submission:\n"""')[1] ?? "";
    const submission = submissionMatch.replace(/"""[\s\S]*$/, "");
    const length = submission.trim().length;
    const mentionsInterface = /interface|abstract|port|strategy/i.test(submission);
    const mentionsTradeoff = /trade-?off|later|replace|swap/i.test(submission);
    const mentionsTest = /test|edge|null|invalid/i.test(submission);
    const base = length > 1200 ? 4 : length > 600 ? 3 : 2;

    const criteria = RUBRIC_CRITERIA.map((c) => {
      let score = base;
      if (c.name.includes("interfaces") && mentionsInterface) score = Math.min(5, score + 1);
      if (c.name.includes("Extensibility") && mentionsTradeoff) score = Math.min(5, score + 1);
      if (c.name.includes("testability") && mentionsTest) score = Math.min(5, score + 1);
      if (c.name.includes("Explanation")) score = Math.min(5, Math.max(2, base));
      return {
        name: c.name,
        score,
        evidence:
          submission.slice(0, 180).replace(/\n/g, " ") ||
          "Submission was too short to quote.",
        concern:
          score <= 2
            ? "This section is thin relative to the criterion."
            : "Could be more concrete about ownership and change.",
        suggestion:
          "Name the class that owns the behavior, what it depends on, and a requirement change you could absorb.",
        confidence: "low" as const,
      };
    });

    const payload: FeedbackData = {
      criteria,
      overallSummary:
        "Heuristic fallback ran because no OpenAI API key was configured. Treat scores as a structural hint, not a real design review.",
      strengths: mentionsInterface
        ? ["You named an abstraction that could absorb a later swap."]
        : ["You filled the required sections, which gives a reviewer something to grade."],
      improvements: [
        "Set OPENAI_API_KEY for rubric-quality comments.",
        "Call out a single extension point and the class that would change.",
      ],
    };
    return JSON.stringify(payload);
  }
}

export function createLlmClient(): LlmClient {
  const key = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  if (!key) {
    return new HeuristicLlmClient();
  }
  return new OpenAiJsonClient(new OpenAI({ apiKey: key }), model);
}
