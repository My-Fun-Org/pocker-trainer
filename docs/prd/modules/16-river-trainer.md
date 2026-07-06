# Module 16: River Trainer

- **Status:** Planned (v3) - hardest, highest-leverage decisions
- **Priority:** High
- **Level:** Intermediate -> Advanced

## Goal

Train the most difficult street: polarized ranges, bluff-catching, thin value, and
big folds/calls.

## Primary user story

> As a player on the river, I decide hero-call / hero-fold / thin-value / bluff /
> overbet, using the fully narrowed range.

## Concepts taught

Bluff catching, polarization, thin value, overbets, hero calls/folds, MDF intuition
(soft, without the jargon).

## Reasoning-gate integration

Uses the **full 11-step gate**; river is where the whole habit pays off.

## Scope & features

- Exercise types: Hero Call, Hero Fold, Thin Value, Bluff Catch, Overbet,
  Polarized range read.
- Player must complete the reasoning gate, then choose the river action.
- Feedback compares to the narrowed range + villain type.

## Data model

```ts
interface RiverScenario {
  id: string; heroCards: string[]; board: string[]; // 5 cards
  history: StreetAction[]; villainType?: PlayerType;
  villainRiverRange: { value: string[]; bluffs: string[] };
  correctAction: string; explanation: string;
}
```

## Engine dependencies

`range.ts` (narrowed range + combo counts), `breakEvenFold`/MDF helper,
`evaluator.ts`.

## UI & interaction

Full table history recap; gated reasoning rail; river action buttons; feedback
shows value:bluff combo ratio vs the price.

## Feedback & AI-coach behavior

"Villain has 6 value combos and 9 bluff combos here; getting 2:1, you only need
33% - your bluff-catcher is a call."

## Acceptance criteria

- [ ] Six river exercise types.
- [ ] Combo-ratio-based feedback vs pot odds.
- [ ] Full gate required before acting.

## Dependencies & sequencing

Depends on [Range Builder](06-range-builder.md),
[Combo Counting](17-combo-counting.md), [Reasoning Gate](../flagship-reasoning-gate.md).

## Out of scope

Solver-exact mixed river strategies.
