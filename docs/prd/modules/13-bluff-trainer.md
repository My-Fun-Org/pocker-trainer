# Module 13: Bluff Trainer

- **Status:** Planned
- **Priority:** High
- **Level:** Intermediate

## Goal

Teach when a bluff is profitable based on fold equity, board, villain type, and
blockers.

## Primary user story

> As a player, I decide bluff or don't-bluff, and the coach evaluates fold equity,
> board, villain type, and blockers.

## Concepts taught

Fold equity, break-even bluff %, board/range fit for bluffing, blocker effects,
villain-type dependence.

## Reasoning-gate integration

Steps: **Board texture (4)**, **Villain range (6)**, **bluffs (9)**, **Action
(10)**, **WHY (11)**.

## Scope & features

- Scenario: hero hand + board + villain profile.
- Player chooses Bluff / Don't Bluff (and size, optionally).
- App evaluates: required fold %, estimated fold %, blocker value, villain
  tendency.

## Data model

```ts
interface BluffScenario {
  id: string; heroCards: string[]; board: string[];
  villainType: PlayerType; potBB: number; betBB: number;
  correct: "bluff" | "dontBluff";
  requiredFoldPct: number; estimatedFoldPct: number;
  blockers: string[]; explanation: string;
}
```

## Engine dependencies

`breakEvenFold(bet, pot)` helper; blocker analysis from `range.ts`; villain
tendencies from `playerTypes.ts`.

## UI & interaction

Table + villain profile chip; Bluff/Don't-Bluff buttons; feedback shows fold-
equity math and blocker note.

## Feedback & AI-coach behavior

"Betting 1/2 pot needs villain to fold 33%. Nits over-fold, so this bluffs; but
you hold a blocker to their busted flush - even better."

## Acceptance criteria

- [ ] Break-even fold % computed and shown.
- [ ] Decision incorporates villain type + blockers.

## Dependencies & sequencing

Depends on [Player Types](12-player-types.md); pairs with
[Semi-Bluff](14-semi-bluff-trainer.md).

## Out of scope

Multi-street bluff planning (v-later).
