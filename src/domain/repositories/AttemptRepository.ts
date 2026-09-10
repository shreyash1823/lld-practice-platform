import type { Attempt } from "../entities/Attempt";

export interface AttemptRepository {
  create(attempt: Attempt): Promise<Attempt>;
  save(attempt: Attempt): Promise<Attempt>;
  findById(id: string): Promise<Attempt | null>;
  findByLearner(learnerId: string): Promise<Attempt[]>;
}
