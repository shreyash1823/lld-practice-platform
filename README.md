# Studio LLD

A 2-day MVP for practicing low-level design: pick a problem, write a structured design, submit, and get a rubric with evidence instead of a mystery score.

## Stack

- Next.js 14 (App Router) + TypeScript
- SQLite via Prisma
- OpenAI for rubric evaluation (`gpt-4o-mini` by default)
- Vitest for domain and service tests

## Setup

```bash
npm install
cp .env.example .env
```

Set `OPENAI_API_KEY` in `.env`. If the key is empty, the app still runs using a heuristic fallback so you can walk the UI; scores will not be interview-grade.

```bash
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test
```

## Practice loop

1. Choose one of five problems (Parking Lot, Elevator, Vending Machine, Library, LRU Cache).
2. Fill the seven required markdown sections.
3. Submit. The submission is saved first; evaluation runs in the background (`PENDING → VALIDATING → EVALUATING → COMPLETED | FAILED`).
4. The attempt page polls until feedback is ready.
5. Retry the same problem as a new attempt, or retry a failed evaluation without resubmitting.

## Architecture

API routes are thin. Application services own the use cases. Domain classes (`Attempt`, `Evaluation`, `StructuralValidator`, `Evaluator`) have no Next.js or Prisma imports. Prisma repositories implement domain interfaces.

The first piece to extract if AI latency or traffic grows is an **EvaluationWorker** that consumes a queue. The submit HTTP request should still only persist `Submission` + `Evaluation(PENDING)`.

## Limitations

- Identity is a `learner_id` cookie, not real auth.
- Structured text only (no code execution, no diagram editor).
- In-process evaluation (lost if the Node process dies mid-call).
- Heuristic fallback when no API key is set.

See [docs/RESEARCH.md](docs/RESEARCH.md), [docs/DESIGN.md](docs/DESIGN.md), and [AI_USAGE.md](AI_USAGE.md).
