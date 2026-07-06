import { TrainingMode } from "@/types/training";

/** Structured coaching output shared by every module (see PRD module 27). */
export interface CoachOutput {
  headline: string;
  reasons: string[];
  /** Contrast between the player's stated read and reality. */
  contrast?: string;
  /** Optional "show the math" detail lines. */
  math?: string[];
}

export interface CoachInput {
  mode: TrainingMode;
  correctDecision: boolean;
  headline: string;
  reasons: string[];
  /** Multi-select comparisons the coach turns into a contrast sentence. */
  reads?: ReadComparison[];
  math?: string[];
}

export interface ReadComparison {
  /** What the player was reading, e.g. "worse hands that call". */
  label: string;
  chosen: string[];
  correct: string[];
}

/** A coach provider so a future LLM backend can slot in (PRD module 27, phase 2). */
export interface CoachProvider {
  explain(input: CoachInput): CoachOutput;
}

function buildContrast(reads: ReadComparison[]): string | undefined {
  const parts: string[] = [];
  for (const read of reads) {
    const chosen = new Set(read.chosen);
    const correct = new Set(read.correct);
    const missed = read.correct.filter((x) => !chosen.has(x));
    const extra = read.chosen.filter((x) => !correct.has(x));
    if (missed.length === 0 && extra.length === 0) continue;
    const bits: string[] = [];
    if (missed.length) bits.push(`missed ${missed.join(", ")}`);
    if (extra.length) bits.push(`wrongly included ${extra.join(", ")}`);
    parts.push(`For ${read.label} you ${bits.join(" and ")}.`);
  }
  return parts.length ? parts.join(" ") : undefined;
}

/** Phase-1 deterministic coach: formats engine facts, no LLM required. */
export const deterministicCoach: CoachProvider = {
  explain(input) {
    return {
      headline: input.headline,
      reasons: input.reasons,
      contrast: input.reads ? buildContrast(input.reads) : undefined,
      math: input.math,
    };
  },
};

let activeProvider: CoachProvider = deterministicCoach;

/** Swap the coaching backend (e.g. an LLM provider) without touching modules. */
export function setCoachProvider(provider: CoachProvider): void {
  activeProvider = provider;
}

export function coach(input: CoachInput): CoachOutput {
  return activeProvider.explain(input);
}
