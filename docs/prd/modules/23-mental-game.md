# Module 23: Mental Game

- **Status:** Planned - missing from almost every trainer (build it)
- **Priority:** Medium (high differentiation)
- **Level:** Cross-cutting (psychology)

## Goal

Train the emotional and discipline side of poker that other trainers ignore.

## Primary user story

> As a player, I face scenarios designed to trigger tilt, fear, or hope, and I
> practice the disciplined response.

## Concepts taught

Tilt, fear, hope calls, revenge calls, scared money, discipline, session stop-loss,
confidence, separating results from decisions.

## Reasoning-gate integration

Reinforces "trust your read": many scenarios pit the correct read against an
emotional urge.

## Scope & features

- Emotion-labeled scenarios: e.g. after a bad beat, a marginal spot appears
  (revenge/tilt test); a scary board tempts a fold with the best hand (fear test);
  a busted draw tempts a call (hope test).
- Player chooses the disciplined action; app explains the emotional trap.
- Micro-lessons on tilt management and stop-loss.
- Hook: the "88 cooler" lesson - a correct decision with a bad outcome.

## Data model

```ts
type Emotion = "tilt" | "fear" | "hopeCall" | "revenge" | "scaredMoney" | "discipline";
interface MentalScenario {
  id: string; emotion: Emotion; setup: string;
  heroCards: string[]; board: string[];
  correctAction: string; trap: string; explanation: string;
}
```

## Engine dependencies

None new (reuses evaluator/equity for the underlying spot); content-driven.

## UI & interaction

Narrative framing card + table; action buttons; feedback separates decision quality
from outcome.

## Feedback & AI-coach behavior

"Your 88 got it in good and lost - that's variance, not a mistake. Folding here
would be scared money."

## Acceptance criteria

- [ ] All six emotion categories represented.
- [ ] Feedback explicitly decouples decision from outcome.

## Dependencies & sequencing

Standalone; complements [Session Review](18-session-review.md).

## Out of scope

Clinical/therapeutic content; biometric tilt detection.
