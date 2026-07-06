# Module 2: Position Trainer

- **Status:** Planned
- **Priority:** Medium
- **Level:** Fundamentals

## Goal

Teach *why* position matters, not just the seat names: acting last is information
and control.

## Primary user story

> As a beginner, I answer questions about who acts first, whether to widen, steal,
> or defend from a given seat, so that positional awareness becomes automatic.

## Concepts taught

Order of action, in-position vs out-of-position advantages, stealing, blind
defense, range widening by seat.

## Reasoning-gate integration

Steps: **Position (1)**, **Action (10)**, **WHY (11)**.

## Scope & features

- Exercises:
  - "Who acts first on this street?" (given seats + button).
  - "Should you widen your opening range here?" (yes/no + why).
  - "Steal spot?" (fold-to-steal frequency implied by seats).
  - "Defend the big blind?" (given price and position).
- Difficulty scales from 6-max to full-ring and blind-vs-blind.

## Data model

```ts
interface PositionExercise {
  id: string;
  seats: Position[];        // seated players
  button: Position;
  question: "actsFirst" | "widen" | "steal" | "defend";
  correct: string[];
  explanation: string;
}
```

## Engine dependencies

Small `positionOrder(button, seats)` helper (new in `lib/poker`). No evaluator.

## UI & interaction

Table view highlighting seats; multiple-choice answers via `ChoiceButtons`.

## Feedback & AI-coach behavior

Explain information/initiative ("BTN acts last postflop, so you can open wider and
realize more equity").

## Acceptance criteria

- [ ] Four exercise types implemented with correct answers + explanations.
- [ ] Table highlights the seats involved.
- [ ] Progress + accuracy tracked.

## Dependencies & sequencing

Pairs naturally with [Preflop Trainer](01-preflop-trainer.md); can reuse its
range data for widen/steal prompts.

## Out of scope

Multiway ICM, straddles.
