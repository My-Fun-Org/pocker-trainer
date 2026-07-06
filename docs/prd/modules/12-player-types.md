# Module 12: Player Types

- **Status:** Planned
- **Priority:** High
- **Level:** Intermediate

## Goal

Teach that opponents differ, how to recognize archetypes, and how to adjust.

## Primary user story

> As a player, I see an opponent's actions, classify their type, and choose the
> exploitative adjustment.

## Concepts taught

Archetypes: **Nit**, **TAG**, **LAG**, **Calling Station**, **Maniac**, **Whale**,
**Short Stack**; the correct counter-strategy for each.

## Reasoning-gate integration

Feeds **Villain range (6)** and **bluffs (9)**: villain type reshapes the range and
bluff frequency.

## Scope & features

- Present an opponent's action pattern; player guesses the type.
- Then choose the adjustment (e.g. vs Calling Station: value bet relentlessly,
  never bluff; vs Nit: fold to river raises, steal blinds; vs Maniac: trap).
- Difficulty scales with subtler tells.

## Data model

```ts
type PlayerType = "nit" | "tag" | "lag" | "callingStation" | "maniac" | "whale" | "shortStack";
interface PlayerTypeScenario {
  id: string; actions: string[]; correctType: PlayerType;
  adjustments: { option: string; correct: boolean; explanation: string }[];
}
```

## Engine dependencies

New `playerTypes.ts` with archetype definitions (VPIP/PFR/aggression signatures)
shared with [Villain Profiling](22-villain-profiling.md) and [HUD](24-hud-trainer.md).

## UI & interaction

Opponent avatar + action log; type buttons; adjustment multiple-choice.

## Feedback & AI-coach behavior

"Limps, calls three streets, never raises draws -> Calling Station. Adjust: bet
thin for value, cut all bluffs."

## Acceptance criteria

- [ ] All seven archetypes represented with recognizable action patterns.
- [ ] Correct adjustment per type with explanation.

## Dependencies & sequencing

Foundational for [Villain Profiling](22-villain-profiling.md),
[Bluff](13-bluff-trainer.md), [Value Betting](15-value-betting-trainer.md).

## Out of scope

Dynamic villains that adapt during a hand (v-later).
