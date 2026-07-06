import { Texture } from "./boardTexture";

/** Discrete bet-size options offered across the app. */
export const BetSize = {
  Check: "check",
  Quarter: "1/4",
  Third: "1/3",
  Half: "1/2",
  TwoThirds: "2/3",
  ThreeQuarters: "3/4",
  Pot: "pot",
  Overbet: "overbet",
  AllIn: "all-in",
} as const;

export type BetSize = (typeof BetSize)[keyof typeof BetSize];

export const BET_SIZE_OPTIONS: BetSize[] = [
  BetSize.Check,
  BetSize.Quarter,
  BetSize.Third,
  BetSize.Half,
  BetSize.TwoThirds,
  BetSize.ThreeQuarters,
  BetSize.Pot,
  BetSize.Overbet,
  BetSize.AllIn,
];

export const BET_SIZE_LABEL: Record<BetSize, string> = {
  [BetSize.Check]: "Check",
  [BetSize.Quarter]: "1/4 Pot",
  [BetSize.Third]: "1/3 Pot",
  [BetSize.Half]: "1/2 Pot",
  [BetSize.TwoThirds]: "2/3 Pot",
  [BetSize.ThreeQuarters]: "3/4 Pot",
  [BetSize.Pot]: "Pot",
  [BetSize.Overbet]: "Overbet",
  [BetSize.AllIn]: "All-In",
};

/** Fraction of the pot each size represents (all-in modeled as large). */
export const BET_SIZE_FRACTION: Record<BetSize, number> = {
  [BetSize.Check]: 0,
  [BetSize.Quarter]: 0.25,
  [BetSize.Third]: 0.33,
  [BetSize.Half]: 0.5,
  [BetSize.TwoThirds]: 0.66,
  [BetSize.ThreeQuarters]: 0.75,
  [BetSize.Pot]: 1,
  [BetSize.Overbet]: 1.5,
  [BetSize.AllIn]: 3,
};

export const BetIntent = {
  Value: "value",
  Bluff: "bluff",
  SemiBluff: "semiBluff",
  Protection: "protection",
} as const;

export type BetIntent = (typeof BetIntent)[keyof typeof BetIntent];

export const BET_INTENT_LABEL: Record<BetIntent, string> = {
  [BetIntent.Value]: "Value",
  [BetIntent.Bluff]: "Bluff",
  [BetIntent.SemiBluff]: "Semi-Bluff",
  [BetIntent.Protection]: "Protection",
};

export interface SizingAdvice {
  recommended: BetSize[];
  explanation: string;
}

/**
 * Heuristic size recommendation from texture, intent and SPR. Deliberately
 * teaches the *logic* (wet -> bigger, dry -> smaller, polarized -> big/overbet)
 * rather than solver-exact frequencies.
 */
export function recommendSizes(
  texture: Texture,
  intent: BetIntent,
  sprValue: number,
): SizingAdvice {
  const wet = texture === Texture.Wet || texture === Texture.VeryWet;

  if (intent === BetIntent.Value) {
    if (wet) {
      return {
        recommended: [BetSize.TwoThirds, BetSize.ThreeQuarters],
        explanation:
          "Value betting on a wet board wants a larger size to charge the many draws and build the pot while ahead.",
      };
    }
    return {
      recommended: [BetSize.Third, BetSize.Half],
      explanation:
        "On a dry board worse hands rarely improve, so a smaller value size keeps weak calls in without folding them out.",
    };
  }

  if (intent === BetIntent.Protection) {
    return {
      recommended: [BetSize.Half, BetSize.TwoThirds],
      explanation:
        "Protection sizing denies equity to draws and overcards - big enough to make peeling a mistake.",
    };
  }

  if (intent === BetIntent.SemiBluff) {
    return {
      recommended: wet ? [BetSize.TwoThirds, BetSize.ThreeQuarters] : [BetSize.Half],
      explanation:
        "Semi-bluffing charges opponents to draw against you while giving you fold equity now and outs later.",
    };
  }

  // Pure bluff: polarize. Low SPR favors smaller/all-in leverage; deep favors overbets.
  if (sprValue >= 6) {
    return {
      recommended: [BetSize.ThreeQuarters, BetSize.Pot, BetSize.Overbet],
      explanation:
        "Deep-stacked pure bluffs are polarized - a big size or overbet maximizes fold equity when your range is capped-looking to them.",
    };
  }
  return {
    recommended: [BetSize.Half, BetSize.TwoThirds],
    explanation:
      "A pure bluff only needs to risk enough to generate the required folds; sizing up burns chips when smaller already folds them out.",
  };
}
