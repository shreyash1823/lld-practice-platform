import { randomUUID } from "crypto";
import { Evaluation } from "@/domain/entities/Evaluation";
import { Submission } from "@/domain/entities/Submission";
import { DomainError } from "@/domain/errors";
import type { SubmissionValidator } from "@/domain/evaluation/StructuralValidator";
import type { AttemptRepository } from "@/domain/repositories/AttemptRepository";
import type { EvaluationRepository } from "@/domain/repositories/EvaluationRepository";
import type { SubmissionRepository } from "@/domain/repositories/SubmissionRepository";

export type SubmitResult = {
  attemptId: string;
  submissionId: string;
  evaluationId: string;
  alreadySubmitted: boolean;
};

export class SubmitSolutionService {
  constructor(
    private readonly attempts: AttemptRepository,
    private readonly submissions: SubmissionRepository,
    private readonly evaluations: EvaluationRepository,
    private readonly validator: SubmissionValidator,
  ) {}

  async execute(input: {
    attemptId: string;
    learnerId: string;
    content: string;
  }): Promise<SubmitResult> {
    const attempt = await this.attempts.findById(input.attemptId);
    if (!attempt) {
      throw new DomainError("Attempt not found.", "ATTEMPT_NOT_FOUND");
    }
    if (!attempt.belongsTo(input.learnerId)) {
      throw new DomainError("Attempt does not belong to this learner.", "FORBIDDEN");
    }

    if (!attempt.canSubmit()) {
      const existing = await this.submissions.findLatestByAttempt(attempt.id);
      const evaluation = existing
        ? await this.evaluations.findBySubmissionId(existing.id)
        : null;
      if (existing && evaluation) {
        return {
          attemptId: attempt.id,
          submissionId: existing.id,
          evaluationId: evaluation.id,
          alreadySubmitted: true,
        };
      }
      throw new DomainError("Attempt is already submitted.", "ALREADY_SUBMITTED");
    }

    const structural = this.validator.validate(input.content);
    if (!structural.ok) {
      throw new DomainError(
        structural.issues.map((i) => i.message).join(" "),
        "INVALID_SUBMISSION",
      );
    }

    const submission = Submission.structuredText({
      id: randomUUID(),
      attemptId: attempt.id,
      content: input.content,
    });
    await this.submissions.create(submission);

    attempt.markSubmitted();
    await this.attempts.save(attempt);

    const evaluation = Evaluation.pending({
      id: randomUUID(),
      submissionId: submission.id,
    });
    await this.evaluations.create(evaluation);

    return {
      attemptId: attempt.id,
      submissionId: submission.id,
      evaluationId: evaluation.id,
      alreadySubmitted: false,
    };
  }
}
