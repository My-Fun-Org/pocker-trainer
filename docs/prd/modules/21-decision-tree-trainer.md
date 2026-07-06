# Module 21: Decision Tree Trainer

- **Status:** Planned
- **Priority:** High
- **Level:** Intermediate

## Goal

Replace one-shot quizzes with an interactive branching hand: the player navigates a
decision tree where every branch explains itself.

## Primary user story

> As a player, I make a check; villain bets; I choose call/raise/fold; the turn
> comes; I decide again - a full hand as a guided, explained tree.

## Concepts taught

Multi-street planning, how earlier actions constrain later ones, line construction.

## Reasoning-gate integration

The gate runs at each decision node before the branch unlocks.

## Scope & features

- Authored trees: nodes = decision points, edges = actions, leaves = outcomes.
- Every branch has an explanation; wrong turns still show what that line implies.
- Difficulty = tree depth/branching + subtlety.

## Data model

```ts
interface DecisionNode {
  id: string; street: string; prompt: string;
  board: string[]; potBB: number;
  options: { action: string; nextNodeId?: string; correct: boolean; explanation: string }[];
}
interface DecisionTreeScenario { id: string; rootId: string; nodes: DecisionNode[]; }
```

## Engine dependencies

A tree-runner (new in `training/`); reuses table UI + reasoning gate; no new math.

## UI & interaction

Table updates as the player descends the tree; breadcrumb of chosen line; a
collapsible tree map.

## Feedback & AI-coach behavior

Per-node WHY; at the leaf, a recap of the whole line vs the recommended line.

## Acceptance criteria

- [ ] Authorable tree renders and is navigable.
- [ ] Each branch explains itself; correctness tracked per node.
- [ ] Line recap at the leaf.

## Dependencies & sequencing

Uses [Reasoning Gate](../flagship-reasoning-gate.md) and the
[Scenario Builder](26-scenario-builder-admin.md) for authoring.

## Out of scope

Auto-generated trees (authored first).
