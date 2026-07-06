# Module 4: Pot Odds Trainer

- **Status:** Built (MVP v1) - extension in v2
- **Priority:** High
- **Level:** Fundamentals

## Goal

Teach the player to compare required equity to actual equity and make the
mathematically correct call/fold.

## Primary user story

> As a beginner, facing a bet with a draw, I decide call or fold, and the app
> shows required equity, my equity, and the EV, so I learn the price of a call.

## Concepts taught

Required equity = call / (pot + bet + call), pot-odds ratios, implied odds
(v2), EV of calling.

## Reasoning-gate integration

Steps: **Hero hand (3)**, **Action (10)**, **WHY (11)**.

## Scope & features

- Show pot, opponent bet, hero draw (on the turn -> one card to come).
- Player answers Fold / Call (Raise as v2 option).
- App computes required equity, actual equity, and EV.
- v2: implied-odds adjustment (stack behind) and multiway pots.

## Data model

Generated at runtime (`generatePotOddsScenario`): `pot`, `bet`, `analysis`,
`odds`, `heroEquity`, `correct`.

## Engine dependencies

`lib/poker/potOdds.ts` (`computePotOdds`, `potOddsVerdict`, `Decision`),
`draws.ts` (`estimateEquityFromOuts`).

## UI & interaction

Table with hero cards, board, pot chip, villain bet chip; Call/Fold buttons;
feedback shows the full equity/EV breakdown.

## Feedback & AI-coach behavior

"You call 20 to win 60, needing 25%; with 9 outs (~18% one card) folding is
correct - unless implied odds are strong."

## Acceptance criteria

- [x] Required equity and pot odds computed and displayed.
- [x] Correct decision derived from equity vs required.
- [ ] (v2) EV number shown; implied-odds mode; Raise option.

## Dependencies & sequencing

Depends on [Outs](03-outs-trainer.md) and [Equity](05-equity-trainer.md).

## Out of scope

Rake-adjusted odds, ICM.
