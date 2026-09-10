import { randomUUID } from "crypto";
import { ATTEMPT_STATUS } from "@/domain/constants";
import { Attempt } from "@/domain/entities/Attempt";
import { DomainError } from "@/domain/errors";
import type { AttemptRepository } from "@/domain/repositories/AttemptRepository";
import type { ProblemRepository } from "@/domain/repositories/ProblemRepository";

export class StartAttemptService {
  constructor(
    private readonly problems: ProblemRepository,
    private readonly attempts: AttemptRepository,
  ) {}

  async execute(input: { problemSlug: string; learnerId: string }) {
    const problem = await this.problems.findBySlug(input.problemSlug);
    if (!problem) {
      throw new DomainError("Problem not found.", "PROBLEM_NOT_FOUND");
    }

    const attempt = new Attempt({
      id: randomUUID(),
      problemId: problem.id,
      learnerId: input.learnerId,
      status: ATTEMPT_STATUS.IN_PROGRESS,
      startedAt: new Date(),
      submittedAt: null,
    });

    const saved = await this.attempts.create(attempt);
    return { attempt: saved, problem };
  }
}
