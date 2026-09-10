import type { Evaluation } from "../entities/Evaluation";

export interface EvaluationRepository {
  create(evaluation: Evaluation): Promise<Evaluation>;
  save(evaluation: Evaluation): Promise<Evaluation>;
  findById(id: string): Promise<Evaluation | null>;
  findBySubmissionId(submissionId: string): Promise<Evaluation | null>;
}
