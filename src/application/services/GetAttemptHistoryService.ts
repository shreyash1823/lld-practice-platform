import { DomainError } from "@/domain/errors";
import type { AttemptRepository } from "@/domain/repositories/AttemptRepository";
import type { EvaluationRepository } from "@/domain/repositories/EvaluationRepository";
import type { ProblemRepository } from "@/domain/repositories/ProblemRepository";
import type { SubmissionRepository } from "@/domain/repositories/SubmissionRepository";

export class GetAttemptHistoryService {
  constructor(
    private readonly attempts: AttemptRepository,
    private readonly problems: ProblemRepository,
    private readonly submissions: SubmissionRepository,
    private readonly evaluations: EvaluationRepository,
  ) {}

  async execute(learnerId: string) {
    const attempts = await this.attempts.findByLearner(learnerId);
    const items = [];

    for (const attempt of attempts) {
      const problem = await this.problems.findById(attempt.problemId);
      const submission = await this.submissions.findLatestByAttempt(attempt.id);
      const evaluation = submission
        ? await this.evaluations.findBySubmissionId(submission.id)
        : null;
      items.push({
        attemptId: attempt.id,
        problemTitle: problem?.title ?? "Unknown problem",
        problemSlug: problem?.slug ?? "",
        status: attempt.status,
        startedAt: attempt.startedAt.toISOString(),
        submittedAt: attempt.submittedAt?.toISOString() ?? null,
        evaluationStatus: evaluation?.status ?? null,
        overallScore: evaluation?.feedback?.overallScore() ?? null,
      });
    }

    return items;
  }
}

export class GetAttemptDetailService {
  constructor(
    private readonly attempts: AttemptRepository,
    private readonly problems: ProblemRepository,
    private readonly submissions: SubmissionRepository,
    private readonly evaluations: EvaluationRepository,
  ) {}

  async execute(attemptId: string, learnerId: string) {
    const attempt = await this.attempts.findById(attemptId);
    if (!attempt) {
      throw new DomainError("Attempt not found.", "ATTEMPT_NOT_FOUND");
    }
    if (!attempt.belongsTo(learnerId)) {
      throw new DomainError("Attempt does not belong to this learner.", "FORBIDDEN");
    }
    const problem = await this.problems.findById(attempt.problemId);
    if (!problem) {
      throw new DomainError("Problem not found.", "PROBLEM_NOT_FOUND");
    }
    const submission = await this.submissions.findLatestByAttempt(attempt.id);
    const evaluation = submission
      ? await this.evaluations.findBySubmissionId(submission.id)
      : null;

    return {
      attempt: attempt.toJSON(),
      problem: problem.toJSON(),
      submission: submission?.toJSON() ?? null,
      evaluation: evaluation
        ? {
            ...evaluation.toJSON(),
            overallScore: evaluation.feedback?.overallScore() ?? null,
          }
        : null,
    };
  }
}

export class GetEvaluationService {
  constructor(
    private readonly evaluations: EvaluationRepository,
    private readonly submissions: SubmissionRepository,
    private readonly attempts: AttemptRepository,
  ) {}

  async execute(evaluationId: string, learnerId: string) {
    const evaluation = await this.evaluations.findById(evaluationId);
    if (!evaluation) {
      throw new DomainError("Evaluation not found.", "EVALUATION_NOT_FOUND");
    }
    const submission = await this.submissions.findById(evaluation.submissionId);
    if (!submission) {
      throw new DomainError("Submission not found.", "SUBMISSION_NOT_FOUND");
    }
    const attempt = await this.attempts.findById(submission.attemptId);
    if (!attempt || !attempt.belongsTo(learnerId)) {
      throw new DomainError("Evaluation does not belong to this learner.", "FORBIDDEN");
    }
    return {
      ...evaluation.toJSON(),
      overallScore: evaluation.feedback?.overallScore() ?? null,
    };
  }
}
