import type { Attempt } from "@/domain/entities/Attempt";
import type { AttemptRepository } from "@/domain/repositories/AttemptRepository";
import { prisma } from "./client";
import { toAttempt } from "./mappers";

export class PrismaAttemptRepository implements AttemptRepository {
  async create(attempt: Attempt): Promise<Attempt> {
    const data = attempt.toJSON();
    const row = await prisma.attempt.create({
      data: {
        id: data.id,
        problemId: data.problemId,
        learnerId: data.learnerId,
        status: data.status,
        startedAt: data.startedAt,
        submittedAt: data.submittedAt,
      },
    });
    return toAttempt(row);
  }

  async save(attempt: Attempt): Promise<Attempt> {
    const data = attempt.toJSON();
    const row = await prisma.attempt.update({
      where: { id: data.id },
      data: {
        status: data.status,
        submittedAt: data.submittedAt,
      },
    });
    return toAttempt(row);
  }

  async findById(id: string): Promise<Attempt | null> {
    const row = await prisma.attempt.findUnique({ where: { id } });
    return row ? toAttempt(row) : null;
  }

  async findByLearner(learnerId: string): Promise<Attempt[]> {
    const rows = await prisma.attempt.findMany({
      where: { learnerId },
      orderBy: { startedAt: "desc" },
    });
    return rows.map(toAttempt);
  }
}
