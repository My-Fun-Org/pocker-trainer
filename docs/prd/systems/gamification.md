# System: Gamification (Daily Challenges & Achievements)

- **Status:** Planned
- **Priority:** Medium (retention driver)

## Goal

Drive daily practice and reward milestones so the reasoning habit sticks.

## Daily Challenges

- A small rotating set of goals each day, e.g.:
  - "Fold correctly three times."
  - "Count flush outs five times."
  - "Identify three wet boards."
  - "Find the bluff."
- Completing all daily challenges extends a **learning streak**.
- Challenges are generated from module capabilities + the player's weak spots
  (from [Progression](progression-and-levels.md)).

### Data model

```ts
interface DailyChallenge {
  id: string; date: string;              // YYYY-MM-DD
  mode: TrainingMode; goal: string;
  target: number; progress: number; done: boolean;
}
interface StreakState { current: number; best: number; lastCompletedDate: string; }
```

## Achievements

- Milestone badges, e.g.: First Hero Fold, First Correct Bluff, 100 Correct Ranges,
  500 Correct Outs, Perfect Session.
- Unlocked from progress-store events; one-time, persisted.

### Data model

```ts
interface Achievement {
  id: string; title: string; description: string;
  unlocked: boolean; unlockedAt?: number;
  criteria: { event: string; count: number };
}
```

## Engine dependencies

Listens to `recordResult` events in the progress store; a `challenges.ts` +
`achievements.ts` evaluator.

## UI & interaction

- Daily challenge card on the home screen with progress bars and streak flame.
- Achievement shelf; toast on unlock.

## Acceptance criteria

- [ ] Daily challenges generated, tracked, and reset per day.
- [ ] Learning streak increments/breaks correctly across days.
- [ ] Achievements unlock from real events and persist.

## Dependencies & sequencing

Depends on the progress store and [Progression](progression-and-levels.md).

## Out of scope

Leaderboards / social (Future Vision).
