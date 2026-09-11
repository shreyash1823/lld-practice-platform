# Studio LLD

Studio LLD is a focused MVP for practicing Low-Level Design (LLD) problems and receiving structured, evidence-based feedback.

The platform lets a learner:

- Choose from curated LLD problems
- Write a structured design using seven guided sections
- Submit the design for evaluation
- Receive rubric-based feedback with evidence from the submission
- Retry failed evaluations
- Review previous attempts and scores

The project was intentionally designed as a small monolith for a 2-day implementation window. The focus is on the core practice and feedback loop rather than authentication, microservices, code execution, or a diagram editor.

## Demo

**Live Demo:** `https://lld-practice-platform-delta.vercel.app/`

**Repository:** `https://github.com/shreyash1823/lld-practice-platform`

---

## Tech Stack

- **Next.js 14** — App Router and application/API layer
- **TypeScript** — application and domain code
- **Prisma** — ORM and repository implementation
- **SQLite** — local development database
- **Turso / libSQL** — production SQLite-compatible database
- **OpenAI** — optional rubric-based AI evaluation
- **Zod** — validation of structured evaluator output
- **Vitest** — domain and service tests
- **Vercel** — production deployment

---

## Features

### LLD Practice

The platform currently contains five curated problems:

1. Parking Lot
2. Elevator System
3. Vending Machine
4. Library Management
5. In-Memory Cache (LRU)

Each problem contains:

- Problem statement
- Requirements
- Constraints
- Guiding questions
- Difficulty level

### Structured Design Submission

Instead of requiring code or a diagram editor, the learner submits a structured design containing seven sections:

1. Requirements understood
2. Assumptions
3. Core classes & responsibilities
4. Key interfaces / abstractions
5. Important interactions (sequence / flow)
6. Extensibility & trade-offs
7. Edge cases & testability

This keeps the MVP focused on LLD reasoning rather than implementation language or diagram tooling.

### Rubric-Based Evaluation

Submissions are evaluated against a fixed rubric rather than compared with one "correct" class diagram.

Feedback contains:

- Criterion score
- Evidence from the learner's submission
- Concern or gap
- Actionable suggestion
- Evaluator confidence

This allows multiple valid LLD solutions while still providing structured feedback.

### AI + Deterministic Fallback

OpenAI can be used for the rubric evaluation.

If an API key is unavailable or the AI evaluation fails, the platform falls back to a deterministic rule-based evaluator so that the core practice loop remains usable.

The UI explicitly indicates when offline rule-based evaluation was used.

### Attempt History

Each attempt is persisted and associated with a browser-based `learner_id` cookie.

The learner can review:

- Problem
- Attempt status
- Submission
- Evaluation score
- Previous attempts

Failed evaluations can be retried without submitting the design again.

---

## Practice Loop

The main workflow is:

```text
Choose Problem
      ↓
Start Attempt
      ↓
Write Structured Design
      ↓
Submit
      ↓
Persist Submission
      ↓
Validate Submission
      ↓
Evaluate
      ↓
Feedback
      ↓
Review Attempt History
      ↓
Retry / Improve
```
