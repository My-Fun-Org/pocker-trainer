# Flagship Feature: The Mandatory Reasoning Gate

Status: Planned (v2) - upgrades the current 6-step `ReasoningFramework` panel
Priority: Highest (the core product differentiator)

## Summary

Every poker trainer asks one question: *"What's your action?"* PokerTrainer asks
it **last**. Before the player is allowed to click Fold / Call / Raise, they must
first answer the reasoning questions. If they can't answer, they shouldn't be
allowed to act yet.

This is the feature that makes PokerTrainer feel like a real coach rather than a
quiz app. Every module plugs into it.

## Goal / why it matters

Skill does not come from memorizing charts; it comes from **changing the questions
you ask yourself before deciding**. The gate hard-codes that habit into the UI so
it becomes automatic.

## The reasoning flow (11 steps)

The full flow, in order. Simpler modules use a subset; the River/Hand-Reading
modules use all of it.

1. Position
2. Stack depth
3. Hero hand
4. Board texture
5. Hero hand strength
6. Villain range
7. What worse hands call?
8. What better hands continue (raise)?
9. What bluffs exist?
10. Choose action
11. Explain WHY

> The shipped MVP has a condensed 6-step version ("What do I have? / Dry or wet? /
> Worse hands call? / Better hands raise? / Bluffs? / Action?"). This PRD expands
> it into the full gated flow.

## How the gate works

- Each drill declares which steps are **required** (gated), **prompted**
  (answered but not blocking), or **hidden**.
- Action buttons are **disabled** until all required steps are answered.
- Answers are captured (not just clicked past) so the AI Coach and Statistics can
  compare the player's read to reality.
- After acting, step 11 (Explain WHY) shows the coach's reasoning and contrasts it
  with the player's stated read ("You said villain has no bluffs, but 76s and JT
  with backdoors are natural bluffs here").

## Reasoning-gate integration

This *is* the integration surface. Modules provide, per scenario:

- The correct value for each gated step (e.g. correct board texture, correct
  "worse hands that call" set, correct action).
- A per-step explanation string or a generator the AI Coach can expand.

## Data model

```ts
type GateStepId =
  | "position" | "stackDepth" | "heroHand" | "boardTexture"
  | "handStrength" | "villainRange" | "worseHandsCall"
  | "betterHandsContinue" | "bluffs" | "action" | "explainWhy";

interface GateStepSpec {
  id: GateStepId;
  mode: "required" | "prompted" | "hidden";
  question: string;
  // How the player answers this step.
  input: "single-choice" | "multi-select" | "text" | "number" | "range-grid";
  options?: string[];
  correct?: string[];         // correct answer(s), when checkable
  explanation: string;        // WHY, shown at step 11
}

interface GateConfig {
  steps: GateStepSpec[];
}

interface GateAnswer {
  stepId: GateStepId;
  value: string[] | string | number;
}
```

## UI & interaction

- A **reasoning rail** beside the table shows the steps as a checklist; the active
  step is highlighted.
- Steps expand inline: single-choice/multi-select use `ChoiceButtons`; range steps
  use a 13x13 range grid; combo/number steps use a numeric pad.
- A progress meter ("3 of 6 reasoning steps") and a locked "Action" section until
  complete.
- On completion, the Action buttons unlock with a subtle animation; step 11 opens
  the coach explanation.

## Feedback & AI-coach behavior

- Per-step correctness is stored but the gate does **not** block on being *right* -
  only on being *answered* (so players learn by comparing).
- The coach highlights the largest gap between the player's read and reality.
- Optional "strict mode": must answer correctly to proceed (for graded challenges).

## Acceptance criteria

- [ ] A module can declare a `GateConfig`; the runner renders the rail and gates
      the action buttons accordingly.
- [ ] Action buttons are disabled until all `required` steps have an answer.
- [ ] All answers are persisted with the attempt for later review.
- [ ] Step 11 renders a WHY explanation contrasting player read vs. correct read.
- [ ] Works for single-choice, multi-select, numeric, and 13x13 range inputs.
- [ ] Strict mode toggle blocks progress on incorrect required answers.

## Dependencies & sequencing

- Depends on: `ChoiceButtons`, a new **RangeGrid** component, the progress store,
  and (for rich WHY text) the [AI Coach](modules/27-ai-coach.md).
- Should be built early in v2 because modules 7, 13, 14, 15, 16 assume it.

## Out of scope (this version)

- LLM-generated free-form critique (covered by AI Coach v-later).
- Voice interaction.
