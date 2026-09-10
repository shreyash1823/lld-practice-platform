# Research note — LLD practice is easy to start and hard to trust

## The learner problem

A typical LLD session looks like: open a prompt (Parking Lot, Elevator), sketch classes in a notebook or editor, maybe write some Java, then guess whether the design is “interview good.” Feedback, if it exists, is a peer, a solution video, or an LLM asked “is this good?” None of those scale into a loop.

Three frictions show up repeatedly:

1. **No evidence contract.** If the artifact is a blob of prose or a 400-line file, a reviewer (human or model) cannot tell which sentences are requirements, which are classes, and which are wishful patterns.
2. **One hidden answer.** Published “solutions” on GitHub and course sites freeze one class diagram. Learners then cargo-cult that diagram instead of arguing responsibilities.
3. **No memory.** Retrying Parking Lot next week does not show that last time coupling was the weak criterion. Practice does not compound.

## Existing approaches (small sample)

| Approach | What it is | Practice loop | Gap |
|---|---|---|---|
| Educative / “Grokking LLD” style courses | Long-form reference designs | Read, maybe quiz | You consume a solution; you rarely submit one and get judged on *your* types. |
| GitHub LLD repos (e.g. popular Java parking-lot / elevator kits) | Reference code + UML snapshots | Copy and run | Teaches one shape. Weak on “another valid design exists.” |
| LeetCode Discuss / InterviewBit design threads | Crowd answers | Social | Feedback is popularity, not a rubric. No attempt history product. |
| Generic ChatGPT / Copilot | Paste a design, ask for a score | Instant | Unconstrained prompts collapse to a 1–100 score with invented classes. No stored attempt, no structural gate. |

I also looked at how code-kata sites treat *implementation* katas (submit tests, get a red/green). That loop is excellent for algorithms and almost unused for design quality. LLD needs a weaker, cheaper artifact than “full compiling project,” but a stronger one than chat.

## Product direction

**Studio LLD** bets on a narrow loop:

- Five problems with requirements, constraints, and guiding questions — enough to attempt, not a course catalog.
- One submission format: structured markdown with seven headings. Deterministic checks prove the artifact is gradeable. AI then scores a *fixed rubric* with evidence quotes, not “match the official ParkingLot.java.”
- Attempt history so the second try is a response to the first rubric, not a blank page.

What we explicitly do not build: LMS, auth, diagram editors, code judges, leaderboards. Those do not fix the core uncertainty (“is *this* design any good, and why?”).

The research claim the prototype tests: **if you force the learner to name responsibilities and extension points, rubric feedback can be useful even when two answers disagree.**
