# Module 24: HUD Trainer

- **Status:** Planned
- **Priority:** Medium
- **Level:** Intermediate

## Goal

Teach the meaning of HUD stats and how to act on them.

## Primary user story

> As a player, I learn what VPIP, PFR, 3Bet, WTSD, W$SD, Fold-to-Cbet, Steal, AF,
> and RFI mean, and how each number changes my strategy.

## Concepts taught

Core HUD stats, typical value ranges, deriving player type from stats, exploitative
adjustments.

## Reasoning-gate integration

Feeds **Villain range (6)** and **bluffs (9)** via stat-implied tendencies.

## Scope & features

- Definition drills: match stat to definition.
- Interpretation drills: given a stat line, classify the player and pick the
  adjustment (ties to [Player Types](12-player-types.md)).
- Threshold intuition: "Is VPIP 45 / PFR 6 loose-passive?"

## Data model

```ts
type HudStat = "vpip" | "pfr" | "threeBet" | "wtsd" | "wssd" | "foldToCbet" | "steal" | "af" | "rfi";
interface HudScenario {
  id: string; kind: "define" | "interpret";
  statLine?: Partial<Record<HudStat, number>>;
  question: string; options: string[]; correct: string[]; explanation: string;
}
```

## Engine dependencies

`playerTypes.ts` for stat -> archetype mapping.

## UI & interaction

A mock HUD overlay on a villain seat; multiple-choice; hover tooltips per stat.

## Feedback & AI-coach behavior

"VPIP 45 / PFR 6 -> loose-passive Calling Station: bet value relentlessly, cut
bluffs."

## Acceptance criteria

- [ ] Definition + interpretation drills for all listed stats.
- [ ] Stat line -> archetype mapping consistent with Player Types.

## Dependencies & sequencing

Depends on [Player Types](12-player-types.md); complements
[Villain Profiling](22-villain-profiling.md).

## Out of scope

Live HUD integration with poker clients.
