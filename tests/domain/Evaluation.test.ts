import { describe, expect, it } from "vitest";
import { EVALUATION_STATUS } from "@/domain/constants";
import { Evaluation } from "@/domain/entities/Evaluation";
import { Feedback } from "@/domain/entities/Feedback";
import { DomainError } from "@/domain/errors";
import { RUBRIC_CRITERIA } from "@/domain/constants";

function pending() {
  return Evaluation.pending({ id: "ev-1", submissionId: "sub-1" });
}

function sampleFeedback() {
  return new Feedback({
    criteria: RUBRIC_CRITERIA.map((c) => ({
      name: c.name,
      score: 4,
      evidence: "Named ParkingLot and SpotFinder.",
      concern: "Finder could be more explicit.",
      suggestion: "Show how floors ask the finder for a spot.",
      confidence: "high" as const,
    })),
    overallSummary: "A workable parking-lot sketch with a replaceable finder.",
    strengths: ["Clear ticket vs lot split"],
    improvements: ["Spell out concurrency on occupy()"],
  });
}

describe("Evaluation state machine", () => {
  it("walks PENDING to COMPLETED", () => {
    const evaluation = pending();
    evaluation.markValidating();
    expect(evaluation.status).toBe(EVALUATION_STATUS.VALIDATING);
    evaluation.markEvaluating();
    evaluation.complete(sampleFeedback());
    expect(evaluation.status).toBe(EVALUATION_STATUS.COMPLETED);
    expect(evaluation.feedback?.overallScore()).toBe(4);
    expect(evaluation.isTerminal()).toBe(true);
    expect(evaluation.canStart()).toBe(false);
  });

  it("can fail from evaluating and later restart", () => {
    const evaluation = pending();
    evaluation.markValidating();
    evaluation.markEvaluating();
    evaluation.fail("timeout");
    expect(evaluation.status).toBe(EVALUATION_STATUS.FAILED);
    expect(evaluation.canRetry()).toBe(true);
    evaluation.markValidating();
    expect(evaluation.status).toBe(EVALUATION_STATUS.VALIDATING);
  });

  it("refuses to evaluate before validating", () => {
    const evaluation = pending();
    expect(() => evaluation.markEvaluating()).toThrow(DomainError);
  });

  it("does not start twice while already evaluating", () => {
    const evaluation = pending();
    evaluation.markValidating();
    evaluation.markEvaluating();
    expect(evaluation.canStart()).toBe(false);
  });
});
