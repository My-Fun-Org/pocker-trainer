# Module 15: Value Betting Trainer

- **Status:** Planned (v2) - addresses the biggest beginner leak
- **Priority:** High
- **Level:** Intermediate

## Goal

Fix under/over-value-betting by forcing the question: **name worse hands that
call** before betting for value.

## Primary user story

> As a player, before I bet for value I must name three worse hands that call,
> otherwise I can't bet - so I stop value-betting hands nothing worse calls.

## Concepts taught

Thin value, target selection, sizing for value, avoiding "value bets" that only
get called by better.

## Reasoning-gate integration

**Hard gate on step 7 (worse hands call):** the player must list >=3 worse calling
hands before the Bet action unlocks.

## Scope & features

- Scenario: hero made hand + board + villain range.
- Gate: enter >=3 worse hands that call (validated against the scenario's worse-
  calling set).
- Then choose size; feedback confirms whether it is a value bet, thin value, or a
  spot to check.

## Data model

```ts
interface ValueBetScenario {
  id: string; heroCards: string[]; board: string[]; villainRange: string[];
  worseHandsThatCall: string[];    // gate answer key
  recommendation: "bet" | "checkBack";
  bestSize?: BetSizeOption; explanation: string;
}
```

## Engine dependencies

`range.ts` to compute worse-that-calls given range + board; `evaluator.ts` for
hand comparison.

## UI & interaction

Table + multi-select/text entry for worse hands (gated), then sizing chips.

## Feedback & AI-coach behavior

"You picked value bet, but only better hands (sets, two pair) continue - this is a
check-back, not a value bet." Or "QJ/QT/A7 all call worse - bet 1/2 for thin value."

## Acceptance criteria

- [ ] Bet action locked until >=3 valid worse-calling hands are entered.
- [ ] Distinguishes value / thin value / check-back with reasons.

## Dependencies & sequencing

Depends on [Reasoning Gate](../flagship-reasoning-gate.md) and `range.ts`; pairs
with [Bet Size](08-bet-size-trainer.md).

## Out of scope

River-specific polarization (see [River](16-river-trainer.md)).
