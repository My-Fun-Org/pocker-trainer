# System: Progression & Levels

- **Status:** Partial (MVP tracks per-mode attempts/accuracy/streaks) - full system planned
- **Priority:** High

## Goal

Give every concept a measurable skill level, gate content by mastery, and guide the
player along the Fundamentals -> Intermediate -> Advanced ladder.

## Concepts

- Each concept/module has a **star rating (0-5)** derived from recent accuracy and
  volume (e.g. Position ★★★★★, Ranges ★★★☆☆, River ★☆☆☆☆).
- **Levels** group concepts (Level 1 Fundamentals, Level 2 Intermediate, Level 3
  Advanced); advancing requires minimum stars across the level's modules.
- **Unlock gating:** advanced modules unlock once prerequisites reach a threshold
  (e.g. River unlocks after Range Builder + Combo Counting reach ★★★).

## Data model

```ts
interface ConceptProgress {
  concept: TrainingMode | string;
  stars: number;                 // 0-5, derived
  attempts: number; correct: number;
  rollingAccuracy: number;       // last N attempts
  unlocked: boolean;
}
interface Progression {
  concepts: Record<string, ConceptProgress>;
  level: 1 | 2 | 3;
}
```

Star formula (initial): weight rolling accuracy by volume so a few lucky hits do
not grant mastery; decays slowly if unused.

## Engine dependencies

Extends the existing Zustand progress store; a `progression.ts` selector computes
stars/levels/unlocks from raw attempts.

## UI & interaction

- Star ratings on each mode card (extends the StartScreen).
- A level track showing current level and what unlocks next.
- Lock badges on gated modules with the prerequisite shown.

## Acceptance criteria

- [ ] Stars computed from rolling accuracy + volume per concept.
- [ ] Level derived from aggregate stars; next-unlock surfaced.
- [ ] Prerequisite gating enforced on locked modules.
- [ ] Persisted in `localStorage` (later synced via storage adapter).

## Dependencies & sequencing

Feeds [Statistics Dashboard](statistics-dashboard.md) and
[Gamification](gamification.md); consumed by the StartScreen.

## Out of scope

Cross-device sync (arrives with the SQLite/Postgres storage phase).
