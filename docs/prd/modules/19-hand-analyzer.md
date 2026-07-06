# Module 19: Hand Analyzer

- **Status:** Planned (v2)
- **Priority:** High
- **Level:** Intermediate

## Goal

Let players paste a real hand (or hand history) and get a street-by-street review
with mistakes, alternatives, and EV reasoning.

## Primary user story

> As a player, I paste a hand from PokerStars / GG / CoinPoker and the AI reviews
> preflop, flop, turn, river, flags mistakes, and suggests better lines.

## Concepts taught

Applies every concept to real hands; mistake classification and alternative lines.

## Reasoning-gate integration

The analyzer restates each decision through the gate lens (range, worse/better,
bluffs) when explaining.

## Scope & features

- Input: manual builder (hero cards, villain if known, board, positions, stacks,
  action per street) **and** pasted hand-history text.
- Output per street: assessment, mistake label, alternative, EV note.
- Mistake labels: under-bet wet board, paid off river raise with one pair, missed
  draw, correct call/bad outcome, cooler, bad bluff, good value bet, etc.

## Data model

```ts
interface AnalyzedHand {
  hero: string[]; villain?: string[]; board: string[];
  positions: Record<string, Position>; stacksBB: Record<string, number>;
  streets: { street: string; actions: StreetAction[] }[];
}
interface HandReview {
  perStreet: { street: string; assessment: string; mistake?: string; alternative?: string }[];
  summary: string;
}
```

## Engine dependencies

Hand-history **parsers** (per site format), `evaluator.ts`, `equity.ts`,
`range.ts`, and [AI Coach](27-ai-coach.md) for narrative.

## UI & interaction

Paste box + parsed preview; manual builder fallback; a replayable street timeline;
mistake chips inline.

## Feedback & AI-coach behavior

"Turn: under-bet a wet board (1/4 pot) - draws get a cheap peel; size to 2/3 to
charge them and protect your equity."

## Acceptance criteria

- [ ] Manual hand builder produces a review.
- [ ] At least one site's hand-history format parses.
- [ ] Per-street mistake labels + alternatives + summary.

## Dependencies & sequencing

Feeds [Replay Simulator](20-replay-simulator.md) and
[Session Review](18-session-review.md); needs [AI Coach](27-ai-coach.md).

## Out of scope

Full multi-table history import (single hands first).
