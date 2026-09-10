import { describe, expect, it } from "vitest";
import {
  parseFeedbackJson,
  extractJsonObject,
} from "@/domain/evaluation/RubricAIEvaluator";
import { RuleBasedEvaluator } from "@/domain/evaluation/RuleBasedEvaluator";
import { RUBRIC_CRITERIA } from "@/domain/constants";
import { Problem } from "@/domain/entities/Problem";

function validPayload() {
  return {
    criteria: RUBRIC_CRITERIA.map((c) => ({
      name: c.name,
      score: 3,
      evidence: "Quoted from the submission body here.",
      concern: "Could name the owner of this behavior.",
      suggestion: "Add an interface for the piece that will change.",
      confidence: "medium",
    })),
    overallSummary: "A middling design with enough structure to coach against.",
    strengths: ["Named core types"],
    improvements: ["Call out a change scenario"],
  };
}

describe("parseFeedbackJson", () => {
  it("parses a strict rubric payload", () => {
    const parsed = parseFeedbackJson(JSON.stringify(validPayload()));
    expect(parsed.criteria).toHaveLength(8);
  });

  it("extracts JSON from surrounding text", () => {
    const wrapped = `Sure.\n${JSON.stringify(validPayload())}\n`;
    expect(extractJsonObject(wrapped)).toMatchObject({
      overallSummary: expect.any(String),
    });
  });

  it("rejects malformed evaluator JSON", () => {
    expect(() => parseFeedbackJson('{"criteria":[]}')).toThrow(
      /Malformed evaluator JSON/,
    );
  });
});

describe("RuleBasedEvaluator", () => {
  it("returns offline rubric feedback when AI is unavailable", async () => {
    const problem = new Problem({
      id: "prob-test",
      slug: "test-problem",
      title: "Test problem",
      difficulty: "Beginner",
      prompt: "Design a small system with clear responsibilities.",
      requirements: ["Handle a request", "Expose a clean interface"],
      constraints: ["Keep it simple"],
      guidingQuestions: ["Who owns the state?"],
    });

    const submission = {
      id: "sub-test",
      attemptId: "attempt-test",
      content: `## Requirements understood\nWe need to support a request and expose a clean interface.\n\n## Assumptions\nWe assume one request at a time.\n\n## Core classes & responsibilities\nA Controller runs the flow and a Service handles business rules.\n\n## Key interfaces / abstractions\nWe use an interface for the storage port.\n\n## Important interactions (sequence / flow)\nThe controller calls service then storage.\n\n## Extensibility & trade-offs\nThis design allows swapping storage later.\n\n## Edge cases & testability\nWe should validate invalid input and test failure paths.`,
      format: "STRUCTURED_TEXT",
      createdAt: new Date(),
    };

    const feedback = await new RuleBasedEvaluator().evaluate(submission as any, problem);

    expect(feedback.overallSummary).toContain("offline");
    expect(feedback.overallScore()).toBeGreaterThan(0);
    expect(feedback.criteria.length).toBe(8);
  });
});
