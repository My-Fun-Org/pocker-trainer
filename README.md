# PokerTrainer

A web app that trains beginner/intermediate poker players to think through hands
step by step, like a real online cash-game table. Every drill reinforces the same
6-step habit:

1. What do I have?
2. Dry or wet board?
3. What worse hands call?
4. What better hands raise?
5. What bluffs exist?
6. What is my action?

## MVP v1 training modes

- **Preflop Hands** - pick fold / call / raise / 3-bet against chart-correct
  ranges by position.
- **Outs & Equity** - identify the draw, count outs, estimate equity with the
  rule of 2 and 4.
- **Pot Odds** - compare your equity to the required equity and call or fold.
- **Board Texture** - classify a flop as dry / wet / very wet.
- **Range Reading** - select which hands continue, raise, call, or bluff.

## Tech stack

- React + Vite + TypeScript
- Tailwind CSS (poker-table styling)
- Framer Motion (card / chip animations)
- React Router (navigation)
- Zustand + `persist` (session and progress in `localStorage`)

Pure frontend, no backend. Authored scenarios are static JSON in
[`public/data`](public/data); preflop / outs / pot-odds hands are generated
procedurally by the poker engine.

## Project structure

```
public/data/                 Authored JSON scenarios
  preflop-ranges.json
  range-scenarios.json
  board-texture-scenarios.json
src/
  lib/poker/                 Poker engine (cards, deck, evaluator, draws,
                             equity, pot odds, board texture, preflop, generators)
  lib/data/                  Typed JSON loaders
  components/table/          Poker-table UI (table, seats, cards, board, chips)
  components/ui/             ChoiceButtons, Feedback, ReasoningFramework, TrainerShell
  modes/                     The five trainer screens
  screens/                   StartScreen
  store/                     Zustand progress store (localStorage)
  types/                     App-level value objects (TrainingMode, routes)
  router.tsx                 Route table
```

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # typecheck + production build
npm run preview  # preview the production build
```

## Conventions

- No magic strings or magic numbers: string unions are modeled as `as const`
  value objects with derived types (e.g. `DrawType`, `Texture`, `Decision`,
  `Position`, `TrainingMode`), and numeric constants are named
  (e.g. `CARD_CONSTANTS`, `OUTS`).
- Each engine module owns a single concept (SRP); callers depend on helpers and
  predicates (e.g. `isDrawingHand`) rather than raw literals.

## Roadmap (post-MVP)

- v2: Bet-sizing trainer, hand analyzer, custom hand input, mistakes dashboard,
  replay, difficulty levels.
- v3: Villain player types, bankroll/session review, hand-history export, PWA.
