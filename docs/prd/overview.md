# PokerTrainer AI - Product Overview

## Vision

PokerTrainer AI teaches players **how to think, not what to memorize**. Instead of
drilling GTO frequencies and solver outputs, it trains the internal decision
process experienced players run during a real hand: read the board, build the
villain's range, find worse hands that call and better hands that raise, locate
the bluffs, and only then choose an action - always explaining WHY.

The north star: the app should feel like **a coach sitting next to the player**,
not another quiz website.

## Target audience

- **Primary:** Beginners, 0-50k hands played.
- **Secondary:** Intermediate players beating micro stakes but stuck moving up.

## Design principles

1. **Reasoning before action.** No action button unlocks until the player has
   answered the reasoning questions (see the flagship
   [Mandatory Reasoning Gate](flagship-reasoning-gate.md)).
2. **Always explain WHY.** Feedback is never just "correct/wrong"; it names the
   specific hands, math, or texture behind the answer.
3. **Think in ranges, not hands.** Combos, range narrowing, and range/nut
   advantage are treated as core skills, not advanced extras.
4. **Modules over features.** Each training concept is an independently buildable,
   testable module wired into the shared table UI, progress store, and AI coach.
5. **Progressive difficulty.** Easy / Medium / Advanced per module, gated by a
   level system.

## Learning ladder

- **Level 1 - Fundamentals:** position, starting hands, hand rankings, pot odds,
  outs, dry vs wet boards, basic bet sizing, value/bluff/semi-bluff, basic ranges.
- **Level 2 - Intermediate (focus):** range narrowing, player types, range
  advantage, nut advantage, stack depth, SPR, bet-sizing logic, realized equity,
  combo counting.
- **Level 3 - Advanced (later):** MDF, GTO frequencies, solver outputs, mixed
  strategies, blockers, indifference, node locking.
- **Psychology (differentiator):** tilt, fear, hope calls, revenge calls, scared
  money, discipline.

## Tech stack

**Frontend**

- React + TypeScript + Vite
- Zustand (state) with `persist`
- React Router
- Framer Motion (+ React Spring for card physics, later)
- TailwindCSS, component primitives via HeroUI / shadcn (later)

**Storage**

- Phase 1: CSV / JSON on disk (bundled), progress in `localStorage`.
- Phase 2: SQLite (local/desktop).
- Phase 3: PostgreSQL (accounts, cloud sync, cross-device curriculum).

## Target architecture

```
src/
  components/      Reusable UI (table/, ui/)
  pages/           Route-level screens
  hooks/           Shared React hooks
  game/            Game-state orchestration (hand state machine)
  animations/      Card/chip/showdown animation helpers
  engine/          Pure poker logic (evaluator, equity, ranges, combos, SPR...)
  training/        Per-module drill logic + scenario generators
  storage/         Persistence adapters (localStorage -> SQLite -> Postgres)
  utils/
  assets/
    data/
      csv/
      json/
      images/
      sounds/
```

> The current MVP uses `src/lib/poker` (engine) and `src/modes` (training). As the
> product grows, `lib/poker` maps to `engine/`, `modes/` maps to `training/`, and a
> `storage/` adapter layer is introduced so the persistence backend can evolve
> without touching module code.

## Cross-cutting systems

- [Progression & Levels](systems/progression-and-levels.md) - per-concept star
  ratings and unlock gating.
- [Gamification](systems/gamification.md) - daily challenges and achievements.
- [Statistics Dashboard](systems/statistics-dashboard.md) - biggest leak, weakest
  module, accuracy, streaks, mistake heatmap.
- [AI Coach](modules/27-ai-coach.md) - the explanation engine shared by all modules.

## Roadmap

- **v1 (shipped):** Preflop, Outs, Pot Odds, Board Texture, basic Range Reading,
  poker-table UI, local progress.
- **v2:** Mandatory Reasoning Gate (full 11-step), Bet Size, Value Betting, Hand
  Reading (full), Semi-Bluff, Bluff, Equity, Combo Counting, Stack Depth, SPR,
  Player Types, Statistics Dashboard, Hand Analyzer.
- **v3:** Range Builder, River, Decision Tree, Villain Profiling, Session Review,
  Replay, HUD Trainer, Mental Game, Scenario Builder, AI Coach (LLM-backed),
  achievements, SQLite.
- **Future:** AI-generated infinite scenarios, voice coach, multiplayer training,
  solver comparison, mobile PWA, hand-history import, personalized curriculum.
