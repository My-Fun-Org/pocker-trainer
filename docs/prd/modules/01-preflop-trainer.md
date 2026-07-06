# Module 1: Preflop Trainer

- **Status:** Built (MVP v1) - hardening/extension in v2
- **Priority:** High
- **Level:** Fundamentals

## Goal

Train disciplined opening/response ranges by position so the player internalizes
which hands to fold, call, raise, and 3-bet before the flop.

## Primary user story

> As a beginner, I pick a position, get dealt a hand, and choose Fold/Call/Raise/
> 3-Bet, so that I learn chart-correct preflop play and understand why.

## Concepts taught

Position, starting-hand selection, suited vs offsuit, pocket pairs, steal spots,
3-bet/4-bet basics, domination.

## Reasoning-gate integration

Steps drilled: **Position (1)**, **Hero hand (3)**, **Action (10)**, **WHY (11)**.
Later: add **Stack depth (2)** to fold/open thresholds.

## Scope & features

- Position selector: UTG, MP, CO, BTN, SB, BB.
- Random hand generator (169-hand space).
- Situation: raise-first-in (folded to hero) vs facing an open (vsRaise).
- Actions: Fold / Call / Raise / 3-Bet.
- Difficulty: Easy (premiums only), Medium (full RFI), Advanced (vs 3-bet, blinds).

## Data model

Uses `public/data/preflop-ranges.json`: per-position `rfi.raise[]` and
`vsRaise.{call[],threeBet[]}` in 169-notation. Extend with `vs3bet` ranges and
per-stack-depth variants for Advanced.

## Engine dependencies

`lib/poker/preflop.ts` (`correctPreflopAction`), `cards.ts` (`toHandNotation`),
`generators.ts` (`generatePreflopScenario`).

## UI & interaction

Poker table with hero seat + position markers; opener seat shown when facing a
raise; action buttons reveal chart-correct choice + reason on submit.

## Feedback & AI-coach behavior

Explain domination and position ("A7o folds UTG because it is dominated by better
aces and plays poorly out of position").

## Acceptance criteria

- [x] All 6 positions selectable; hands generated uniformly.
- [x] Correct action computed from chart; feedback shows WHY.
- [x] Progress recorded per attempt with streaks.
- [ ] (v2) vs-3-bet situations and stack-depth-aware thresholds.
- [ ] (v2) Difficulty selector filters the hand pool.

## Dependencies & sequencing

Standalone. Chart data shared with [Range Builder](06-range-builder.md).

## Out of scope

Multiway pots, limped pots, ICM/tournament ranges.
