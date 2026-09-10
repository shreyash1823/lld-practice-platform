import type { Evaluation } from "@/domain/entities/Evaluation";
import type { EvaluationRepository } from "@/domain/repositories/EvaluationRepository";
import { prisma } from "./client";
import { evaluationToRow, toEvaluation } from "./mappers";

export class PrismaEvaluationRepository implements EvaluationRepository {
  async create(evaluation: Evaluation): Promise<Evaluation> {
    const row = await prisma.evaluation.create({
      data: evaluationToRow(evaluation),
    });
    return toEvaluation(row);
  }

  async save(evaluation: Evaluation): Promise<Evaluation> {
    const data = evaluationToRow(evaluation);
    const row = await prisma.evaluation.update({
      where: { id: data.id },
      data: {
        status: data.status,
        rubricVersion: data.rubricVersion,
        errorMessage: data.errorMessage,
        feedbackJson: data.feedbackJson,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
      },
    });
    return toEvaluation(row);
  }

  async findById(id: string): Promise<Evaluation | null> {
    const row = await prisma.evaluation.findUnique({ where: { id } });
    return row ? toEvaluation(row) : null;
  }

  async findBySubmissionId(submissionId: string): Promise<Evaluation | null> {
    const row = await prisma.evaluation.findUnique({
      where: { submissionId },
    });
    return row ? toEvaluation(row) : null;
  }
}
