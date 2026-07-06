# Module 8: Bet Size Trainer

- **Status:** Planned (v2)
- **Priority:** High
- **Level:** Fundamentals -> Intermediate

## Goal

Teach bet-sizing **logic**, not memorized numbers: size follows board texture,
range advantage, and goal (value/bluff/protection).

## Primary user story

> As a player first to act, I choose a size (check, 1/4, 1/3, 1/2, 2/3, 3/4, pot,
> overbet, all-in) and the coach explains why that size maximizes EV.

## Concepts taught

Sizing by texture (wet -> larger, dry -> smaller), polarization, value vs bluff
sizing, protection, denying equity, target hands that call.

## Reasoning-gate integration

Steps: **Board texture (4)**, **worse hands call (7)**, **Action (10)**, **WHY
(11)**.

## Scope & features

- Options: Check, 1/4, 1/3, 1/2, 2/3, 3/4, Pot, Overbet, All-In.
- Scenario tags the "best" size(s) with reasoning; near-misses scored partially.
- Difficulty: single-street sizing -> multi-street barreling plans (v3).

## Data model

```ts
interface BetSizeScenario {
  id: string;
  heroCards: string[]; board: string[];
  potBB: number; effectiveStackBB: number;
  intent: "value" | "bluff" | "semiBluff" | "protection";
  bestSizes: BetSizeOption[];   // one or more acceptable
  explanation: string;
}
```

## Engine dependencies

`boardTexture.ts` (texture -> size heuristic), a new `betSizing.ts` mapping
{texture, intent, SPR} -> recommended sizes.

## UI & interaction

Sizing buttons rendered as chips; selected size animates chips to pot; feedback
contrasts sizes ("On this wet board 2/3 charges draws; 1/3 lets them peel cheaply").

## Feedback & AI-coach behavior

Always answer WHY with target hands: "3/4 folds out QJ/QT that a 1/2 keeps in - if
you want value, size down; if you want folds, size up."

## Acceptance criteria

- [ ] All nine sizing options selectable.
- [ ] Scenario supports multiple acceptable sizes with partial credit.
- [ ] Feedback ties size to texture + intent + target hands.

## Dependencies & sequencing

Depends on [Board Texture](09-board-texture-trainer.md); relates to
[Value Betting](15-value-betting-trainer.md), [SPR](11-spr-trainer.md).

## Out of scope

Solver-exact sizing frequencies; mixed sizes.
