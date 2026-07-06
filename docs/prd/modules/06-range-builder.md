# Module 6: Range Builder

- **Status:** Planned (v3) - the most important intermediate module
- **Priority:** High
- **Level:** Intermediate

## Goal

Teach **range narrowing**: how villain's range shrinks after every action, street
by street. This is the single most important intermediate skill.

## Primary user story

> As an improving player, I build villain's preflop range, then narrow it on each
> street based on their actions, so I learn to think in ranges that evolve.

## Concepts taught

Range construction, range narrowing across streets, removing impossible combos,
weighting hands, combo counting (ties into Module 17).

## Reasoning-gate integration

Steps: **Villain range (6)**, and feeds **worse/better/bluffs (7-9)**.

## Scope & features

- Start preflop: player selects villain's opening/continuing range on a **13x13
  grid**.
- Flop: range auto-filters by the action (e.g. "flop call" removes strong raises);
  player refines.
- Turn/River: narrow again. Show combo counts collapsing (e.g. 150 -> 70 -> 20 -> 8).
- Exercises: select hands, remove impossible hands (blockers/board), weight hands.

## Data model

```ts
interface RangeBuilderScenario {
  id: string;
  heroCards: string[];
  actions: StreetAction[];      // per street villain action
  board: { flop: string[]; turn?: string[]; river?: string[] };
  targetRange: {                // correct range per street
    preflop: string[]; flop: string[]; turn?: string[]; river?: string[];
  };
  explanation: string;
}
```

## Engine dependencies

New **RangeGrid** component + `range.ts` engine module: expand 169-notation to
combos, apply card-removal (blockers/board), count combos, diff player vs target.

## UI & interaction

Interactive 13x13 grid (click/drag to select, weight via shading); a combo
counter and a street stepper; "narrow" transitions animate removed combos fading.

## Feedback & AI-coach behavior

Score by set overlap per street; coach explains removals ("After the turn raise,
drop marginal pairs and floats - only value and strong draws keep barreling").

## Acceptance criteria

- [ ] 13x13 grid selection with weighting.
- [ ] Combo counting with card removal.
- [ ] Street-by-street narrowing with per-street scoring.
- [ ] Visualized combo-count collapse.

## Dependencies & sequencing

Depends on **RangeGrid** and `range.ts`; foundational for
[Hand Reading](07-hand-reading-trainer.md), [Range/Nut Advantage], and
[Combo Counting](17-combo-counting.md).

## Out of scope

Solver-derived exact frequencies; mixed strategies.
