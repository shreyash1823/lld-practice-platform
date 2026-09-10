/** Required markdown headings for a structured LLD submission. */
export const REQUIRED_SECTIONS = [
  "Requirements understood",
  "Assumptions",
  "Core classes & responsibilities",
  "Key interfaces / abstractions",
  "Important interactions (sequence / flow)",
  "Extensibility & trade-offs",
  "Edge cases & testability",
] as const;

export type RequiredSection = (typeof REQUIRED_SECTIONS)[number];

export const SUBMISSION_FORMATS = {
  STRUCTURED_TEXT: "STRUCTURED_TEXT",
  CODE: "CODE",
  DIAGRAM: "DIAGRAM",
} as const;

export type SubmissionFormat =
  (typeof SUBMISSION_FORMATS)[keyof typeof SUBMISSION_FORMATS];

export const ATTEMPT_STATUS = {
  IN_PROGRESS: "IN_PROGRESS",
  SUBMITTED: "SUBMITTED",
} as const;

export type AttemptStatus =
  (typeof ATTEMPT_STATUS)[keyof typeof ATTEMPT_STATUS];

export const EVALUATION_STATUS = {
  PENDING: "PENDING",
  VALIDATING: "VALIDATING",
  EVALUATING: "EVALUATING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export type EvaluationStatus =
  (typeof EVALUATION_STATUS)[keyof typeof EVALUATION_STATUS];

export const RUBRIC_VERSION = "v1";

export const RUBRIC_CRITERIA = [
  {
    name: "Requirement understanding",
    weight: 1,
    description: "Did the learner capture scope, constraints, and missing requirements as assumptions?",
  },
  {
    name: "Class responsibilities",
    weight: 1,
    description: "Are classes cohesive with a single clear owner for each responsibility?",
  },
  {
    name: "Coupling / cohesion",
    weight: 1,
    description: "Are dependencies pointed the right way, with modules that change together kept together?",
  },
  {
    name: "Encapsulation & interfaces",
    weight: 1,
    description: "Are internals hidden behind stable interfaces rather than leaking concrete types?",
  },
  {
    name: "Patterns & abstraction",
    weight: 1,
    description: "Are patterns used only when they earn their complexity, and abstractions named after the domain?",
  },
  {
    name: "Extensibility",
    weight: 1,
    description: "Can a realistic requirement change land without rewriting the core?",
  },
  {
    name: "Edge cases & testability",
    weight: 1,
    description: "Are failure modes named and is the design observable enough to test?",
  },
  {
    name: "Explanation quality",
    weight: 1,
    description: "Is the reasoning specific, evidence-based, and free of vague pattern-dropping?",
  },
] as const;

export const MIN_SECTION_CHARS = 20;
