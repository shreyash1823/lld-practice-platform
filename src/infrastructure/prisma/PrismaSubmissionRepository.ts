import type { Submission } from "@/domain/entities/Submission";
import type { SubmissionRepository } from "@/domain/repositories/SubmissionRepository";
import { prisma } from "./client";
import { toSubmission } from "./mappers";

export class PrismaSubmissionRepository implements SubmissionRepository {
  async create(submission: Submission): Promise<Submission> {
    const data = submission.toJSON();
    const row = await prisma.submission.create({
      data: {
        id: data.id,
        attemptId: data.attemptId,
        content: data.content,
        format: data.format,
        createdAt: data.createdAt,
      },
    });
    return toSubmission(row);
  }

  async findById(id: string): Promise<Submission | null> {
    const row = await prisma.submission.findUnique({ where: { id } });
    return row ? toSubmission(row) : null;
  }

  async findLatestByAttempt(attemptId: string): Promise<Submission | null> {
    const row = await prisma.submission.findFirst({
      where: { attemptId },
      orderBy: { createdAt: "desc" },
    });
    return row ? toSubmission(row) : null;
  }
}
