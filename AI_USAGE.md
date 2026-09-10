# AI usage

Five decisions where a model was in the loop, and what I kept.

## 1. Stack: Next.js monolith vs Spring + React

**Suggested:** A Java/Spring domain model “looks more LLD,” or a split Express API + SPA.

**Chose:** Next.js + TypeScript + Prisma + SQLite. The assignment grades a working practice loop and domain boundaries, not framework pedigree. One process keeps Day 1 on the loop instead of CORS and two package trees. Domain classes still live under `src/domain` with no Next imports.

## 2. Submission format: code + UML vs structured text

**Suggested:** Support code upload and a mermaid editor so the artifact “looks like LLD.”

**Rejected for MVP.** Code implies a language, a runner, and a fake compile bar. A diagram editor is a product by itself. Structured markdown with seven headings is enough evidence for a rubric and lets `StructuralValidator` stay deterministic. Optional mermaid fences are checked, not edited.

## 3. Scoring: 100-point overall vs rubric rows with evidence

**Suggested:** “Ask the model to score 0–100 and list improvements.”

**Rejected.** That is the unconstrained prompt the assignment warns about. I kept a fixed 8-criterion JSON contract (`score`, `evidence`, `concern`, `suggestion`, `confidence`) and parse it with zod. Multiple valid designs are allowed because we never match a gold class list.

## 4. Async evaluation: queue vs in-process

**Suggested:** Redis/Bull or a separate worker “because AI is slow.”

**Rejected for two days.** Submit still persists first and returns 202; the Node process continues the pipeline. DESIGN.md names **EvaluationWorker** as the first extract. That satisfies the failure/latency question without a distributed-systems detour.

## 5. Prompt: free-form coach vs schema + low temperature

**Suggested:** A long system prompt that “acts as a staff engineer.”

**Kept only the parts that constrain output.** The prompt restates the problem, the rubric, and “quote evidence, do not invent classes.” `temperature: 0.2` and `response_format: json_object`. Tests cover malformed JSON → `FAILED`. I did not let the model invent extra criteria.

Cursor also scaffolded boilerplate (Prisma mappers, page shells). I rewrote domain state machines and validators by hand so transitions and error codes stay explicit.
