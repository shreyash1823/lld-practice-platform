import { Evaluation } from "../entities/Evaluation";
import type { Problem } from "../entities/Problem";
import type { Submission } from "../entities/Submission";
import type { EvaluationRepository } from "../repositories/EvaluationRepository";
import type { Evaluator } from "./Evaluator";
import type { SubmissionValidator } from "./StructuralValidator";

/**
 * Owns evaluation state transitions. Stores the submission first (caller),
 * then this pipeline advances PENDING → VALIDATING → EVALUATING → COMPLETED|FAILED.
 */
export class EvaluationPipeline {
  constructor(
    private readonly validator: SubmissionValidator,
    private readonly evaluator: Evaluator,
    private readonly evaluations: EvaluationRepository,
  ) {}

  async run(evaluation: Evaluation, submission: Submission, problem: Problem) {
    if (!evaluation.canStart()) {
      return evaluation;
    }

    evaluation.markValidating();
    await this.evaluations.save(evaluation);

    const structural = this.validator.validate(submission.content);
    if (!structural.ok) {
      evaluation.fail(
        structural.issues.map((i) => `${i.section}: ${i.message}`).join(" "),
      );
      await this.evaluations.save(evaluation);
      return evaluation;
    }

    evaluation.markEvaluating();
    await this.evaluations.save(evaluation);

    try {
      const feedback = await this.evaluator.evaluate(submission, problem);
      evaluation.complete(feedback);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown evaluator failure";
      evaluation.fail(message);
    }

    await this.evaluations.save(evaluation);
    return evaluation;
  }
}
