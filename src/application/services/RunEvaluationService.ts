import { DomainError } from "@/domain/errors";
import type { AttemptRepository } from "@/domain/repositories/AttemptRepository";
import type { EvaluationRepository } from "@/domain/repositories/EvaluationRepository";
import type { ProblemRepository } from "@/domain/repositories/ProblemRepository";
import type { SubmissionRepository } from "@/domain/repositories/SubmissionRepository";
import { EvaluationPipeline } from "@/domain/evaluation/EvaluationPipeline";

export class RunEvaluationService {
  constructor(
    private readonly pipeline: EvaluationPipeline,
    private readonly evaluations: EvaluationRepository,
    private readonly submissions: SubmissionRepository,
    private readonly attempts: AttemptRepository,
    private readonly problems: ProblemRepository,
  ) {}

  async execute(evaluationId: string) {
    const evaluation = await this.evaluations.findById(evaluationId);
    if (!evaluation) {
      throw new DomainError("Evaluation not found.", "EVALUATION_NOT_FOUND");
    }
    if (!evaluation.canStart()) {
      return evaluation;
    }

    const submission = await this.submissions.findById(evaluation.submissionId);
    if (!submission) {
      throw new DomainError("Submission not found.", "SUBMISSION_NOT_FOUND");
    }
    const attempt = await this.attempts.findById(submission.attemptId);
    if (!attempt) {
      throw new DomainError("Attempt not found.", "ATTEMPT_NOT_FOUND");
    }
    const problem = await this.problems.findById(attempt.problemId);
    if (!problem) {
      throw new DomainError("Problem not found.", "PROBLEM_NOT_FOUND");
    }

    return this.pipeline.run(evaluation, submission, problem);
  }
}

export class RetryEvaluationService {
  constructor(private readonly run: RunEvaluationService) {}

  async execute(evaluationId: string) {
    return this.run.execute(evaluationId);
  }
}
