# Module 14: Semi-Bluff Trainer

- **Status:** Planned
- **Priority:** High
- **Level:** Intermediate

## Goal

Teach betting/raising with draws: combining fold equity with equity when called.

## Primary user story

> As a player with a draw (flush, combo, OESD, overcards), I decide check/bet/
> raise/call, and the coach evaluates the semi-bluff's two ways to win.

## Concepts taught

Semi-bluffing, fold equity + pot equity, aggression with draws, when to take a
free card.

## Reasoning-gate integration

Steps: **Hand strength (5)**, **bluffs (9)**, **Action (10)**, **WHY (11)**.

## Scope & features

- Draw types: flush draw, combo draw, OESD, overcards.
- Player picks Check / Bet / Raise / Call.
- App weighs outs (equity when called) + fold equity to justify aggression.

## Data model

```ts
interface SemiBluffScenario {
  id: string; heroCards: string[]; board: string[];
  potBB: number; villainType?: PlayerType;
  correctAction: "check" | "bet" | "raise" | "call";
  explanation: string;
}
```

## Engine dependencies

`draws.ts` (outs/equity), `breakEvenFold` helper; reuses villain tendencies.

## UI & interaction

Table + hero draw highlighted; action buttons; feedback shows "two ways to win".

## Feedback & AI-coach behavior

"Raising the flush draw wins now (fold equity) and later (9 outs) - a semi-bluff
raise beats a passive call on this wet board."

## Acceptance criteria

- [ ] Four draw types represented.
- [ ] Feedback quantifies fold equity + equity-when-called.

## Dependencies & sequencing

Depends on [Outs](03-outs-trainer.md); pairs with [Bluff](13-bluff-trainer.md).

## Out of scope

Exact combined-EV solver numbers.
