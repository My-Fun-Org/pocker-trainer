# Module 7: Hand Reading Trainer

- **Status:** Built (MVP v1, basic) - full gated version in v2
- **Priority:** High
- **Level:** Intermediate

## Goal

Force the core hand-reading questions before acting: what worse hands call, what
better hands raise, what bluffs exist.

## Primary user story

> As an improving player, at each decision I must name worse hands that call,
> better hands that raise/continue, and the bluffs, before I can choose an action.

## Concepts taught

Range-based thinking, value/bluff categorization, board interaction, the
mandatory reasoning habit.

## Reasoning-gate integration

Uses the **full gate**, especially steps **7 (worse calls)**, **8 (better
continues)**, **9 (bluffs)** - answers required before action unlocks.

## Scope & features

- Authored street-by-street scenarios (extends MVP `range-scenarios.json`).
- Player multi-selects hand classes for each question; **cannot continue** until
  answered (strict gate).
- Reveal compares player's read to the authored answer with explanation.

## Data model

Extends MVP `RangeScenario` with explicit sub-questions:

```ts
interface HandReadingScenario extends RangeScenario {
  worseHandsCall: string[];
  betterHandsContinue: string[];
  bluffs: string[];
}
```

## Engine dependencies

Reuses range data loaders; optional combo counts from `range.ts` (v3).

## UI & interaction

Table + multi-select `ChoiceButtons` per sub-question, wired through the
[Reasoning Gate](../flagship-reasoning-gate.md); action buttons locked until done.

## Feedback & AI-coach behavior

Coach names the specific missed hands ("You forgot QT and 98s - both call a small
bet as worse made hands / draws").

## Acceptance criteria

- [x] (MVP) Single multi-select range question with correct-set scoring.
- [ ] (v2) Three gated sub-questions (worse/better/bluffs) blocking action.
- [ ] (v2) Coach diff of player read vs correct read.

## Dependencies & sequencing

Depends on [Reasoning Gate](../flagship-reasoning-gate.md); pairs with
[Range Builder](06-range-builder.md).

## Out of scope

Auto-generated hand-reading spots (authored first; generation later).
