import type { Problem } from "@/domain/entities/Problem";
import type { ProblemRepository } from "@/domain/repositories/ProblemRepository";
import { prisma } from "./client";
import { toProblem } from "./mappers";

export class PrismaProblemRepository implements ProblemRepository {
  async findAll(): Promise<Problem[]> {
    const rows = await prisma.problem.findMany({ orderBy: { title: "asc" } });
    return rows.map(toProblem);
  }

  async findById(id: string): Promise<Problem | null> {
    const row = await prisma.problem.findUnique({ where: { id } });
    return row ? toProblem(row) : null;
  }

  async findBySlug(slug: string): Promise<Problem | null> {
    const row = await prisma.problem.findUnique({ where: { slug } });
    return row ? toProblem(row) : null;
  }
}
