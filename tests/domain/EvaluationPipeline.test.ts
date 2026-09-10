import { describe, expect, it, vi } from "vitest";
import { Evaluation } from "@/domain/entities/Evaluation";
import { Feedback } from "@/domain/entities/Feedback";
import { EvaluationPipeline } from "@/domain/evaluation/EvaluationPipeline";
import type { Evaluator } from "@/domain/evaluation/Evaluator";
import { StructuralValidator } from "@/domain/evaluation/StructuralValidator";
import { RUBRIC_CRITERIA } from "@/domain/constants";
import {
  InMemoryEvaluations,
  sampleProblem,
  structuredSubmission,
  validDesign,
} from "../helpers";

function feedback() {
  return new Feedback({
    criteria: RUBRIC_CRITERIA.map((c) => ({
      name: c.name,
      score: 5,
      evidence: "Strong ownership language in the submission.",
      concern: "None major.",
      suggestion: "Keep the finder as a strategy object.",
      confidence: "high" as const,
    })),
    overallSummary: "Clear parking-lot design with a replaceable search policy.",
    strengths: ["SpotFinder port"],
    improvements: ["Document occupy atomicity"],
  });
}

describe("EvaluationPipeline", () => {
  it("completes when the LLM returns feedback", async () => {
    const evaluations = new InMemoryEvaluations();
    const evaluator: Evaluator = {
      evaluate: vi.fn(async () => feedback()),
    };
    const pipeline = new EvaluationPipeline(
      new StructuralValidator(),
      evaluator,
      evaluations,
    );
    const evaluation = Evaluation.pending({ id: "ev-1", submissionId: "sub-1" });
    await evaluations.create(evaluation);

    const result = await pipeline.run(
      evaluation,
      structuredSubmission(validDesign()),
      sampleProblem(),
    );

    expect(result.status).toBe("COMPLETED");
    expect(evaluator.evaluate).toHaveBeenCalledOnce();
  });

  it("marks FAILED when the LLM returns garbage, without losing the submission", async () => {
    const evaluations = new InMemoryEvaluations();
    const evaluator: Evaluator = {
      evaluate: async () => {
        throw new Error("Malformed evaluator JSON");
      },
    };
    const pipeline = new EvaluationPipeline(
      new StructuralValidator(),
      evaluator,
      evaluations,
    );
    const evaluation = Evaluation.pending({ id: "ev-1", submissionId: "sub-1" });
    await evaluations.create(evaluation);

    const result = await pipeline.run(
      evaluation,
      structuredSubmission(validDesign()),
      sampleProblem(),
    );

    expect(result.status).toBe("FAILED");
    expect(result.errorMessage).toMatch(/Malformed/);
    const stored = await evaluations.findById("ev-1");
    expect(stored?.status).toBe("FAILED");
  });

  it("does not invoke the LLM if evaluation is already completed", async () => {
    const evaluations = new InMemoryEvaluations();
    const evaluate = vi.fn();
    const pipeline = new EvaluationPipeline(
      new StructuralValidator(),
      { evaluate },
      evaluations,
    );
    const evaluation = Evaluation.pending({ id: "ev-1", submissionId: "sub-1" });
    evaluation.markValidating();
    evaluation.markEvaluating();
    evaluation.complete(feedback());
    await evaluations.create(evaluation);

    await pipeline.run(
      evaluation,
      structuredSubmission(validDesign()),
      sampleProblem(),
    );
    expect(evaluate).not.toHaveBeenCalled();
  });
});
