import type { Problem } from "../entities/Problem";
import type { Submission } from "../entities/Submission";
import type { Feedback } from "../entities/Feedback";

/**
 * Judgment-heavy evaluation. Implementations may call an LLM, a rule engine,
 * or a human review queue. The practice flow depends only on this contract.
 */
export interface Evaluator {
  evaluate(submission: Submission, problem: Problem): Promise<Feedback>;
}
