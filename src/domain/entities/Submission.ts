import {
  SUBMISSION_FORMATS,
  type SubmissionFormat,
} from "../constants";

export type SubmissionData = {
  id: string;
  attemptId: string;
  content: string;
  format: SubmissionFormat;
  createdAt: Date;
};

export class Submission {
  constructor(private readonly data: SubmissionData) {}

  get id() {
    return this.data.id;
  }
  get attemptId() {
    return this.data.attemptId;
  }
  get content() {
    return this.data.content;
  }
  get format() {
    return this.data.format;
  }
  get createdAt() {
    return this.data.createdAt;
  }

  toJSON(): SubmissionData {
    return { ...this.data };
  }

  static structuredText(input: {
    id: string;
    attemptId: string;
    content: string;
    createdAt?: Date;
  }) {
    return new Submission({
      id: input.id,
      attemptId: input.attemptId,
      content: input.content,
      format: SUBMISSION_FORMATS.STRUCTURED_TEXT,
      createdAt: input.createdAt ?? new Date(),
    });
  }
}
