import { ATTEMPT_STATUS, type AttemptStatus } from "../constants";
import { DomainError } from "../errors";

export type AttemptData = {
  id: string;
  problemId: string;
  learnerId: string;
  status: AttemptStatus;
  startedAt: Date;
  submittedAt: Date | null;
};

export class Attempt {
  constructor(private data: AttemptData) {}

  get id() {
    return this.data.id;
  }
  get problemId() {
    return this.data.problemId;
  }
  get learnerId() {
    return this.data.learnerId;
  }
  get status() {
    return this.data.status;
  }
  get startedAt() {
    return this.data.startedAt;
  }
  get submittedAt() {
    return this.data.submittedAt;
  }

  belongsTo(learnerId: string) {
    return this.data.learnerId === learnerId;
  }

  canSubmit() {
    return this.data.status === ATTEMPT_STATUS.IN_PROGRESS;
  }

  markSubmitted(at: Date = new Date()) {
    if (!this.canSubmit()) {
      throw new DomainError(
        "Attempt is already submitted. Start a new attempt to try again.",
        "ALREADY_SUBMITTED",
      );
    }
    this.data.status = ATTEMPT_STATUS.SUBMITTED;
    this.data.submittedAt = at;
  }

  toJSON(): AttemptData {
    return { ...this.data };
  }
}
