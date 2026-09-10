import type { Attempt as AttemptRow, Evaluation as EvaluationRow, Problem as ProblemRow, Submission as SubmissionRow } from "@prisma/client";
import { Attempt } from "@/domain/entities/Attempt";
import { Evaluation } from "@/domain/entities/Evaluation";
import type { FeedbackData } from "@/domain/entities/Feedback";
import { Problem } from "@/domain/entities/Problem";
import { Submission } from "@/domain/entities/Submission";
import type { AttemptStatus, EvaluationStatus, SubmissionFormat } from "@/domain/constants";

export function toProblem(row: ProblemRow): Problem {
  return new Problem({
    id: row.id,
    slug: row.slug,
    title: row.title,
    difficulty: row.difficulty as Problem["difficulty"],
    prompt: row.prompt,
    requirements: JSON.parse(row.requirementsJson) as string[],
    constraints: JSON.parse(row.constraintsJson) as string[],
    guidingQuestions: JSON.parse(row.questionsJson) as string[],
  });
}

export function toAttempt(row: AttemptRow): Attempt {
  return new Attempt({
    id: row.id,
    problemId: row.problemId,
    learnerId: row.learnerId,
    status: row.status as AttemptStatus,
    startedAt: row.startedAt,
    submittedAt: row.submittedAt,
  });
}

export function toSubmission(row: SubmissionRow): Submission {
  return new Submission({
    id: row.id,
    attemptId: row.attemptId,
    content: row.content,
    format: row.format as SubmissionFormat,
    createdAt: row.createdAt,
  });
}

export function toEvaluation(row: EvaluationRow): Evaluation {
  return new Evaluation({
    id: row.id,
    submissionId: row.submissionId,
    status: row.status as EvaluationStatus,
    rubricVersion: row.rubricVersion,
    errorMessage: row.errorMessage,
    feedback: row.feedbackJson
      ? (JSON.parse(row.feedbackJson) as FeedbackData)
      : null,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    createdAt: row.createdAt,
  });
}

export function evaluationToRow(evaluation: Evaluation) {
  const json = evaluation.toJSON();
  return {
    id: json.id,
    submissionId: json.submissionId,
    status: json.status,
    rubricVersion: json.rubricVersion,
    errorMessage: json.errorMessage,
    feedbackJson: json.feedback ? JSON.stringify(json.feedback) : null,
    startedAt: json.startedAt,
    completedAt: json.completedAt,
    createdAt: json.createdAt,
  };
}
