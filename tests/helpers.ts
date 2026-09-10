import { ATTEMPT_STATUS, type AttemptStatus, type EvaluationStatus, type SubmissionFormat } from "@/domain/constants";
import { Attempt } from "@/domain/entities/Attempt";
import { Evaluation } from "@/domain/entities/Evaluation";
import type { FeedbackData } from "@/domain/entities/Feedback";
import { Problem, type ProblemData } from "@/domain/entities/Problem";
import { Submission } from "@/domain/entities/Submission";
import type { AttemptRepository } from "@/domain/repositories/AttemptRepository";
import type { EvaluationRepository } from "@/domain/repositories/EvaluationRepository";
import type { ProblemRepository } from "@/domain/repositories/ProblemRepository";
import type { SubmissionRepository } from "@/domain/repositories/SubmissionRepository";

export function sampleProblem(overrides: Partial<ProblemData> = {}) {
  return new Problem({
    id: "prob_parking",
    slug: "parking-lot",
    title: "Parking Lot",
    difficulty: "Beginner",
    prompt: "Design a parking lot.",
    requirements: ["Multiple floors"],
    constraints: ["In-memory is fine"],
    guidingQuestions: ["Who owns tickets?"],
    ...overrides,
  });
}

export class InMemoryProblems implements ProblemRepository {
  constructor(private items: Problem[] = []) {}
  async findAll() {
    return this.items;
  }
  async findById(id: string) {
    return this.items.find((p) => p.id === id) ?? null;
  }
  async findBySlug(slug: string) {
    return this.items.find((p) => p.slug === slug) ?? null;
  }
}

export class InMemoryAttempts implements AttemptRepository {
  private items: Attempt[] = [];
  async create(attempt: Attempt) {
    this.items.push(cloneAttempt(attempt));
    return attempt;
  }
  async save(attempt: Attempt) {
    this.items = this.items.map((a) => (a.id === attempt.id ? cloneAttempt(attempt) : a));
    return attempt;
  }
  async findById(id: string) {
    const found = this.items.find((a) => a.id === id);
    return found ? cloneAttempt(found) : null;
  }
  async findByLearner(learnerId: string) {
    return this.items.filter((a) => a.learnerId === learnerId).map(cloneAttempt);
  }
}

export class InMemorySubmissions implements SubmissionRepository {
  private items: Submission[] = [];
  created: Submission[] = [];
  async create(submission: Submission) {
    this.items.push(submission);
    this.created.push(submission);
    return submission;
  }
  async findById(id: string) {
    return this.items.find((s) => s.id === id) ?? null;
  }
  async findLatestByAttempt(attemptId: string) {
    return [...this.items].reverse().find((s) => s.attemptId === attemptId) ?? null;
  }
}

export class InMemoryEvaluations implements EvaluationRepository {
  private items: Evaluation[] = [];
  async create(evaluation: Evaluation) {
    this.items.push(cloneEvaluation(evaluation));
    return evaluation;
  }
  async save(evaluation: Evaluation) {
    this.items = this.items.map((e) =>
      e.id === evaluation.id ? cloneEvaluation(evaluation) : e,
    );
    return evaluation;
  }
  async findById(id: string) {
    const found = this.items.find((e) => e.id === id);
    return found ? cloneEvaluation(found) : null;
  }
  async findBySubmissionId(submissionId: string) {
    const found = this.items.find((e) => e.submissionId === submissionId);
    return found ? cloneEvaluation(found) : null;
  }
}

function cloneAttempt(attempt: Attempt) {
  const data = attempt.toJSON();
  return new Attempt({
    ...data,
    status: data.status as AttemptStatus,
    startedAt: new Date(data.startedAt),
    submittedAt: data.submittedAt,
  });
}

function cloneEvaluation(evaluation: Evaluation) {
  const data = evaluation.toJSON();
  return new Evaluation({
    ...data,
    status: data.status as EvaluationStatus,
    feedback: data.feedback as FeedbackData | null,
    startedAt: data.startedAt,
    completedAt: data.completedAt,
    createdAt: data.createdAt,
  });
}

export function validDesign(): string {
  return [
    "## Requirements understood",
    "Need multi-floor parking for bikes, cars, buses, tickets, and fees.",
    "## Assumptions",
    "In-memory maps are enough; one entrance; hourly billing starts as a strategy.",
    "## Core classes & responsibilities",
    "ParkingLot coordinates floors. Floor owns spots. TicketService issues tickets. FeeCalculator computes charge.",
    "## Key interfaces / abstractions",
    "SpotFinder and FeePolicy are interfaces so search and pricing can change independently.",
    "## Important interactions (sequence / flow)",
    "Enter -> find spot -> occupy -> ticket. Exit -> lookup ticket -> fee -> free spot.",
    "## Extensibility & trade-offs",
    "New vehicle types add a size enum plus finder rule, not a new lot class. Pricing is a strategy.",
    "## Edge cases & testability",
    "Lot full, bus needing consecutive spots, double exit, concurrent entry. Ports allow fake clocks.",
  ].join("\n\n");
}

export function inProgressAttempt(learnerId = "learner-1") {
  return new Attempt({
    id: "att-1",
    problemId: "prob_parking",
    learnerId,
    status: ATTEMPT_STATUS.IN_PROGRESS,
    startedAt: new Date("2026-01-01"),
    submittedAt: null,
  });
}

export function submittedAttempt(learnerId = "learner-1") {
  return new Attempt({
    id: "att-1",
    problemId: "prob_parking",
    learnerId,
    status: ATTEMPT_STATUS.SUBMITTED,
    startedAt: new Date("2026-01-01"),
    submittedAt: new Date("2026-01-02"),
  });
}

export function structuredSubmission(content: string) {
  return Submission.structuredText({
    id: "sub-1",
    attemptId: "att-1",
    content,
  });
}

export type { SubmissionFormat };
