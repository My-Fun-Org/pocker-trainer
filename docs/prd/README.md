# PokerTrainer AI - Product Requirements (Index)

PokerTrainer AI is an interactive poker coaching platform that teaches players
**how to think, not what to memorize**. Unlike GTO/solver trainers, it focuses on
decision making, range thinking, hand reading, board analysis, and always
explaining **WHY** - simulating a coach sitting next to the player.

## How this PRD set is organized

The product is split into **modules**, not features. Each module is independently
buildable and testable, and every module reinforces one shared workflow: the
[Mandatory Reasoning Gate](flagship-reasoning-gate.md) (the flagship feature).

- [Product Overview](overview.md) - vision, audience, tech stack, architecture, roadmap.
- [Flagship: Mandatory Reasoning Gate](flagship-reasoning-gate.md) - the core innovation every module depends on.

## Module index

| # | Module | Level | Priority | Status |
|---|--------|-------|----------|--------|
| 1 | [Preflop Trainer](modules/01-preflop-trainer.md) | Fundamentals | High | Built (MVP v1) |
| 2 | [Position Trainer](modules/02-position-trainer.md) | Fundamentals | Med | Planned |
| 3 | [Outs Trainer](modules/03-outs-trainer.md) | Fundamentals | High | Built (MVP v1) |
| 4 | [Pot Odds Trainer](modules/04-pot-odds-trainer.md) | Fundamentals | High | Built (MVP v1) |
| 5 | [Equity Trainer](modules/05-equity-trainer.md) | Fundamentals | High | Partial (engine) |
| 6 | [Range Builder](modules/06-range-builder.md) | Intermediate | High | Planned |
| 7 | [Hand Reading Trainer](modules/07-hand-reading-trainer.md) | Intermediate | High | Built (MVP v1, basic) |
| 8 | [Bet Size Trainer](modules/08-bet-size-trainer.md) | Fundamentals | High | Planned (v2) |
| 9 | [Board Texture Trainer](modules/09-board-texture-trainer.md) | Fundamentals | High | Built (MVP v1) |
| 10 | [Stack Depth Trainer](modules/10-stack-depth-trainer.md) | Intermediate | High | Planned |
| 11 | [SPR Trainer](modules/11-spr-trainer.md) | Intermediate | High | Planned |
| 12 | [Player Types](modules/12-player-types.md) | Intermediate | High | Planned |
| 13 | [Bluff Trainer](modules/13-bluff-trainer.md) | Intermediate | High | Planned |
| 14 | [Semi-Bluff Trainer](modules/14-semi-bluff-trainer.md) | Intermediate | High | Planned |
| 15 | [Value Betting Trainer](modules/15-value-betting-trainer.md) | Intermediate | High | Planned |
| 16 | [River Trainer](modules/16-river-trainer.md) | Intermediate | High | Planned |
| 17 | [Combo Counting](modules/17-combo-counting.md) | Intermediate | High | Planned |
| 18 | [Session Review](modules/18-session-review.md) | Intermediate | Med | Planned |
| 19 | [Hand Analyzer](modules/19-hand-analyzer.md) | Intermediate | High | Planned (v2) |
| 20 | [Replay Simulator](modules/20-replay-simulator.md) | Intermediate | Med | Planned (v2) |
| 21 | [Decision Tree Trainer](modules/21-decision-tree-trainer.md) | Intermediate | High | Planned |
| 22 | [Villain Profiling](modules/22-villain-profiling.md) | Intermediate | High | Planned |
| 23 | [Mental Game](modules/23-mental-game.md) | Cross-cutting | Med | Planned |
| 24 | [HUD Trainer](modules/24-hud-trainer.md) | Intermediate | Med | Planned |
| 25 | [Interactive Poker Table](modules/25-interactive-poker-table.md) | Platform | High | Partial (MVP v1) |
| 26 | [Scenario Builder (Admin)](modules/26-scenario-builder-admin.md) | Platform | Med | Planned |
| 27 | [AI Coach](modules/27-ai-coach.md) | Platform | Highest | Planned |

## Platform systems

- [Progression & Levels](systems/progression-and-levels.md)
- [Gamification: Daily Challenges & Achievements](systems/gamification.md)
- [Statistics Dashboard](systems/statistics-dashboard.md)

## MVP v1 status (already implemented)

The current codebase ships MVP v1: Preflop, Outs, Pot Odds, Board Texture, and a
basic Range Reading trainer, a poker-table UI, and local progress tracking. See
the repository [README](../../README.md). These PRDs describe both the built
modules (for hardening) and the full roadmap of missing modules.

## Module PRD template

Every module PRD follows the same structure so it can be picked up and built in
isolation:

1. Summary & status
2. Goal / why it matters
3. Primary user story
4. Concept(s) taught
5. Reasoning-gate integration (which gate steps it drills)
6. Scope & features
7. Data model / scenario schema
8. Engine dependencies
9. UI & interaction
10. Feedback & AI-coach behavior
11. Acceptance criteria
12. Dependencies & sequencing
13. Out of scope (this version)
