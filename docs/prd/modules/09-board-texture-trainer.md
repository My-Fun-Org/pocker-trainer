# Module 9: Board Texture Trainer

- **Status:** Built (MVP v1) - extension in v2
- **Priority:** High
- **Level:** Fundamentals

## Goal

Teach the player to read flush/straight coordination and classify how wet a board
is - and, in v2, **who the board favors**.

## Primary user story

> As a player, I see a flop and classify it (dry / semi-wet / wet / very wet), and
> the app explains why.

## Concepts taught

Flush/straight coordination, pairing, connectedness, broadway density; v2:
**range advantage** (which player's range hits harder) and **nut advantage** (who
holds more nutted combos).

## Reasoning-gate integration

Step: **Board texture (4)**; v2 extends to who the board favors (feeds villain
range reasoning).

## Scope & features

- MVP: classify Dry / Wet / Very Wet from authored flops.
- v2: add "Semi Wet" bucket; ask **"Who does this board favor - Hero or Villain?"**
  and **"Who has the nut advantage?"** with explanation.

## Data model

`public/data/board-texture-scenarios.json`: `{ flop, texture, explanation }`.
v2 adds `favors: "hero" | "villain" | "neutral"` and `nutAdvantage`.

## Engine dependencies

`lib/poker/boardTexture.ts` (`analyzeBoardTexture`, `Texture`, `TEXTURE_OPTIONS`).
v2 adds range-vs-range hit% given two ranges + board.

## UI & interaction

Table with flop; Dry/Wet/Very-Wet (+Semi-Wet) buttons; feedback with the
analyzer's reasons.

## Feedback & AI-coach behavior

"K72 rainbow favors the preflop raiser (more AK/AQ/KK); c-bet small and often.
987 two-tone favors the caller's connected range."

## Acceptance criteria

- [x] Classify texture from authored flops with explanation.
- [ ] (v2) Semi-Wet bucket + who-favors + nut-advantage questions.

## Dependencies & sequencing

Feeds [Bet Size](08-bet-size-trainer.md) and range/nut-advantage reasoning.

## Out of scope

Turn/river runout texture changes (v3).
