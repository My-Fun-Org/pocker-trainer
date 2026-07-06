# Module 18: Session Review

- **Status:** Planned - a differentiating feature
- **Priority:** Medium
- **Level:** Intermediate

## Goal

Turn a played/imported session into structured reflection, coached by the AI.

## Primary user story

> As a player, after a session the app asks me reflective questions (best fold,
> worst call, biggest mistake, largest value bet/bluff, tilt moment) and helps me
> learn from my own play.

## Concepts taught

Self-review discipline, identifying leaks, separating decisions from outcomes
(results-oriented thinking), emotional awareness.

## Reasoning-gate integration

Retrospective: re-applies the gate to reviewed hands ("what should your read have
been?").

## Scope & features

- Input: hands played in-app this session, or an imported session (via
  [Hand Analyzer](19-hand-analyzer.md)).
- Guided prompts: Best fold? Worst call? Biggest mistake? Largest value bet?
  Largest bluff? Discipline fold? Tilt moment? Did you trust/ignore your read?
- Produces a saved review summary + links to relevant drills for weak spots.

## Data model

```ts
interface SessionReview {
  id: string; startedAt: number; endedAt: number;
  hands: ReviewedHand[];
  answers: Record<string, string>;   // prompt -> player reflection
  aiSummary: string; recommendedModules: TrainingMode[];
}
```

## Engine dependencies

Reuses attempt history from the progress store + [AI Coach](27-ai-coach.md) for the
summary; no new poker math.

## UI & interaction

Session timeline; prompt cards; mistake highlights; a "practice your weak spot"
CTA into the relevant module.

## Feedback & AI-coach behavior

"Your biggest EV loss was paying off a river raise with one pair - drill
[River](16-river-trainer.md) bluff-catching."

## Acceptance criteria

- [ ] Aggregates a session's attempts into a review object.
- [ ] Guided reflection prompts captured and stored.
- [ ] AI summary + recommended modules generated.

## Dependencies & sequencing

Depends on [Statistics Dashboard](../systems/statistics-dashboard.md) data and
[AI Coach](27-ai-coach.md).

## Out of scope

Multi-session trend analysis (Statistics Dashboard covers trends).
