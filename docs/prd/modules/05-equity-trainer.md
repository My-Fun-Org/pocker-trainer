# Module 5: Equity Trainer

- **Status:** Partial (Monte Carlo engine exists; no dedicated UI)
- **Priority:** High
- **Level:** Fundamentals

## Goal

Build intuition for how often a hand wins, both hand-vs-hand and hand-vs-range.

## Primary user story

> As a player, I see a matchup (e.g. AA vs KK, AK vs QQ, flush draw vs top pair)
> and guess the win %, so I calibrate my equity intuition.

## Concepts taught

Preflop matchups, hand-vs-range equity, draw-vs-made-hand equity, the difference
between raw equity and **realized** equity (see
[Realized Equity note in Module 9/roadmap]).

## Reasoning-gate integration

Steps: **Hero hand (3)**, **Hand strength (5)**, **Villain range (6)**.

## Scope & features

- Curated matchups: AA vs KK, AK vs QQ, flush draw vs TP, overpair vs draw, etc.
- Player guesses win % (slider or bucketed choices: <35 / 35-45 / 45-55 / ...).
- Score by closeness to Monte Carlo result.
- v2: hand-vs-range equity (villain modeled as a range, not a fixed hand).

## Data model

```ts
interface EquityScenario {
  id: string;
  hero: string[];               // cards
  villain: string[] | string;   // cards or range label
  board?: string[];
  tolerancePct: number;         // scoring band
}
```

## Engine dependencies

`lib/poker/equity.ts` (`monteCarloEquity`); v2 adds range expansion (enumerate a
range into combos, average equity).

## UI & interaction

Two hands (or hand vs range grid), optional board; equity slider; reveal exact %
with a short animated bar.

## Feedback & AI-coach behavior

"AK vs QQ is a coin flip (~43% for AK) - a race, not a dominated spot."

## Acceptance criteria

- [ ] Curated matchups render with a guess input.
- [ ] Score based on distance to simulated equity within tolerance.
- [ ] (v2) Hand-vs-range equity from an expanded range.

## Dependencies & sequencing

Feeds [Pot Odds](04-pot-odds-trainer.md) and [Combo Counting](17-combo-counting.md).

## Out of scope

Exact enumeration for all runouts (Monte Carlo is sufficient).
