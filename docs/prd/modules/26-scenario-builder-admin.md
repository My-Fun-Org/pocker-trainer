# Module 26: Scenario Builder (Admin)

- **Status:** Planned
- **Priority:** Medium (content-velocity multiplier)
- **Level:** Platform (internal tool)

## Goal

Let authors create, validate, and export training scenarios as JSON without hand-
editing files.

## Primary user story

> As a content author, I build a scenario in a visual editor (hero/villain cards,
> stacks, street, actions, correct answers, difficulty, tags) and export valid JSON.

## Concepts taught

None (authoring tool).

## Reasoning-gate integration

Authors define the per-step gate config and correct answers used by drills.

## Scope & features

- Visual card/board picker, stack + position inputs, per-street action editor.
- Define correct answers per question type (action, texture, range set, combos).
- Difficulty + tags; live preview in the real table UI.
- Validation against each module's schema; export/import JSON (matching
  `public/data/*` shapes).

## Data model

Emits the schemas defined by each module (e.g. `RangeScenario`, `BetSizeScenario`,
`DecisionTreeScenario`). Central `scenarioSchemas.ts` registry for validation.

## Engine dependencies

Reuses `evaluator`/`range`/`boardTexture` to **auto-suggest** correct answers (e.g.
compute worse-hands-that-call to prefill).

## UI & interaction

Split view: editor form + live table preview; JSON output panel; validation
errors inline.

## Feedback & AI-coach behavior

Auto-suggests answers ("Detected 9 flush-draw combos as worse-calling hands - add
to answer key?").

## Acceptance criteria

- [ ] Build + preview + export a valid scenario for >=3 module types.
- [ ] Schema validation with clear errors.
- [ ] Import existing JSON to edit.

## Dependencies & sequencing

Depends on stable module schemas; accelerates all content modules.

## Out of scope

Multi-user CMS, auth/roles (single-author local tool first).
