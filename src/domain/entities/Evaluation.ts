import {
  EVALUATION_STATUS,
  RUBRIC_VERSION,
  type EvaluationStatus,
} from "../constants";
import { DomainError } from "../errors";
import { Feedback, type FeedbackData } from "./Feedback";

export type EvaluationData = {
  id: string;
  submissionId: string;
  status: EvaluationStatus;
  rubricVersion: string;
  errorMessage: string | null;
  feedback: FeedbackData | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
};

export class Evaluation {
  constructor(private data: EvaluationData) {}

  get id() {
    return this.data.id;
  }
  get submissionId() {
    return this.data.submissionId;
  }
  get status() {
    return this.data.status;
  }
  get rubricVersion() {
    return this.data.rubricVersion;
  }
  get errorMessage() {
    return this.data.errorMessage;
  }
  get feedback(): Feedback | null {
    return this.data.feedback ? new Feedback(this.data.feedback) : null;
  }
  get startedAt() {
    return this.data.startedAt;
  }
  get completedAt() {
    return this.data.completedAt;
  }
  get createdAt() {
    return this.data.createdAt;
  }

  isTerminal() {
    return (
      this.data.status === EVALUATION_STATUS.COMPLETED ||
      this.data.status === EVALUATION_STATUS.FAILED
    );
  }

  canStart() {
    return (
      this.data.status === EVALUATION_STATUS.PENDING ||
      this.data.status === EVALUATION_STATUS.FAILED
    );
  }

  canRetry() {
    return this.data.status === EVALUATION_STATUS.FAILED;
  }

  markValidating(at: Date = new Date()) {
    if (!this.canStart()) {
      throw new DomainError(
        `Cannot start evaluation from status ${this.data.status}`,
        "INVALID_EVALUATION_TRANSITION",
      );
    }
    this.data.status = EVALUATION_STATUS.VALIDATING;
    this.data.startedAt = at;
    this.data.errorMessage = null;
  }

  markEvaluating() {
    if (this.data.status !== EVALUATION_STATUS.VALIDATING) {
      throw new DomainError(
        `Cannot evaluate from status ${this.data.status}`,
        "INVALID_EVALUATION_TRANSITION",
      );
    }
    this.data.status = EVALUATION_STATUS.EVALUATING;
  }

  complete(feedback: Feedback, at: Date = new Date()) {
    if (this.data.status !== EVALUATION_STATUS.EVALUATING) {
      throw new DomainError(
        `Cannot complete from status ${this.data.status}`,
        "INVALID_EVALUATION_TRANSITION",
      );
    }
    this.data.status = EVALUATION_STATUS.COMPLETED;
    this.data.feedback = feedback.toJSON();
    this.data.completedAt = at;
    this.data.errorMessage = null;
  }

  fail(message: string, at: Date = new Date()) {
    this.data.status = EVALUATION_STATUS.FAILED;
    this.data.errorMessage = message;
    this.data.completedAt = at;
  }

  toJSON(): EvaluationData {
    return {
      ...this.data,
      feedback: this.data.feedback
        ? { ...this.data.feedback, criteria: [...this.data.feedback.criteria] }
        : null,
    };
  }

  static pending(input: { id: string; submissionId: string; createdAt?: Date }) {
    return new Evaluation({
      id: input.id,
      submissionId: input.submissionId,
      status: EVALUATION_STATUS.PENDING,
      rubricVersion: RUBRIC_VERSION,
      errorMessage: null,
      feedback: null,
      startedAt: null,
      completedAt: null,
      createdAt: input.createdAt ?? new Date(),
    });
  }
}
