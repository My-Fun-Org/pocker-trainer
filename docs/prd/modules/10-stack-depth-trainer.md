# Module 10: Stack Depth Trainer

- **Status:** Planned
- **Priority:** High
- **Level:** Intermediate

## Goal

Show that the same hand plays differently at different stack depths.

## Primary user story

> As a player, I see the same hand at 30 / 50 / 100 / 200 / 300 BB and learn how
> the correct strategy changes with depth.

## Concepts taught

Depth-dependent hand values, set-mining vs high-card value, implied odds, 3-bet/
call thresholds, commitment.

## Reasoning-gate integration

Step: **Stack depth (2)** (its dedicated drill); influences **Action (10)**.

## Scope & features

- A hand shown at multiple depths (30/50/100/200/300 BB).
- Player picks the correct line per depth; app contrasts them.
- Emphasis: speculative hands (suited connectors, small pairs) gain value deep;
  high-card hands gain value shallow.

## Data model

```ts
interface StackDepthScenario {
  id: string; heroCards: string[]; board?: string[]; position: Position;
  depths: { depthBB: number; correctAction: string; explanation: string }[];
}
```

## Engine dependencies

Reuses preflop/postflop verdict helpers with depth as a parameter; new
`commitment(spr, depth)` helper shared with [SPR](11-spr-trainer.md).

## UI & interaction

Depth selector (slider or chips); table stack sizes update; side-by-side compare
mode across depths.

## Feedback & AI-coach behavior

"22 is a fold to a 3-bet at 30 BB (no set-mine odds) but a profitable call at 200
BB (implied odds pay off)."

## Acceptance criteria

- [ ] Same hand rendered across >=3 depths with distinct correct lines.
- [ ] Compare view highlights the strategic difference.

## Dependencies & sequencing

Tightly related to [SPR](11-spr-trainer.md); reuse commitment helper.

## Out of scope

Tournament/ICM depth effects.
