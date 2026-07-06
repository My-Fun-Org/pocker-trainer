# System: Statistics Dashboard

- **Status:** Planned (v2)
- **Priority:** High

## Goal

Show the player where they stand and what to fix next: biggest leak, weakest
module, most improved skill, accuracy, streaks, and a mistake heatmap.

## Metrics

- **Accuracy** overall and per module (with rolling trend).
- **Biggest leak** - module/concept with lowest rolling accuracy weighted by
  volume.
- **Weakest module** and **most improved skill** (delta over time).
- **Learning streak** (from [Gamification](gamification.md)).
- **Mistake heatmap** - frequency of mistakes across a grid (e.g. board texture x
  action, or position x street) to visualize patterns.

## Data model

```ts
interface DashboardData {
  overallAccuracy: number;
  perMode: { mode: TrainingMode; accuracy: number; attempts: number; trend: number }[];
  biggestLeak: TrainingMode;
  mostImproved: TrainingMode;
  streak: { current: number; best: number };
  mistakeHeatmap: { rowKey: string; colKey: string; count: number }[];
}
```

Derived entirely from the mistakes log + per-mode stats already captured by the
progress store (extended with timestamps + dimensions for heatmap axes).

## Engine dependencies

`statistics.ts` selectors over the progress store; no poker math.

## UI & interaction

Dashboard page: summary cards, per-module bars with trend arrows, a heatmap grid,
and CTAs into the weakest module and [Session Review](../modules/18-session-review.md).

## Charting

Use a canvas/React chart approach for trends and the heatmap; keep data-to-visual
mapping declarative so it can render as a rich canvas.

## Acceptance criteria

- [ ] Overall + per-module accuracy with trends.
- [ ] Biggest leak / weakest / most-improved computed.
- [ ] Mistake heatmap with at least one meaningful dimension pair.
- [ ] Deep-links into the recommended module.

## Dependencies & sequencing

Depends on [Progression](progression-and-levels.md) data; feeds
[Session Review](../modules/18-session-review.md).

## Out of scope

Multi-account benchmarking; cloud analytics.
