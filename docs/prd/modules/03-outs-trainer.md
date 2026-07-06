# Module 3: Outs Trainer

- **Status:** Built (MVP v1) - extension in v2
- **Priority:** High
- **Level:** Fundamentals

## Goal

Train the player to identify draws and count outs quickly and correctly.

## Primary user story

> As a beginner, I see my hand and the board, identify the draw type, and count my
> outs, so that I can estimate equity on the fly.

## Concepts taught

Flush outs, straight outs (OESD, gutshot, double-gutter), combo draws, overcards,
set/boat/quad outs, and **clean vs dirty outs** (discounting outs that complete a
better hand for villain).

## Reasoning-gate integration

Steps: **Hero hand (3)**, **Board texture (4)**, **Hand strength (5)**.

## Scope & features

- Deal hero + flop (and optionally turn), biased toward teachable draws.
- Player answers: draw type + number of outs.
- v2: distinguish **clean vs dirty** outs and double-gutters; add set/boat/quad
  out counting on paired boards.

## Data model

Generated at runtime; optional authored `outs-scenarios.json` for curated cases
(double gutter, dirty outs).

## Engine dependencies

`lib/poker/draws.ts` (`analyzeDraws`, `OUTS`, `DrawType`, `isDrawingHand`),
`generators.ts` (`generateOutsScenario`). v2 adds dirty-out discounting.

## UI & interaction

Table with hero cards + board; two answer groups (draw type, outs count);
equity shown in feedback via rule of 2/4.

## Feedback & AI-coach behavior

Show the arithmetic ("9 flush outs = 13 - 4; ~36% to the river"). For dirty outs,
explain which outs to discount and why.

## Acceptance criteria

- [x] Draw type + outs answerable; correct value always in options.
- [x] Rule-of-2/4 equity shown in feedback.
- [ ] (v2) Clean vs dirty out classification.
- [ ] (v2) Double-gutter and made-hand out counting.

## Dependencies & sequencing

Feeds [Pot Odds](04-pot-odds-trainer.md) and [Equity](05-equity-trainer.md).

## Out of scope

Multiway out discounting; runner-runner precision.
