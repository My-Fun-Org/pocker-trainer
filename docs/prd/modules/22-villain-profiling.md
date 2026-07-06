# Module 22: Villain Profiling

- **Status:** Planned - a high-impact differentiator
- **Priority:** High
- **Level:** Intermediate

## Goal

Train players to classify an opponent after ~20 hands and adjust strategy
accordingly.

## Primary user story

> As a player, after observing ~20 hands of an opponent's actions, I classify their
> type and the app scores my read, then I adjust.

## Concepts taught

Sampling tells over time, mapping observed frequencies to archetypes, dynamic
adjustment.

## Reasoning-gate integration

Feeds **Villain range (6)** and **bluffs (9)** in every subsequent decision.

## Scope & features

- Present a stream of ~20 hand summaries (villain's actions only).
- Player guesses the archetype; app scores against the generative profile.
- Then a live hand vs that villain where the correct adjustment is rewarded.

## Data model

```ts
interface ProfilingScenario {
  id: string; observedHands: string[];      // 20 action summaries
  trueType: PlayerType;
  followUp: { heroCards: string[]; board: string[]; correctAdjustment: string };
  explanation: string;
}
```

## Engine dependencies

`playerTypes.ts` (archetype frequency signatures) shared with
[Player Types](12-player-types.md) and [HUD](24-hud-trainer.md); a small stats
aggregator over the observed hands.

## UI & interaction

Scrollable hand-history feed; running mini-HUD (VPIP/PFR building up); type guess;
adjustment step.

## Feedback & AI-coach behavior

"Across 20 hands: VPIP 55%, PFR 8%, never raised a draw, called three streets twice
-> Calling Station. Adjust: value bet thin, never bluff."

## Acceptance criteria

- [ ] 20-hand observation feed with a derivable archetype.
- [ ] Classification scored + adjustment applied in a follow-up hand.

## Dependencies & sequencing

Depends on [Player Types](12-player-types.md); relates to
[HUD Trainer](24-hud-trainer.md).

## Out of scope

Real-time opponent modeling from live play.
