# Module 17: Combo Counting

- **Status:** Planned
- **Priority:** High
- **Level:** Intermediate

## Goal

Make range reading mathematical: count combinations and compare value vs bluff
quantities.

## Primary user story

> As a player, I count combos (AA = 6, AKs = 4, AK total = 16) and compare "6 combos
> of sets vs 24 combos of top pair" to make range-based decisions.

## Concepts taught

Combinatorics of starting hands, card-removal/blocker effects on combos, weighting
ranges, value:bluff combo ratios.

## Reasoning-gate integration

Feeds **Villain range (6)** and river decisions (value:bluff ratio).

## Scope & features

- Drills: "How many combos of X?" (pairs=6, suited=4, offsuit=12, any=16), adjusted
  for known/board cards (blockers).
- Compare drills: "Which is more likely - sets or top pair here?" with counts.
- Progresses to weighted ranges.

## Data model

```ts
interface ComboScenario {
  id: string; question: "count" | "compare";
  hand?: string; handA?: string; handB?: string;
  deadCards: string[];         // board + known hole cards for removal
  correct: number | "A" | "B"; explanation: string;
}
```

## Engine dependencies

New `combos.ts`: `comboCount(hand, deadCards)`, `expandRangeToCombos(range,
deadCards)`; shared with [Range Builder](06-range-builder.md) and
[River](16-river-trainer.md).

## UI & interaction

Card selectors + numeric answer; a small grid visualizing the surviving combos.

## Feedback & AI-coach behavior

"With one ace in your hand, AA drops from 6 to 3 combos - blockers matter."

## Acceptance criteria

- [ ] Correct combo counts including card removal.
- [ ] Compare drills with value vs bluff quantities.

## Dependencies & sequencing

`combos.ts` underpins Range Builder, Hand Reading, River.

## Out of scope

Full weighted-range solver math.
