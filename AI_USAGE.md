---

# `AI_USAGE.md`

```md
# AI Usage

AI tools were used as engineering assistants during the 2-day implementation of Studio LLD.

The goal was not to outsource the architecture or blindly accept generated code. AI was primarily used to explore alternatives, scaffold repetitive code, review implementation approaches, and accelerate development.

The final implementation decisions were made based on the assignment requirements, MVP scope, testability, and maintainability.

---

## 1. Stack: Next.js Monolith vs Spring + React

### AI suggestion

One explored direction was a Java/Spring backend with a React frontend because an explicit backend/domain model can make LLD concepts more visible.

Another possible approach was a split Express API and React SPA.

### Decision

I chose:

```text
Next.js + TypeScript
Prisma
SQLite locally
Turso/libSQL in production
```
