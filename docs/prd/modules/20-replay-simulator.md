# Module 20: Replay Simulator

- **Status:** Planned (v2/v3)
- **Priority:** Medium
- **Level:** Intermediate

## Goal

Let players replay a hand, pause on any street, change an action, and see the
alternate line/outcome.

## Primary user story

> As a player, I replay a hand, pause, pick a different action, and explore how the
> hand and its EV would change.

## Concepts taught

Counterfactual thinking, branch comparison, decoupling decision quality from
results.

## Reasoning-gate integration

At each pause, the gate can be re-run to justify the alternate action.

## Scope & features

- Load a hand (from [Hand Analyzer](19-hand-analyzer.md), Session Review, or a
  drill).
- Timeline scrubber with pause/step controls.
- "What if" branching: change hero's action -> show a plausible continuation +
  EV/equity delta.

## Data model

```ts
interface ReplayHand extends AnalyzedHand {
  branches?: { atStreet: string; action: string; continuation: StreetAction[]; note: string }[];
}
```

## Engine dependencies

`equity.ts` for branch equities; reuses table animation layer; AI Coach for the
"what if" narrative (approximate continuations).

## UI & interaction

Table with a transport bar (play/pause/step/scrub); action override control; side
panel comparing original vs alternate line.

## Feedback & AI-coach behavior

"If you 3-bet the flop instead of calling, villain folds ~55% and you avoid the
tough turn - higher EV even though you 'lose' the times they continue."

## Acceptance criteria

- [ ] Replay + pause + step through a stored hand.
- [ ] At least one branchable decision with an alternate outcome + delta.

## Dependencies & sequencing

Depends on [Hand Analyzer](19-hand-analyzer.md) data model and the table
animation layer.

## Out of scope

Full game-tree simulation (approximate branches only).
