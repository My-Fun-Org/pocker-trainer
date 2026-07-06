# Module 25: Interactive Poker Table

- **Status:** Partial (MVP v1 has table, seats, cards, board, pot, chips,
  deal/reveal animations) - full experience in v2/v3
- **Priority:** High (shared platform surface)
- **Level:** Platform

## Goal

A realistic online-poker table (CoinPoker-like) that every module renders into, so
training feels like a real hand.

## Primary user story

> As a player, drills happen on a lifelike animated table - dealing, betting, chip
> movement, showdown - not a static quiz card.

## Concepts taught

None directly; it is the immersive shell that makes the reasoning habit feel real.

## Reasoning-gate integration

Hosts the reasoning rail and locks the action buttons until the gate is satisfied.

## Scope & features

- Built (MVP): felt table, hero + villain seats, hole cards, community board, pot,
  bet chips, dealer/SB/BB markers, deal/reveal animations.
- v2/v3: player avatars, chip-to-pot animations, showdown + winning animation,
  action timer, active-player highlighting, dealer announcements, chat bubbles,
  sound effects, 5-max/6-max/full-ring layouts.

## Data model

`SeatModel` (exists), plus a hand-state machine (`game/`) driving street
transitions and animations.

## Engine dependencies

Framer Motion (exists); React Spring for card physics (v3); a `game/` state
machine; asset pipeline for avatars/sounds.

## UI & interaction

Responsive oval table; seats positioned around it; transport for animated
dealing/betting; accessibility (reduced-motion) fallbacks.

## Feedback & AI-coach behavior

Coach messages surface as dealer announcements / speech bubbles at the table.

## Acceptance criteria

- [x] Table with seats, cards, board, pot, chips, markers, deal/reveal animation.
- [ ] (v2) Chip-to-pot + showdown + winner animations.
- [ ] (v2) Action timer + active-player highlight.
- [ ] (v3) Avatars, sounds, dealer announcements, multiple table sizes.

## Dependencies & sequencing

Foundational; all drill modules render into it. Animation-heavy features come after
the `game/` state machine exists.

## Out of scope

Real-money play; networked multiplayer (see Future Vision).
