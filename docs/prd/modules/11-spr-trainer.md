# Module 11: SPR Trainer

- **Status:** Planned
- **Priority:** High
- **Level:** Intermediate

## Goal

Teach stack-to-pot ratio and how it changes the strength of hands like top pair.

## Primary user story

> As a player, I see the pot and effective stacks, estimate the SPR, and learn how
> low vs high SPR changes commitment.

## Concepts taught

SPR = effective stack / pot; low SPR commits one-pair hands, high SPR demotes
them; planning commitment before the flop.

## Reasoning-gate integration

Feeds **Hand strength (5)** and **Action (10)** via commitment logic.

## Scope & features

- Show pot + stacks; player estimates SPR (bucketed: ~1, ~2, ~4, ~7, ~13+).
- Then answer a commitment question ("Are you committed with top pair here?").
- Explain: SPR 2 -> top pair is often committed; SPR 15 -> top pair is a one-street
  hand.

## Data model

```ts
interface SprScenario {
  id: string; potBB: number; effectiveStackBB: number;
  heroCards: string[]; board: string[];
  correctSprBucket: string; committed: boolean; explanation: string;
}
```

## Engine dependencies

New `spr.ts`: `spr(pot, stack)`, `sprBucket(value)`, `commitmentAdvice(spr,
handClass)`.

## UI & interaction

Pot + stack chips prominent; SPR bucket buttons; commitment yes/no; animated
SPR gauge.

## Feedback & AI-coach behavior

"Pot 20, stacks 40 -> SPR 2. Top pair is happy to get it in; at SPR 15 the same
hand wants to keep the pot small."

## Acceptance criteria

- [ ] SPR estimation with bucketed scoring.
- [ ] Commitment question tied to SPR + hand class.

## Dependencies & sequencing

Shares commitment helper with [Stack Depth](10-stack-depth-trainer.md); informs
[Bet Size](08-bet-size-trainer.md).

## Out of scope

Multiway SPR nuance.
