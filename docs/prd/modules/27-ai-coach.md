# Module 27: AI Coach

- **Status:** Planned - the biggest feature
- **Priority:** Highest
- **Level:** Platform (shared explanation engine)

## Goal

Replace "Correct / Wrong" with real coaching: explain *why*, name the specific
hands and math, and contrast the player's stated read with reality.

## Primary user story

> As a player, after I act the coach explains the decision like a human coach -
> "You chose 3/4 pot to get folds, but QJ/QT/T9 still call; 1/2 pot is higher EV."

## Concepts taught

Meta-module: it is the voice that explains every other module.

## Reasoning-gate integration

Consumes the player's gate answers and the scenario's correct values to produce a
targeted, personalized explanation (step 11: Explain WHY).

## Scope & features

- **Phase 1 (deterministic):** template-based explanations generated from engine
  facts (worse-calls set, combo counts, texture, pot odds). No LLM; fully offline.
- **Phase 2 (LLM-backed):** natural-language coaching from a structured prompt
  (scenario facts + player read + engine analysis); graceful fallback to Phase 1.
- Tone: concise, specific, always naming hands/numbers; never generic.

## Data model

```ts
interface CoachInput {
  mode: TrainingMode;
  scenarioFacts: Record<string, unknown>;   // texture, ranges, odds, combos...
  playerAnswers: GateAnswer[];
  correct: Record<string, unknown>;
}
interface CoachOutput { headline: string; reasons: string[]; contrast?: string; }
```

## Engine dependencies

All engine modules (evaluator, equity, range, combos, boardTexture, potOdds) feed
`scenarioFacts`. Phase 2 adds an LLM client behind a provider interface.

## UI & interaction

Coach panel / dealer speech bubble; expandable "show the math"; contrast block for
player-read vs correct-read.

## Feedback & AI-coach behavior

This module *is* the feedback behavior referenced by every other PRD.

## Acceptance criteria

- [ ] Phase 1 deterministic explanations for all shipped modules.
- [ ] Contrast of player gate-answers vs correct answers.
- [ ] Provider interface so Phase 2 LLM can slot in without module changes.
- [ ] Offline fallback always available.

## Dependencies & sequencing

Build Phase 1 alongside the [Reasoning Gate](../flagship-reasoning-gate.md); every
module supplies `scenarioFacts` + `correct`.

## Out of scope

Voice output (Future Vision); solver-grade analysis.
