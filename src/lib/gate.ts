/** The Mandatory Reasoning Gate data model (see flagship PRD). */
export const GateStepId = {
  Position: "position",
  StackDepth: "stackDepth",
  HeroHand: "heroHand",
  BoardTexture: "boardTexture",
  HandStrength: "handStrength",
  VillainRange: "villainRange",
  WorseHandsCall: "worseHandsCall",
  BetterHandsContinue: "betterHandsContinue",
  Bluffs: "bluffs",
  Action: "action",
  ExplainWhy: "explainWhy",
} as const;

export type GateStepId = (typeof GateStepId)[keyof typeof GateStepId];

export const GATE_STEP_TITLE: Record<GateStepId, string> = {
  [GateStepId.Position]: "Position",
  [GateStepId.StackDepth]: "Stack depth",
  [GateStepId.HeroHand]: "Hero hand",
  [GateStepId.BoardTexture]: "Board texture",
  [GateStepId.HandStrength]: "Hero hand strength",
  [GateStepId.VillainRange]: "Villain range",
  [GateStepId.WorseHandsCall]: "What worse hands call?",
  [GateStepId.BetterHandsContinue]: "What better hands continue?",
  [GateStepId.Bluffs]: "What bluffs exist?",
  [GateStepId.Action]: "Choose action",
  [GateStepId.ExplainWhy]: "Explain WHY",
};

export const GateStepMode = {
  Required: "required",
  Prompted: "prompted",
  Hidden: "hidden",
} as const;

export type GateStepMode = (typeof GateStepMode)[keyof typeof GateStepMode];

export const GateInput = {
  SingleChoice: "single-choice",
  MultiSelect: "multi-select",
  Text: "text",
  Number: "number",
  RangeGrid: "range-grid",
} as const;

export type GateInput = (typeof GateInput)[keyof typeof GateInput];

export interface GateStepSpec {
  id: GateStepId;
  mode: GateStepMode;
  question: string;
  input: GateInput;
  options?: string[];
  correct?: string[];
  explanation: string;
  /** For multi-select gates that require at least N answers (e.g. value betting). */
  minSelections?: number;
}

export interface GateConfig {
  steps: GateStepSpec[];
  /** Strict mode requires correct answers, not just any answer, to proceed. */
  strict?: boolean;
}

export type GateAnswerValue = string[] | string | number;

export interface GateAnswer {
  stepId: GateStepId;
  value: GateAnswerValue;
}

export function isStepAnswered(spec: GateStepSpec, value: GateAnswerValue | undefined): boolean {
  if (value === undefined) return false;
  if (Array.isArray(value)) {
    const min = spec.minSelections ?? 1;
    return value.length >= min;
  }
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

export type GateAnswers = Partial<Record<GateStepId, GateAnswerValue>>;

/** True when every required step has a valid answer (strict: also correct). */
export function requiredSatisfied(config: GateConfig, answers: GateAnswers): boolean {
  return config.steps
    .filter((s) => s.mode === GateStepMode.Required)
    .every((s) => {
      const value = answers[s.id];
      if (!isStepAnswered(s, value)) return false;
      return config.strict ? isStepCorrect(s, value) : true;
    });
}

export function isStepCorrect(spec: GateStepSpec, value: GateAnswerValue | undefined): boolean {
  if (!spec.correct) return isStepAnswered(spec, value);
  const correct = new Set(spec.correct);
  if (Array.isArray(value)) {
    return value.length === correct.size && value.every((v) => correct.has(v));
  }
  if (value === undefined) return false;
  return correct.has(String(value));
}
