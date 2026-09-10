import type { Submission } from "../entities/Submission";

export interface SubmissionRepository {
  create(submission: Submission): Promise<Submission>;
  findById(id: string): Promise<Submission | null>;
  findLatestByAttempt(attemptId: string): Promise<Submission | null>;
}
