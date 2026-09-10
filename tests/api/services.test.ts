import { describe, expect, it } from "vitest";
import { SubmitSolutionService } from "@/application/services/SubmitSolutionService";
import { StartAttemptService } from "@/application/services/StartAttemptService";
import { GetAttemptHistoryService } from "@/application/services/GetAttemptHistoryService";
import { RunEvaluationService } from "@/application/services/RunEvaluationService";
import { EvaluationPipeline } from "@/domain/evaluation/EvaluationPipeline";
import { StructuralValidator } from "@/domain/evaluation/StructuralValidator";
import { DomainError } from "@/domain/errors";
import { Feedback } from "@/domain/entities/Feedback";
import { RUBRIC_CRITERIA } from "@/domain/constants";
import {
  InMemoryAttempts,
  InMemoryEvaluations,
  InMemoryProblems,
  InMemorySubmissions,
  sampleProblem,
  validDesign,
} from "../helpers";

function feedback() {
  return new Feedback({
    criteria: RUBRIC_CRITERIA.map((c) => ({
      name: c.name,
      score: 4,
      evidence: "Quoted classes from the write-up.",
      concern: "Could be sharper on locking.",
      suggestion: "Name the mutex or actor that owns occupy.",
      confidence: "medium" as const,
    })),
    overallSummary: "Solid enough to iterate on in a second attempt.",
    strengths: ["FeePolicy port"],
    improvements: ["Concurrent occupy"],
  });
}

function harness(evaluatorImpl?: { evaluate: () => Promise<Feedback> }) {
  const problems = new InMemoryProblems([sampleProblem()]);
  const attempts = new InMemoryAttempts();
  const submissions = new InMemorySubmissions();
  const evaluations = new InMemoryEvaluations();
  const validator = new StructuralValidator();
  const submit = new SubmitSolutionService(
    attempts,
    submissions,
    evaluations,
    validator,
  );
  const start = new StartAttemptService(problems, attempts);
  const pipeline = new EvaluationPipeline(
    validator,
    {
      evaluate: evaluatorImpl?.evaluate ?? (async () => feedback()),
    },
    evaluations,
  );
  const run = new RunEvaluationService(
    pipeline,
    evaluations,
    submissions,
    attempts,
    problems,
  );
  const history = new GetAttemptHistoryService(
    attempts,
    problems,
    submissions,
    evaluations,
  );
  return { problems, attempts, submissions, evaluations, submit, start, run, history };
}

describe("SubmitSolutionService", () => {
  it("persists the submission before evaluation is created", async () => {
    const { start, submit, submissions, evaluations } = harness();
    const { attempt } = await start.execute({
      problemSlug: "parking-lot",
      learnerId: "learner-a",
    });
    const result = await submit.execute({
      attemptId: attempt.id,
      learnerId: "learner-a",
      content: validDesign(),
    });
    expect(submissions.created).toHaveLength(1);
    expect(result.submissionId).toBe(submissions.created[0].id);
    const evaluation = await evaluations.findById(result.evaluationId);
    expect(evaluation?.status).toBe("PENDING");
  });

  it("rejects invalid content without creating a submission", async () => {
    const { start, submit, submissions } = harness();
    const { attempt } = await start.execute({
      problemSlug: "parking-lot",
      learnerId: "learner-a",
    });
    await expect(
      submit.execute({
        attemptId: attempt.id,
        learnerId: "learner-a",
        content: "not a design",
      }),
    ).rejects.toMatchObject({ code: "INVALID_SUBMISSION" } satisfies Partial<DomainError>);
    expect(submissions.created).toHaveLength(0);
  });

  it("returns the existing evaluation on duplicate submit instead of creating another", async () => {
    const { start, submit } = harness();
    const { attempt } = await start.execute({
      problemSlug: "parking-lot",
      learnerId: "learner-a",
    });
    const first = await submit.execute({
      attemptId: attempt.id,
      learnerId: "learner-a",
      content: validDesign(),
    });
    const second = await submit.execute({
      attemptId: attempt.id,
      learnerId: "learner-a",
      content: validDesign(),
    });
    expect(second.alreadySubmitted).toBe(true);
    expect(second.evaluationId).toBe(first.evaluationId);
  });

  it("forbids another learner from submitting", async () => {
    const { start, submit } = harness();
    const { attempt } = await start.execute({
      problemSlug: "parking-lot",
      learnerId: "learner-a",
    });
    await expect(
      submit.execute({
        attemptId: attempt.id,
        learnerId: "learner-b",
        content: validDesign(),
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("RunEvaluationService + history", () => {
  it("stores parsed AI feedback on the evaluation", async () => {
    const { start, submit, run } = harness();
    const { attempt } = await start.execute({
      problemSlug: "parking-lot",
      learnerId: "learner-a",
    });
    const { evaluationId } = await submit.execute({
      attemptId: attempt.id,
      learnerId: "learner-a",
      content: validDesign(),
    });
    const evaluation = await run.execute(evaluationId);
    expect(evaluation.status).toBe("COMPLETED");
    expect(evaluation.feedback?.overallScore()).toBe(4);
  });

  it("history only includes the current learner", async () => {
    const { start, submit, history } = harness();
    const a = await start.execute({
      problemSlug: "parking-lot",
      learnerId: "learner-a",
    });
    await start.execute({ problemSlug: "parking-lot", learnerId: "learner-b" });
    await submit.execute({
      attemptId: a.attempt.id,
      learnerId: "learner-a",
      content: validDesign(),
    });
    const items = await history.execute("learner-a");
    expect(items).toHaveLength(1);
    expect(items[0].attemptId).toBe(a.attempt.id);
  });
});
